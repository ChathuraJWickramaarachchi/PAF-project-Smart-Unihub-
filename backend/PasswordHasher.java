import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHasher {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String plainPassword = "password123";
        String hashedPassword = encoder.encode(plainPassword);
        
        System.out.println("Plain Password: " + plainPassword);
        System.out.println("BCrypt Hash: " + hashedPassword);
    }
}
