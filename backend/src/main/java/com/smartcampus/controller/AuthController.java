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

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private GoogleOAuthService googleOAuthService;

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
        
        // Verify password
        if (!passwordEncoder.matches(password, user.getPassword())) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Invalid email or password");
            return ResponseEntity.status(401).body(errorResponse);
        }
        
        // Generate simple JWT-like token (for demo purposes)
        String token = System.currentTimeMillis() + "_" + user.getId();
        
        // Get user's primary role (prioritize ADMIN > MANAGER > TECHNICIAN > USER)
        String role = "USER";
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            List<String> rolePriority = Arrays.asList("ADMIN", "MANAGER", "TECHNICIAN", "USER");
            for (String roleName : rolePriority) {
                for (Role userRole : user.getRoles()) {
                    if (userRole.getRoleName().equals(roleName)) {
                        role = roleName;
                        break;
                    }
                }
                if (!role.equals("USER")) break;
            }
            
            // Fallback to first role if no priority match found
            if (role.equals("USER")) {
                role = user.getRoles().iterator().next().getRoleName();
            }
        }
        
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("message", "Login successful");
        response.put("email", user.getEmail());
        response.put("fullName", user.getFullName());
        response.put("role", role);
        response.put("userId", user.getId());
        
        return ResponseEntity.ok(response);
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
        
        // Assign role
        String userRole = role != null ? role : "USER";
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
            
            // Get user's primary role (prioritize ADMIN > MANAGER > TECHNICIAN > USER)
            String role = "USER";
            if (user.getRoles() != null && !user.getRoles().isEmpty()) {
                // Priority order: ADMIN > MANAGER > TECHNICIAN > USER
                List<String> rolePriority = Arrays.asList("ADMIN", "MANAGER", "TECHNICIAN", "USER");
                
                for (String roleName : rolePriority) {
                    for (Role userRole : user.getRoles()) {
                        if (userRole.getRoleName().equals(roleName)) {
                            role = roleName;
                            break;
                        }
                    }
                    if (!role.equals("USER")) {
                        break;
                    }
                }
                
                // If no match found, use first role
                if (role.equals("USER")) {
                    role = user.getRoles().iterator().next().getRoleName();
                }
            }
            
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
}
