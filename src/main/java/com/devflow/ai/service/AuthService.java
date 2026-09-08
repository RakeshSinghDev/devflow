package com.devflow.ai.service;

import com.devflow.ai.dto.AuthRequest;
import com.devflow.ai.dto.AuthResponse;
import com.devflow.ai.dto.LoginRequest;
import com.devflow.ai.dto.RegisterRequest;
import com.devflow.ai.dto.UserDTO;
import com.devflow.ai.exception.BadRequestException;
import com.devflow.ai.exception.ConflictException;
import com.devflow.ai.exception.ResourceNotFoundException;
import com.devflow.ai.exception.UnauthorizedException;
import com.devflow.ai.model.User;
import com.devflow.ai.model.enums.UserRole;
import com.devflow.ai.repository.UserRepository;
import com.devflow.ai.security.CustomUserDetails;
import com.devflow.ai.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email is already registered: " + request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : UserRole.MEMBER)
                .createdAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);
        String token = jwtService.generateTokenFromUsername(savedUser.getEmail());

        return AuthResponse.builder()
                .token(token)
                .user(mapToUserDTO(savedUser))
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        return performLogin(request.getEmail(), request.getPassword());
    }

    public AuthResponse login(LoginRequest request) {
        return performLogin(request.getEmail(), request.getPassword());
    }

    private AuthResponse performLogin(String email, String password) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String token = jwtService.generateToken(authentication);

        return AuthResponse.builder()
                .token(token)
                .user(mapToUserDTO(userDetails.getUser()))
                .build();
    }

    public UserDTO getCurrentUser() {
        User user = getCurrentUserEntity();
        return mapToUserDTO(user);
    }

    public User getCurrentUserEntity() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new UnauthorizedException("User not authenticated");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetails customUserDetails) {
            return userRepository.findById(customUserDetails.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + customUserDetails.getId()));
        } else if (principal instanceof org.springframework.security.core.userdetails.UserDetails userDetails) {
            return userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userDetails.getUsername()));
        } else if (principal instanceof String email) {
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        }
        throw new UnauthorizedException("User authentication principal is invalid");
    }

    public UserDTO mapToUserDTO(User user) {
        if (user == null) return null;
        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .jobTitle(user.getJobTitle())
                .bio(user.getBio())
                .timezone(user.getTimezone())
                .build();
    }
}
