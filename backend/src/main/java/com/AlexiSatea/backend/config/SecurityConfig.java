package com.AlexiSatea.backend.config;

import com.AlexiSatea.backend.security.GoogleOAuthFailureHandler;
import com.AlexiSatea.backend.security.GoogleOAuthSuccessHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.oauth2.client.CommonOAuth2Provider;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.InMemoryOAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.util.StringUtils;

import java.util.Iterator;
import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret:}")
    private String googleClientSecret;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public ClientRegistrationRepository clientRegistrationRepository() {
        if (!isGoogleOAuthConfigured()) {
            return new StaticClientRegistrationRepository(null);
        }

        ClientRegistration googleClientRegistration = CommonOAuth2Provider.GOOGLE
                .getBuilder("google")
                .clientId(googleClientId)
                .clientSecret(googleClientSecret)
                .build();

        return new StaticClientRegistrationRepository(googleClientRegistration);
    }

    @Bean
    public OAuth2AuthorizedClientService authorizedClientService(
            ClientRegistrationRepository clientRegistrationRepository
    ) {
        return new InMemoryOAuth2AuthorizedClientService(clientRegistrationRepository);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            GoogleOAuthSuccessHandler googleOAuthSuccessHandler,
            GoogleOAuthFailureHandler googleOAuthFailureHandler
    ) throws Exception {
        http
                .cors(cors -> {})
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET, "/api/public/**").permitAll()
                        .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/manage/**").authenticated()
                )
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable());

        if (isGoogleOAuthConfigured()) {
            http.oauth2Login(oauth2 -> oauth2
                    .successHandler(googleOAuthSuccessHandler)
                    .failureHandler(googleOAuthFailureHandler)
            );
        }

        return http.build();
    }

    private boolean isGoogleOAuthConfigured() {
        return StringUtils.hasText(googleClientId) && StringUtils.hasText(googleClientSecret);
    }

    private static final class StaticClientRegistrationRepository
            implements ClientRegistrationRepository, Iterable<ClientRegistration> {

        private final ClientRegistration registration;

        private StaticClientRegistrationRepository(ClientRegistration registration) {
            this.registration = registration;
        }

        @Override
        public ClientRegistration findByRegistrationId(String registrationId) {
            if (registration == null || !registration.getRegistrationId().equals(registrationId)) {
                return null;
            }

            return registration;
        }

        @Override
        public Iterator<ClientRegistration> iterator() {
            return registration == null
                    ? List.<ClientRegistration>of().iterator()
                    : List.of(registration).iterator();
        }
    }
}
