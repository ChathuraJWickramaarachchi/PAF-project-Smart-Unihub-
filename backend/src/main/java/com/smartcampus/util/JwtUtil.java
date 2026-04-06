package com.smartcampus.util;

import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

    /**
     * Extract user ID from JWT token
     * For demo purposes - extracts ID from token format: "Bearer_timestamp_id"
     */
    public Long getUserIdFromToken(String token) {
        if (token == null || token.isEmpty()) {
            return null;
        }
        
        // Remove "Bearer_" prefix if present
        String cleanToken = token.startsWith("Bearer_") ? token.substring(7) : token;
        
        // Token format: timestamp_id
        try {
            String[] parts = cleanToken.split("_");
            if (parts.length >= 2) {
                return Long.parseLong(parts[parts.length - 1]);
            }
        } catch (Exception e) {
            // Invalid token format
            return null;
        }
        
        return null;
    }

    /**
     * Validate JWT token
     */
    public boolean validateToken(String token) {
        return getUserIdFromToken(token) != null;
    }
}
