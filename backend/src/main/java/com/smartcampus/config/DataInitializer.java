package com.smartcampus.config;

import com.smartcampus.entity.Role;
import com.smartcampus.entity.User;
import com.smartcampus.repository.RoleRepository;
import com.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Create default roles if they don't exist
        Role adminRole = roleRepository.findByRoleName("ADMIN")
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setRoleName("ADMIN");
                    role.setDescription("Administrator with full access");
                    return roleRepository.save(role);
                });
        
        Role userRole = roleRepository.findByRoleName("USER")
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setRoleName("USER");
                    role.setDescription("Standard user");
                    return roleRepository.save(role);
                });
        
        Role technicianRole = roleRepository.findByRoleName("TECHNICIAN")
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setRoleName("TECHNICIAN");
                    role.setDescription("Can manage support tickets");
                    return roleRepository.save(role);
                });

        Role managerRole = roleRepository.findByRoleName("MANAGER")
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setRoleName("MANAGER");
                    role.setDescription("Approvals and management");
                    return roleRepository.save(role);
                });

        // Create default admin user if doesn't exist
        if (userRepository.findByEmail("admin@smartuni.edu").isEmpty()) {
            User admin = new User();
            admin.setEmail("admin@smartuni.edu");
            admin.setFullName("System Administrator");
            admin.setPassword(passwordEncoder.encode("password123"));
            admin.setIsActive(true);
            admin.setRoles(Set.of(adminRole, userRole));
            
            userRepository.save(admin);
            System.out.println("✅ Default admin user created:");
            System.out.println("   Email: admin@smartuni.edu");
            System.out.println("   Password: password123");
        }

        // Create sample test user
        if (userRepository.findByEmail("user@smartuni.edu").isEmpty()) {
            User user = new User();
            user.setEmail("user@smartuni.edu");
            user.setFullName("Test User");
            user.setPassword(passwordEncoder.encode("password123"));
            user.setIsActive(true);
            user.setRoles(Set.of(userRole));
            
            userRepository.save(user);
            System.out.println("✅ Sample user created:");
            System.out.println("   Email: user@smartuni.edu");
            System.out.println("   Password: password123");
        }

        // Create sample technician user
        if (userRepository.findByEmail("tech@smartuni.edu").isEmpty()) {
            User tech = new User();
            tech.setEmail("tech@smartuni.edu");
            tech.setFullName("Test Technician");
            tech.setPassword(passwordEncoder.encode("password123"));
            tech.setIsActive(true);
            tech.setRoles(Set.of(technicianRole));
            tech.setApprovalStatus(User.ApprovalStatus.APPROVED); // Auto-approve for testing
            tech.setEmailVerified(true); // Mark as verified for testing
            
            userRepository.save(tech);
            System.out.println("✅ Sample technician created:");
            System.out.println("   Email: tech@smartuni.edu");
            System.out.println("   Password: password123");
            System.out.println("   Role: TECHNICIAN");
            System.out.println("   Status: APPROVED (2FA setup required on first login)");
        }

        // Create sample manager user
        if (userRepository.findByEmail("faculty@smartuni.edu").isEmpty()) {
            User manager = new User();
            manager.setEmail("faculty@smartuni.edu");
            manager.setFullName("Test Manager");
            manager.setPassword(passwordEncoder.encode("password123"));
            manager.setIsActive(true);
            manager.setRoles(Set.of(managerRole));
            manager.setApprovalStatus(User.ApprovalStatus.APPROVED); // Auto-approve for testing
            manager.setEmailVerified(true); // Mark as verified for testing
            
            userRepository.save(manager);
            System.out.println("✅ Sample manager created:");
            System.out.println("   Email: faculty@smartuni.edu");
            System.out.println("   Password: password123");
            System.out.println("   Role: MANAGER");
            System.out.println("   Status: APPROVED (2FA setup required on first login)");
        }
    }
}
