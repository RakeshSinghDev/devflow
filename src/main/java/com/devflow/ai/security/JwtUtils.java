package com.devflow.ai.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtUtils {

    private final JwtService jwtService;

    public String generateToken(Authentication authentication) {
        return jwtService.generateToken(authentication);
    }

    public String generateTokenFromUsername(String username) {
        return jwtService.generateTokenFromUsername(username);
    }

    public String getUsernameFromJwtToken(String token) {
        return jwtService.getUsernameFromJwtToken(token);
    }

    public boolean validateJwtToken(String authToken) {
        return jwtService.validateJwtToken(authToken);
    }
}
