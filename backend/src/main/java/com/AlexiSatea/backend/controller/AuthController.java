package com.AlexiSatea.backend.controller;

import com.AlexiSatea.backend.dto.LoginRequest;
import com.AlexiSatea.backend.dto.SignupRequest;
import com.AlexiSatea.backend.model.user.AppUser;
import com.AlexiSatea.backend.model.user.UserRole;
import com.AlexiSatea.backend.service.AuthService;
import com.AlexiSatea.backend.service.TestService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final TestService testService;
    private final AuthService authService;

    @PostMapping("/signupTest")
    public String signup() throws ServletException {
        return testService.signUpTest();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request,
                                   HttpServletRequest httpRequest) {

        authService.login(request, httpRequest);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) throws ServletException {
        request.logout();
        request.getSession().invalidate();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public Map<String, Object> me(Authentication authentication) {
        return authService.me(authentication);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        authService.signup(request);
        return ResponseEntity.ok(Map.of("message", "User created successfully"));
    }




}