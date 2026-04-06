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
                .orElseGet(() -> roleRepository.save(new Role(null, "ADMIN", "Administrator with full access")));
        
        Role userRole = roleRepository.findByRoleName("USER")
                .orElseGet(() -> roleRepository.save(new Role(null, "USER", "Standard user")));
        
        Role technicianRole = roleRepository.findByRoleName("TECHNICIAN")
                .orElseGet(() -> roleRepository.save(new Role(null, "TECHNICIAN", "Can manage support tickets")));

        // Create default admin user if doesn't exist
        if (userRepository.findByEmail("admin@smartcampus.edu").isEmpty()) {
            User admin = new User();
            admin.setEmail("admin@smartcampus.edu");
            admin.setFullName("System Administrator");
            admin.setPassword(passwordEncoder.encode("password123"));
            admin.setIsActive(true);
            admin.setRoles(Set.of(adminRole, userRole));
            
            userRepository.save(admin);
            System.out.println("✅ Default admin user created:");
            System.out.println("   Email: admin@smartcampus.edu");
            System.out.println("   Password: password123");
        }

        // Create sample test user
        if (userRepository.findByEmail("user@smartcampus.edu").isEmpty()) {
            User user = new User();
            user.setEmail("user@smartcampus.edu");
            user.setFullName("Test User");
            user.setPassword(passwordEncoder.encode("password123"));
            user.setIsActive(true);
            user.setRoles(Set.of(userRole));
            
            userRepository.save(user);
            System.out.println("✅ Sample user created:");
            System.out.println("   Email: user@smartcampus.edu");
            System.out.println("   Password: password123");
        }
    }
}
