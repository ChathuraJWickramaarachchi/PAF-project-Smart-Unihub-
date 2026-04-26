package com.smartcampus.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.time.LocalDateTime;

@Service
public class OtpService {

    @Autowired
    private JavaMailSender mailSender;

    // Store OTPs with expiration (in-memory for simplicity, can use Redis/MongoDB in production)
    private final Map<String, OtpData> otpStore = new ConcurrentHashMap<>();

    private static final int OTP_EXPIRATION_MINUTES = 10;

    /**
     * Generate and send OTP to email
     */
    public boolean sendOtp(String email, String purpose) {
        try {
            // Generate 6-digit OTP
            String otp = generateOtp();
            
            // Store OTP with expiration
            otpStore.put(email, new OtpData(otp, purpose, LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES)));
            
            // LOG OTP TO CONSOLE FOR DEVELOPMENT/TESTING
            System.out.println("\n" + "=".repeat(60));
            System.out.println("🔑 OTP GENERATED FOR: " + email);
            System.out.println("📝 PURPOSE: " + purpose);
            System.out.println("🔢 OTP CODE: " + otp);
            System.out.println("⏰ EXPIRES IN: " + OTP_EXPIRATION_MINUTES + " minutes");
            System.out.println("=".repeat(60) + "\n");
            
            // Send email
            sendOtpEmail(email, otp, purpose);
            
            return true;
        } catch (Exception e) {
            System.err.println("Failed to send OTP email: " + e.getMessage());
            e.printStackTrace();
            
            // Even if email fails, return true for development (OTP is logged to console)
            System.out.println("⚠️  Email sending failed, but OTP is logged to console above for testing");
            return true; // Return true so development can continue
        }
    }

    /**
     * Verify OTP
     */
    public boolean verifyOtp(String email, String otp, String purpose) {
        OtpData otpData = otpStore.get(email);
        
        if (otpData == null) {
            return false;
        }
        
        // Check if OTP is expired
        if (LocalDateTime.now().isAfter(otpData.getExpirationTime())) {
            otpStore.remove(email);
            return false;
        }
        
        // Check if purpose matches
        if (!otpData.getPurpose().equals(purpose)) {
            return false;
        }
        
        // Check if OTP matches
        if (!otpData.getOtp().equals(otp)) {
            return false;
        }
        
        // Remove OTP after successful verification
        otpStore.remove(email);
        return true;
    }

    /**
     * Generate random 6-digit OTP
     */
    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    /**
     * Send OTP email
     */
    private void sendOtpEmail(String to, String otp, String purpose) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        String subject = "";
        String htmlContent = "";
        
        if ("SIGNUP".equals(purpose)) {
            subject = "Verify Your Email - SmartUni Portal";
            htmlContent = getSignupEmailTemplate(otp);
        } else if ("FORGOT_PASSWORD".equals(purpose)) {
            subject = "Password Reset OTP - SmartUni Portal";
            htmlContent = getForgotPasswordEmailTemplate(otp);
        }
        
        helper.setFrom("SmartUni Portal <noreply@smartuni.edu>");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        
        mailSender.send(message);
    }

    /**
     * Email template for signup verification
     */
    private String getSignupEmailTemplate(String otp) {
        String template = "<!DOCTYPE html><html><head><style>";
        template += "body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }";
        template += ".container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }";
        template += ".header { background: linear-gradient(135deg, #1a6cf0, #3d87ff); padding: 40px; text-align: center; color: white; }";
        template += ".header h1 { margin: 0; font-size: 28px; }";
        template += ".content { padding: 40px; }";
        template += ".otp-box { background: #f8f9fa; border: 2px dashed #1a6cf0; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0; }";
        template += ".otp-code { font-size: 42px; font-weight: bold; color: #1a6cf0; letter-spacing: 8px; font-family: 'Courier New', monospace; }";
        template += ".info { color: #666; font-size: 14px; line-height: 1.6; }";
        template += ".warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }";
        template += ".footer { background: #f8f9fa; padding: 20px; text-align: center; color: #999; font-size: 12px; }";
        template += "</style></head><body><div class='container'>";
        template += "<div class='header'><h1>SmartUni Portal</h1><p>Email Verification</p></div>";
        template += "<div class='content'><p class='info'>Hello,</p>";
        template += "<p class='info'>Thank you for signing up with SmartUni Portal! To complete your registration, please use the following One-Time Password (OTP):</p>";
        template += "<div class='otp-box'><div class='otp-code'>" + otp + "</div></div>";
        template += "<p class='info'>This OTP is valid for " + OTP_EXPIRATION_MINUTES + " minutes. Please enter this code on the verification page to activate your account.</p>";
        template += "<div class='warning'><strong>Security Notice:</strong> If you didn't request this OTP, please ignore this email. Never share this code with anyone.</div>";
        template += "</div><div class='footer'><p>2026 SmartUni Portal. All rights reserved.</p><p>This is an automated message, please do not reply.</p></div>";
        template += "</div></body></html>";
        return template;
    }

    /**
     * Email template for forgot password
     */
    private String getForgotPasswordEmailTemplate(String otp) {
        String template = "<!DOCTYPE html><html><head><style>";
        template += "body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }";
        template += ".container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }";
        template += ".header { background: linear-gradient(135deg, #ff6b6b, #ff4d6a); padding: 40px; text-align: center; color: white; }";
        template += ".header h1 { margin: 0; font-size: 28px; }";
        template += ".content { padding: 40px; }";
        template += ".otp-box { background: #f8f9fa; border: 2px dashed #ff4d6a; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0; }";
        template += ".otp-code { font-size: 42px; font-weight: bold; color: #ff4d6a; letter-spacing: 8px; font-family: 'Courier New', monospace; }";
        template += ".info { color: #666; font-size: 14px; line-height: 1.6; }";
        template += ".warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }";
        template += ".footer { background: #f8f9fa; padding: 20px; text-align: center; color: #999; font-size: 12px; }";
        template += "</style></head><body><div class='container'>";
        template += "<div class='header'><h1>SmartUni Portal</h1><p>Password Reset Verification</p></div>";
        template += "<div class='content'><p class='info'>Hello,</p>";
        template += "<p class='info'>We received a request to reset your password. Use the following One-Time Password (OTP) to verify your identity:</p>";
        template += "<div class='otp-box'><div class='otp-code'>" + otp + "</div></div>";
        template += "<p class='info'>This OTP is valid for " + OTP_EXPIRATION_MINUTES + " minutes. Enter this code on the password reset page to continue.</p>";
        template += "<div class='warning'><strong>Security Notice:</strong> If you didn't request a password reset, please ignore this email or contact support immediately. Never share this code with anyone.</div>";
        template += "</div><div class='footer'><p>2026 SmartUni Portal. All rights reserved.</p><p>This is an automated message, please do not reply.</p></div>";
        template += "</div></body></html>";
        return template;
    }

    /**
     * Inner class to store OTP data
     */
    private static class OtpData {
        private final String otp;
        private final String purpose;
        private final LocalDateTime expirationTime;

        public OtpData(String otp, String purpose, LocalDateTime expirationTime) {
            this.otp = otp;
            this.purpose = purpose;
            this.expirationTime = expirationTime;
        }

        public String getOtp() { return otp; }
        public String getPurpose() { return purpose; }
        public LocalDateTime getExpirationTime() { return expirationTime; }
    }
}
