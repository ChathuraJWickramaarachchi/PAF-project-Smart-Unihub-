package com.smartcampus.controller;

import com.smartcampus.entity.Role;
import com.smartcampus.entity.User;
import com.smartcampus.repository.RoleRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.NotificationService;
import com.smartcampus.entity.Notification.NotificationType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    private static final List<String> ROLE_PRIORITY = Arrays.asList("ADMIN", "MANAGER", "TECHNICIAN", "USER");

    private static final Map<String, Map<String, String>> ROLE_META = createRoleMeta();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private NotificationService notificationService;

    /**
     * Get all users (Admin only)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            List<Map<String, Object>> response = new ArrayList<>();

            for (User user : users) {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("userId", user.getId());
                userMap.put("email", user.getEmail());
                userMap.put("fullName", user.getFullName());
                userMap.put("isActive", user.getIsActive());
                userMap.put("googleId", user.getGoogleId());
                userMap.put("profilePictureUrl", user.getProfilePictureUrl());
                
                String role = resolvePrimaryRole(user);
                userMap.put("role", role);
                userMap.put("roleLabel", getRoleLabel(role));
                userMap.put("roleBadgeClass", getRoleBadgeClass(role));
                
                System.out.println("User: " + user.getEmail() + " | Role: " + role);
                response.add(userMap);
            }

            System.out.println("Returning " + response.size() + " users");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get assignable role options (Admin only).
     */
    @GetMapping("/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, String>>> getAssignableRoles() {
        List<Map<String, String>> roleOptions = new ArrayList<>();

        for (String roleName : ROLE_PRIORITY) {
            Map<String, String> role = new HashMap<>();
            role.put("value", roleName);
            role.put("label", getRoleLabel(roleName));
            role.put("badgeClass", getRoleBadgeClass(roleName));

            String description = roleRepository.findByRoleName(roleName)
                    .map(Role::getDescription)
                    .orElseGet(() -> getRoleDescription(roleName));
            role.put("description", description);
            roleOptions.add(role);
        }

        return ResponseEntity.ok(roleOptions);
    }

    /**
     * Get all users pending approval (Admin only)
     */
    @GetMapping("/pending-approvals")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getPendingApprovals() {
        try {
            List<User> pendingUsers = userRepository.findByApprovalStatus(User.ApprovalStatus.PENDING_APPROVAL);
            List<Map<String, Object>> result = new ArrayList<>();
            
            for (User user : pendingUsers) {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("fullName", user.getFullName());
                userMap.put("email", user.getEmail());
                userMap.put("phoneNumber", user.getPhoneNumber());
                userMap.put("requestedRole", user.getRequestedRole());
                userMap.put("createdAt", user.getCreatedAt());
                result.add(userMap);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Approve a user's signup request (Admin only)
     */
    @PostMapping("/{userId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> approveUser(
            @PathVariable String userId,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        Map<String, String> response = new HashMap<>();
        
        try {
            // Extract admin user ID from token
            String adminUserId = extractUserIdFromToken(token);
            
            User userToApprove = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (userToApprove.getApprovalStatus() != User.ApprovalStatus.PENDING_APPROVAL) {
                response.put("message", "User is not pending approval");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Assign the requested role
            String requestedRole = userToApprove.getRequestedRole() != null 
                ? userToApprove.getRequestedRole() 
                : "USER";
            
            Role role = roleRepository.findByRoleName(requestedRole)
                    .orElseGet(() -> {
                        Role newRole = new Role();
                        newRole.setRoleName(requestedRole);
                        newRole.setDescription(requestedRole + " role");
                        return roleRepository.save(newRole);
                    });
            
            Set<Role> roles = new HashSet<>();
            roles.add(role);
            userToApprove.setRoles(roles);
            userToApprove.setApprovalStatus(User.ApprovalStatus.APPROVED);
            userToApprove.setApprovedBy(adminUserId);
            userToApprove.setApprovalDate(LocalDateTime.now());
            
            userRepository.save(userToApprove);
            
            // Send notification to approved user
            notificationService.createNotification(
                userId,
                "Account Approved",
                "Your " + requestedRole + " account has been approved. You can now login.",
                NotificationType.SYSTEM_NOTIFICATION,
                "USER",
                userId
            );
            
            response.put("message", "User approved successfully");
            response.put("userId", userId);
            response.put("email", userToApprove.getEmail());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Failed to approve user: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Reject a user's signup request (Admin only)
     */
    @PostMapping("/{userId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> rejectUser(
            @PathVariable String userId,
            @RequestBody Map<String, String> data,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        Map<String, String> response = new HashMap<>();
        
        try {
            // Extract admin user ID from token
            String adminUserId = extractUserIdFromToken(token);
            
            User userToReject = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (userToReject.getApprovalStatus() != User.ApprovalStatus.PENDING_APPROVAL) {
                response.put("message", "User is not pending approval");
                return ResponseEntity.badRequest().body(response);
            }
            
            String rejectionReason = data.getOrDefault("reason", "Your account has been rejected.");
            
            // Update user status
            userToReject.setApprovalStatus(User.ApprovalStatus.REJECTED);
            userToReject.setApprovedBy(adminUserId);
            userToReject.setApprovalDate(LocalDateTime.now());
            
            userRepository.save(userToReject);
            
            // Send notification to rejected user
            notificationService.createNotification(
                userId,
                "Account Rejected",
                "Your account request has been rejected. Reason: " + rejectionReason,
                NotificationType.SYSTEM_NOTIFICATION,
                "USER",
                userId
            );
            
            response.put("message", "User rejected successfully");
            response.put("userId", userId);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Failed to reject user: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Update user role (Admin only)
     */
    @PutMapping("/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> updateUserRole(
            @PathVariable String userId,
            @RequestBody Map<String, String> roleData) {
        
        Map<String, String> response = new HashMap<>();
        
        try {
            String newRole = roleData.get("role");
            
            // Validate role
            if (newRole == null || newRole.isEmpty()) {
                response.put("message", "Role is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            String normalizedRole = newRole.toUpperCase();

            if (!ROLE_META.containsKey(normalizedRole)) {
                response.put("message", "Invalid role. Must be one of: ADMIN, MANAGER, TECHNICIAN, USER");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Find user
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Get or create the new role
            Role role = roleRepository.findByRoleName(normalizedRole)
                    .orElseGet(() -> {
                        Role newRoleEntity = new Role();
                        newRoleEntity.setRoleName(normalizedRole);
                        newRoleEntity.setDescription(getRoleDescription(normalizedRole));
                        return roleRepository.save(newRoleEntity);
                    });
            
            // Update user's role
            Set<Role> roles = new HashSet<>();
            roles.add(role);
            user.setRoles(roles);
            userRepository.save(user);
            
            response.put("message", "User role updated successfully");
            response.put("userId", userId.toString());
            response.put("newRole", normalizedRole);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Failed to update role: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    private String resolvePrimaryRole(User user) {
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            return "USER";
        }

        Set<String> userRoleNames = new HashSet<>();
        for (Role userRole : user.getRoles()) {
            if (userRole != null && userRole.getRoleName() != null) {
                userRoleNames.add(userRole.getRoleName().toUpperCase());
            }
        }

        for (String roleName : ROLE_PRIORITY) {
            if (userRoleNames.contains(roleName)) {
                return roleName;
            }
        }

        return "USER";
    }

    private String getRoleLabel(String roleName) {
        return ROLE_META.getOrDefault(roleName, ROLE_META.get("USER")).get("label");
    }

    private String getRoleBadgeClass(String roleName) {
        return ROLE_META.getOrDefault(roleName, ROLE_META.get("USER")).get("badgeClass");
    }

    private String getRoleDescription(String roleName) {
        return ROLE_META.getOrDefault(roleName, ROLE_META.get("USER")).get("description");
    }

    private static Map<String, Map<String, String>> createRoleMeta() {
        Map<String, Map<String, String>> meta = new HashMap<>();

        Map<String, String> admin = new HashMap<>();
        admin.put("label", "Admin");
        admin.put("badgeClass", "bg-rose-500 text-white shadow-rose-200");
        admin.put("description", "Administrator with full access");
        meta.put("ADMIN", admin);

        Map<String, String> manager = new HashMap<>();
        manager.put("label", "Manager");
        manager.put("badgeClass", "bg-amber-500 text-white shadow-amber-200");
        manager.put("description", "Approvals and management");
        meta.put("MANAGER", manager);

        Map<String, String> technician = new HashMap<>();
        technician.put("label", "Technician");
        technician.put("badgeClass", "bg-blue-500 text-white shadow-blue-200");
        technician.put("description", "Can manage support tickets");
        meta.put("TECHNICIAN", technician);

        Map<String, String> user = new HashMap<>();
        user.put("label", "User");
        user.put("badgeClass", "bg-gray-500 text-white shadow-gray-200");
        user.put("description", "Standard user");
        meta.put("USER", user);

        return meta;
    }

    /**
     * Activate/Deactivate user (Admin only)
     */
    @PutMapping("/{userId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> updateUserStatus(
            @PathVariable String userId,
            @RequestBody Map<String, Boolean> statusData) {
        
        Map<String, String> response = new HashMap<>();
        
        try {
            Boolean isActive = statusData.get("isActive");
            
            if (isActive == null) {
                response.put("message", "Status is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            user.setIsActive(isActive);
            userRepository.save(user);
            
            response.put("message", "User status updated successfully");
            response.put("userId", userId.toString());
            response.put("isActive", isActive.toString());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Failed to update status: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Delete user (Admin only)
     */
    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable String userId) {
        Map<String, String> response = new HashMap<>();
        
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Prevent deleting yourself
            // (This check would need the current user's ID from security context in production)
            
            userRepository.delete(user);
            
            response.put("message", "User deleted successfully");
            response.put("userId", userId.toString());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Failed to delete user: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    private String extractUserIdFromToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        // Token format: timestamp_userId
        if (token != null) {
            String[] parts = token.split("_");
            return parts.length > 1 ? parts[1] : null;
        }
        return null;
    }

    private boolean isAdmin(User user) {
        return user.getRoles().stream()
                .anyMatch(role -> "ADMIN".equals(role.getRoleName()));
    }
}
