package com.smartcampus.controller;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.entity.Role;
import com.smartcampus.entity.User;
import com.smartcampus.repository.RoleRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.GoogleOAuthService;
import com.smartcampus.service.TotpService;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private static final List<String> ROLE_PRIORITY = Arrays.asList("ADMIN", "MANAGER", "TECHNICIAN", "USER");

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private GoogleOAuthService googleOAuthService;

    @Autowired
    private TotpService totpService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        
        // Find user by email
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Invalid email or password");
            return ResponseEntity.status(401).body(errorResponse);
        }
        
        // Check if user is active
        if (!user.getIsActive()) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Account is deactivated");
            return ResponseEntity.status(403).body(errorResponse);
        }
        
        // Check approval status for MANAGER/TECHNICIAN
        if (user.getApprovalStatus() == User.ApprovalStatus.PENDING_APPROVAL) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Your account is pending admin approval. Please wait for approval email.");
            errorResponse.put("approvalStatus", "PENDING");
            return ResponseEntity.status(403).body(errorResponse);
        }
        
        if (user.getApprovalStatus() == User.ApprovalStatus.REJECTED) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Your account has been rejected. Please contact admin for more information.");
            errorResponse.put("approvalStatus", "REJECTED");
            return ResponseEntity.status(403).body(errorResponse);
        }
        
        // Verify password
        if (!passwordEncoder.matches(password, user.getPassword())) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Invalid email or password");
            return ResponseEntity.status(401).body(errorResponse);
        }
        
        // Determine the user's primary role
        String role = resolvePrimaryRole(user);
        
        // Check if 2FA is required for this role (MANAGER or TECHNICIAN)
        boolean requires2FA = role.equalsIgnoreCase("MANAGER") || role.equalsIgnoreCase("TECHNICIAN");
        
        if (requires2FA) {
            // Generate a temporary token (not a full auth token)
            String tempToken = "2fa_" + System.currentTimeMillis() + "_" + user.getId();
            
            if (user.getTwoFactorEnabled() == null || !user.getTwoFactorEnabled()) {
                // First time: generate a new TOTP secret and return QR code URI
                String secret = totpService.generateSecret();
                // Store the secret on the user (not yet enabled)
                user.setTotpSecret(secret);
                userRepository.save(user);
                
                String qrCodeUri = totpService.getQrCodeUri(secret, user.getEmail());
                
                Map<String, String> response = new HashMap<>();
                response.put("requires2FASetup", "true");
                response.put("tempToken", tempToken);
                response.put("qrCodeUrl", qrCodeUri);
                response.put("secret", secret);
                response.put("message", "Please set up two-factor authentication");
                return ResponseEntity.ok(response);
            } else {
                // Already set up: just ask for code
                Map<String, String> response = new HashMap<>();
                response.put("requires2FA", "true");
                response.put("tempToken", tempToken);
                response.put("message", "Two-factor authentication required");
                return ResponseEntity.ok(response);
            }
        }
        
        // For USER/ADMIN: issue full token immediately (no 2FA)
        String token = System.currentTimeMillis() + "_" + user.getId();
        
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("message", "Login successful");
        response.put("email", user.getEmail());
        response.put("fullName", user.getFullName());
        response.put("role", role);
        response.put("userId", user.getId());
        response.put("approvalStatus", user.getApprovalStatus().toString());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/2fa/verify-setup")
    public ResponseEntity<Map<String, String>> verify2FASetup(@RequestBody Map<String, String> body) {
        String tempToken = body.get("tempToken");
        String code = body.get("code");
        
        // Extract userId from tempToken (format: 2fa_timestamp_userId)
        String userId = extract2FAUserId(tempToken);
        if (userId == null) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Invalid or expired verification session");
            return ResponseEntity.status(401).body(errorResponse);
        }
        
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "User not found");
            return ResponseEntity.status(404).body(errorResponse);
        }
        
        String secret = user.getTotpSecret();
        if (secret == null || secret.isEmpty()) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "2FA setup not initiated. Please login again.");
            return ResponseEntity.status(400).body(errorResponse);
        }
        
        // Verify the code
        if (!totpService.verifyCode(secret, code)) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Invalid verification code. Please try again.");
            return ResponseEntity.status(401).body(errorResponse);
        }
        
        // Enable 2FA on the user
        user.setTwoFactorEnabled(true);
        userRepository.save(user);
        
        // Issue full auth token
        return ResponseEntity.ok(buildFullLoginResponse(user));
    }

    @PostMapping("/2fa/verify")
    public ResponseEntity<Map<String, String>> verify2FA(@RequestBody Map<String, String> body) {
        String tempToken = body.get("tempToken");
        String code = body.get("code");
        
        String userId = extract2FAUserId(tempToken);
        if (userId == null) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Invalid or expired verification session");
            return ResponseEntity.status(401).body(errorResponse);
        }
        
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "User not found");
            return ResponseEntity.status(404).body(errorResponse);
        }
        
        String secret = user.getTotpSecret();
        if (secret == null || secret.isEmpty()) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "2FA is not configured for this account");
            return ResponseEntity.status(400).body(errorResponse);
        }
        
        if (!totpService.verifyCode(secret, code)) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Invalid verification code. Please try again.");
            return ResponseEntity.status(401).body(errorResponse);
        }
        
        return ResponseEntity.ok(buildFullLoginResponse(user));
    }

    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> signup(@RequestBody Map<String, String> userData) {
        String fullName = userData.get("fullName");
        String email = userData.get("email");
        String password = userData.get("password");
        String phoneNumber = userData.get("phoneNumber");
        String role = userData.get("role");
        
        // Check if email already exists
        if (userRepository.findByEmail(email).isPresent()) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Email already exists");
            return ResponseEntity.badRequest().body(errorResponse);
        }
        
        // Create new user
        User newUser = new User();
        newUser.setFullName(fullName);
        newUser.setEmail(email);
        newUser.setPassword(passwordEncoder.encode(password));
        newUser.setPhoneNumber(phoneNumber);
        newUser.setIsActive(true);
        newUser.setCreatedAt(java.time.LocalDateTime.now());
        newUser.setUpdatedAt(java.time.LocalDateTime.now());
        
        // Assign role and approval status
        String userRole = role != null ? role : "USER";
        
        // Set approval status based on role: USER auto-approved, MANAGER/TECHNICIAN need approval
        if ("MANAGER".equals(userRole) || "TECHNICIAN".equals(userRole)) {
            newUser.setApprovalStatus(User.ApprovalStatus.PENDING_APPROVAL);
            newUser.setRequestedRole(userRole);
        } else {
            newUser.setApprovalStatus(User.ApprovalStatus.APPROVED);
        }
        
        // Get or create role
        Role newUserRole = roleRepository.findByRoleName(userRole)
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setRoleName(userRole);
                    newRole.setDescription(userRole + " role");
                    return roleRepository.save(newRole);
                });
        
        Set<Role> roles = new HashSet<>();
        roles.add(newUserRole);
        newUser.setRoles(roles);
        
        userRepository.save(newUser);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "User registered successfully");
        response.put("email", email);
        response.put("fullName", fullName);
        if ("MANAGER".equals(userRole) || "TECHNICIAN".equals(userRole)) {
            response.put("approvalRequired", "true");
            response.put("approvalMessage", "Your account requires admin approval. You will be notified once approved.");
        } else {
            response.put("approvalRequired", "false");
            response.put("approvalMessage", "Your account is active. You can login immediately.");
        }
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/google-login")
    public ResponseEntity<Map<String, String>> googleLogin(@RequestBody Map<String, String> googleUserData) {
        try {
            String idToken = googleUserData.get("idToken");
            String requestedRole = googleUserData.get("requestedRole");
            
            System.out.println("Received Google login request with token length: " + (idToken != null ? idToken.length() : 0));
            System.out.println("Requested role: " + requestedRole);
            
            if (idToken == null || idToken.isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Invalid Google ID token - no token provided");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Verify Google token using production OAuth service
            GoogleOAuthService.GoogleUserInfo userInfo;
            try {
                userInfo = googleOAuthService.verifyGoogleToken(idToken);
            } catch (Exception e) {
                System.err.println("Google token verification failed: " + e.getMessage());
                e.printStackTrace();
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Invalid Google token: " + e.getMessage());
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            if (userInfo == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Failed to verify Google token - invalid token format");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            String email = userInfo.getEmail();
            String name = userInfo.getName();
            String googleId = userInfo.getGoogleId();
            String pictureUrl = userInfo.getPictureUrl();
            
            // Find existing user by email or Google ID
            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> {
                        // Create new user if not exists
                        User newUser = new User();
                        newUser.setEmail(email);
                        newUser.setFullName(name);
                        newUser.setGoogleId(googleId);
                        newUser.setProfilePictureUrl(pictureUrl);
                        newUser.setPassword(""); // No password for Google users
                        newUser.setIsActive(true);
                        return newUser;
                    });
            
            // Force load user with roles from database
            if (user.getId() != null) {
                user = userRepository.findById(user.getId())
                        .orElseThrow(() -> new RuntimeException("User not found after lookup"));
            }
            
            // Save user first if new
            if (user.getId() == null) {
                user = userRepository.save(user);
                
                // Assign requested role or default USER role (only for NEW users)
                final String roleToAssign;
                if (requestedRole != null && !requestedRole.isEmpty()) {
                    // Validate the requested role
                    List<String> validRoles = Arrays.asList("ADMIN", "USER", "TECHNICIAN", "MANAGER");
                    if (validRoles.contains(requestedRole.toUpperCase())) {
                        roleToAssign = requestedRole.toUpperCase();
                    } else {
                        roleToAssign = "USER";
                    }
                } else {
                    roleToAssign = "USER";
                }
                
                System.out.println("Creating NEW user with role: " + roleToAssign);
                
                Role userRole = roleRepository.findByRoleName(roleToAssign)
                        .orElseGet(() -> {
                            Role newRole = new Role();
                            newRole.setRoleName(roleToAssign);
                            newRole.setDescription(roleToAssign + " role with " + roleToAssign.toLowerCase() + " access");
                            return roleRepository.save(newRole);
                        });
                
                Set<Role> roles = new HashSet<>();
                roles.add(userRole);
                user.setRoles(roles);
                user = userRepository.save(user);
            } else {
                // EXISTING user - DO NOT allow role changes via OAuth login
                // Roles can only be changed by admin through user management
                String existingRole = "USER";
                if (user.getRoles() != null && !user.getRoles().isEmpty()) {
                    existingRole = user.getRoles().iterator().next().getRoleName();
                }
                
                System.out.println("===========================================");
                System.out.println("EXISTING USER LOGIN DETECTED!");
                System.out.println("User ID: " + user.getId());
                System.out.println("Email: " + email);
                System.out.println("Existing Role: " + existingRole);
                System.out.println("Requested Role: " + requestedRole);
                System.out.println("Action: Keeping existing role (NO CHANGE)");
                System.out.println("===========================================");
                
                // Ensure user keeps their existing role (do NOT update)
                // The roles are already loaded from database, so no action needed
            }
            
            if (!user.getIsActive()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Account is deactivated");
                return ResponseEntity.status(403).body(errorResponse);
            }
            
            // Update Google ID and profile picture if user existed but didn't have it
            boolean userUpdated = false;
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleId);
                userUpdated = true;
            }
            if (user.getProfilePictureUrl() == null && pictureUrl != null) {
                user.setProfilePictureUrl(pictureUrl);
                userUpdated = true;
            }
            if (userUpdated) {
                user = userRepository.save(user);
            }
            
            // Generate JWT token (simple format without 'Bearer_' prefix)
            String token = System.currentTimeMillis() + "_" + user.getId();
            
            String role = resolvePrimaryRole(user);
            
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            response.put("message", "Google login successful");
            response.put("email", user.getEmail());
            response.put("fullName", user.getFullName());
            response.put("role", role);
            response.put("userId", user.getId());
            response.put("profilePictureUrl", user.getProfilePictureUrl() != null ? user.getProfilePictureUrl() : pictureUrl);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Google login failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "API is running");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logout successful");
        return ResponseEntity.ok(response);
    }

    private String resolvePrimaryRole(User user) {
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            return "USER";
        }

        Set<String> userRoleNames = new HashSet<>();
        for (Role role : user.getRoles()) {
            if (role != null && role.getRoleName() != null) {
                userRoleNames.add(role.getRoleName().toUpperCase());
            }
        }

        for (String roleName : ROLE_PRIORITY) {
            if (userRoleNames.contains(roleName)) {
                return roleName;
            }
        }

        Role firstRole = user.getRoles().iterator().next();
        return firstRole != null && firstRole.getRoleName() != null
                ? firstRole.getRoleName().toUpperCase()
                : "USER";
    }

    /**
     * Build a full login response map with token and user details.
     */
    private Map<String, String> buildFullLoginResponse(User user) {
        String token = System.currentTimeMillis() + "_" + user.getId();
        String role = resolvePrimaryRole(user);
        
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("message", "Login successful");
        response.put("email", user.getEmail());
        response.put("fullName", user.getFullName());
        response.put("role", role);
        response.put("userId", user.getId());
        response.put("approvalStatus", user.getApprovalStatus().toString());
        return response;
    }

    /**
     * Extract userId from a 2FA temp token (format: 2fa_timestamp_userId).
     */
    private String extract2FAUserId(String tempToken) {
        if (tempToken == null || !tempToken.startsWith("2fa_")) {
            return null;
        }
        try {
            // format: 2fa_<timestamp>_<userId>
            String withoutPrefix = tempToken.substring(4); // remove "2fa_"
            int firstUnderscore = withoutPrefix.indexOf('_');
            if (firstUnderscore < 0) return null;
            
            String timestampStr = withoutPrefix.substring(0, firstUnderscore);
            String userId = withoutPrefix.substring(firstUnderscore + 1);
            
            // Check token age (valid for 10 minutes)
            long timestamp = Long.parseLong(timestampStr);
            long age = System.currentTimeMillis() - timestamp;
            if (age > 10 * 60 * 1000) {
                return null; // expired
            }
            
            return userId;
        } catch (Exception e) {
            return null;
        }
    }
}
