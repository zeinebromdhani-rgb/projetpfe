package com.monsite.backend;

import com.monsite.backend.entity.User;
import com.monsite.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "http://localhost:4200")
public class TestController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            System.out.println("Erreur lors de la récupération des utilisateurs: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        try {
            User savedUser = userRepository.save(user);
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            System.out.println("Erreur lors de la création de l'utilisateur: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/db-test")
    public ResponseEntity<String> testDatabase() {
        try {
            long count = userRepository.count();
            return ResponseEntity.ok("Connexion à la base de données réussie! Nombre d'utilisateurs: " + count);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("Erreur de connexion à la base de données: " + e.getMessage());
        }
    }
}
