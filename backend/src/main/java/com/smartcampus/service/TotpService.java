package com.smartcampus.service;

import dev.samstevens.totp.code.*;
import dev.samstevens.totp.exceptions.QrGenerationException;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import org.springframework.stereotype.Service;

@Service
public class TotpService {

    private static final String ISSUER = "SmartUni Portal";

    /**
     * Generate a new Base32-encoded secret key for TOTP.
     */
    public String generateSecret() {
        SecretGenerator generator = new DefaultSecretGenerator(32);
        return generator.generate();
    }

    /**
     * Build the otpauth:// URI for QR code generation.
     * This URI is scanned by Google Authenticator to add the account.
     */
    public String getQrCodeUri(String secret, String email) {
        QrData data = new QrData.Builder()
                .label(email)
                .secret(secret)
                .issuer(ISSUER)
                .algorithm(HashingAlgorithm.SHA1)
                .digits(6)
                .period(30)
                .build();
        return data.getUri();
    }

    /**
     * Verify a 6-digit TOTP code against the secret.
     * Allows a 1-period (30s) window of tolerance.
     */
    public boolean verifyCode(String secret, String code) {
        TimeProvider timeProvider = new SystemTimeProvider();
        CodeGenerator codeGenerator = new DefaultCodeGenerator();
        CodeVerifier verifier = new DefaultCodeVerifier(codeGenerator, timeProvider);
        // Allow 1 time period of tolerance (30 seconds before/after)
        ((DefaultCodeVerifier) verifier).setAllowedTimePeriodDiscrepancy(1);
        return verifier.isValidCode(secret, code);
    }
}
