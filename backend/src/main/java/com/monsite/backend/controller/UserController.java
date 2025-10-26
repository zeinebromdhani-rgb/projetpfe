package com.monsite.backend.controller;

import com.monsite.backend.dto.SelfPasswordChangeRequest;
import com.monsite.backend.dto.UpdatePasswordRequest;
import com.monsite.backend.dto.UpdateProfileRequest;
import com.monsite.backend.dto.UpdateRoleRequest;
import com.monsite.backend.entity.Credentials;
import com.monsite.backend.entity.User;
import com.monsite.backend.service.JwtService;
import com.monsite.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    @Autowired
    private final UserService userService;
    @Autowired
    private final PasswordEncoder passwordEncoder ;
    @Autowired
    private final AuthenticationManager authenticationManager ;
    @Autowired
    private final JwtService jwtService ;

    public UserController(UserService userService, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtService jwtService) {
      this.userService = userService ;
        this.passwordEncoder = passwordEncoder ;
        this.authenticationManager = authenticationManager ;
        this.jwtService = jwtService ;
    }



  @PostMapping("/register")
  public User register(@RequestBody User user)
  {
    user.setPassword(passwordEncoder.encode(user.getPassword()));
    return this.userService.addUser(user);
  }

  @PostMapping("/authenticate")
  public ResponseEntity<Map<String, String>> AuthenticateAndGenerateToken(@RequestBody Credentials credentials) {
    Authentication authentication = authenticationManager
      .authenticate(new UsernamePasswordAuthenticationToken(credentials.username(), credentials.password()));
    if (authentication.isAuthenticated()) {
      UserDetails userDetails = userService.loadUserByUsername(credentials.username());
      Map<String, String> tokens = jwtService.generateTokens(userDetails); // Call generateTokens method
      return ResponseEntity.ok(tokens);
    } else {
      return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // Return 403 Forbidden for invalid credentials
    }
  }

  @GetMapping("/findByEmail/{email}")
    public boolean findByEmail(@PathVariable("email") String email) {
        return this.userService.findByEmailBoolean(email);
  }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        // authentication.getName() returns the principal username
        // In your case, username == email
        String email = authentication.getName();

        User user = this.userService.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok(user);
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changeOwnPassword(
            Authentication authentication,
            @RequestBody SelfPasswordChangeRequest body
    ) {
        String email = authentication.getName(); // comes from JWT subject

        boolean ok = userService.changeOwnPassword(
                email,
                body.currentPassword(),
                body.newPassword()
        );

        if (!ok) {
            // either user not found or current password wrong
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        return ResponseEntity.ok().build();
    }


    @GetMapping("/getAll")
    public List<User> getAllUsers() {
        return this.userService.getAllUsers();
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<Void> updateProfile(
            @PathVariable("id") Long id,
            @RequestBody UpdateProfileRequest body
    ) {
        boolean ok = userService.updateNameAndEmail(id, body.name(), body.email());
        return ok
                ? ResponseEntity.ok().build()
                : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }


    @PutMapping("/{id}/password")
    public ResponseEntity<Void> updatePassword(
            @PathVariable("id") Long id,
            @RequestBody UpdatePasswordRequest body
    ) {
        boolean ok = userService.updatePassword(id, body.newPassword());
        return ok
                ? ResponseEntity.ok().build()
                : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<Void> updateRole(
            @PathVariable("id") Long id,
            @RequestBody UpdateRoleRequest body
    ) {
        boolean ok = userService.updateRole(id, body.role());
        return ok
                ? ResponseEntity.ok().build()
                : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable("id") Long id) {
        boolean deleted = this.userService.deleteUserById(id);
        return deleted
                ? ResponseEntity.noContent().build() // 204
                : ResponseEntity.status(HttpStatus.NOT_FOUND).build(); // 404 if user doesn't exist
    }
}
