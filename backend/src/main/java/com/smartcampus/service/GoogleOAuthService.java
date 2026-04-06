package com.smartcampus.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

@Service
public class GoogleOAuthService {

    private static final HttpTransport HTTP_TRANSPORT = new NetHttpTransport();
    private static final JsonFactory JSON_FACTORY = new JacksonFactory();

    @Value("${google.client.id}")
    private String googleClientId;

    /**
     * Verify Google ID token and extract user information
     */
    public GoogleUserInfo verifyGoogleToken(String idTokenString) throws GeneralSecurityException, IOException {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(HTTP_TRANSPORT, JSON_FACTORY)
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        GoogleIdToken idToken = verifier.verify(idTokenString);
        
        if (idToken != null) {
            Payload payload = idToken.getPayload();
            
            return new GoogleUserInfo(
                payload.getEmail(),
                (String) payload.get("name"),
                payload.getSubject(),
                (String) payload.get("picture"),
                (Boolean) payload.getEmailVerified()
            );
        }
        
        return null;
    }

    /**
     * Class to hold Google user information
     */
    public static class GoogleUserInfo {
        private final String email;
        private final String name;
        private final String googleId;
        private final String pictureUrl;
        private final Boolean emailVerified;

        public GoogleUserInfo(String email, String name, String googleId, String pictureUrl, Boolean emailVerified) {
            this.email = email;
            this.name = name != null ? name : email.split("@")[0];
            this.googleId = googleId;
            this.pictureUrl = pictureUrl;
            this.emailVerified = emailVerified != null ? emailVerified : false;
        }

        public String getEmail() { return email; }
        public String getName() { return name; }
        public String getGoogleId() { return googleId; }
        public String getPictureUrl() { return pictureUrl; }
        public Boolean getEmailVerified() { return emailVerified; }
    }
}
