package com.smartcampus.controller;

import com.smartcampus.entity.Role;
import com.smartcampus.entity.User;
import com.smartcampus.repository.RoleRepository;
import com.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

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
                
                // Get user's role with priority (ADMIN > MANAGER > TECHNICIAN > USER)
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
                        if (!role.equals("USER")) {
                            break;
                        }
                    }
                }
                userMap.put("role", role);
                
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
            
            List<String> validRoles = Arrays.asList("ADMIN", "USER", "TECHNICIAN", "MANAGER");
            if (!validRoles.contains(newRole.toUpperCase())) {
                response.put("message", "Invalid role. Must be one of: ADMIN, USER, TECHNICIAN, MANAGER");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Find user
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Get or create the new role
            Role role = roleRepository.findByRoleName(newRole.toUpperCase())
                    .orElseGet(() -> {
                        Role newRoleEntity = new Role();
                        newRoleEntity.setRoleName(newRole.toUpperCase());
                        newRoleEntity.setDescription(newRole.toUpperCase() + " role");
                        return roleRepository.save(newRoleEntity);
                    });
            
            // Update user's role
            Set<Role> roles = new HashSet<>();
            roles.add(role);
            user.setRoles(roles);
            userRepository.save(user);
            
            response.put("message", "User role updated successfully");
            response.put("userId", userId.toString());
            response.put("newRole", newRole.toUpperCase());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Failed to update role: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
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
}
