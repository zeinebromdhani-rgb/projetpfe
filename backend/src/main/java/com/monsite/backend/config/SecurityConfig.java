package com.monsite.backend.config;

import com.monsite.backend.service.IUserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // 🔥 no fields, no constructor

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            AuthenticationProvider authenticationProvider,
            JwtAuthFilter jwtAuthFilter // <- inject filter here instead of constructor
    ) throws Exception {

        return http
                .cors(Customizer.withDefaults())
                .sessionManagement(c -> c.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(a -> {
                    a.requestMatchers(
                            "/api/users/authenticate",
                            "/api/users/register",
                            "/api/users/findByEmail/**"
                    ).permitAll();
                    a.anyRequest().authenticated();
                })
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(
            IUserService userService,
            PasswordEncoder passwordEncoder
    ) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userService); // userService implements UserDetailsService
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationProvider authenticationProvider) {
        return new ProviderManager(authenticationProvider);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
    }
}
