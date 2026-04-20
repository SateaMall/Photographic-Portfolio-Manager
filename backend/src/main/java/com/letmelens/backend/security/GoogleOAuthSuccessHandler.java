package com.letmelens.backend.security;

import com.letmelens.backend.service.AuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class GoogleOAuthSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AuthService authService;

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        try {
            authService.loginWithGoogle(authentication, request);
            clearAuthenticationAttributes(request);
            getRedirectStrategy().sendRedirect(request, response, frontendBaseUrl);
        } catch (RuntimeException exception) {
            clearAuthenticationState(request);
            getRedirectStrategy().sendRedirect(request, response, buildLoginErrorUrl());
        }
    }

    private String buildLoginErrorUrl() {
        return UriComponentsBuilder.fromUriString(frontendBaseUrl)
                .path("/login")
                .queryParam("oauthError", "Google sign-in failed.")
                .build()
                .toUriString();
    }

    private void clearAuthenticationState(HttpServletRequest request) {
        SecurityContextHolder.clearContext();

        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
    }
}
