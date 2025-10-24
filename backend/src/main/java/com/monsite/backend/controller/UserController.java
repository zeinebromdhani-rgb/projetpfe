package com.monsite.backend.controller;

import com.monsite.backend.entity.User;
import com.monsite.backend.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*") // autorise les appels depuis ton frontend Angular
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Créer un utilisateur
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    // Obtenir tous les utilisateurs
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // Obtenir les utilisateurs par email
    @GetMapping("/email/{email}")
    public Optional<User> getByEmail(@PathVariable String email) {
        return userService.findByEmail(email);
    }

    // Supprimer un utilisateur
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    // Obtenir les utilisateurs qui sont ADMIN
    @GetMapping("/admins")
    public List<User> getAdmins() {
        return userService.getUsersByRole("ADMIN");
    }

    // Obtenir les utilisateurs qui sont USER
    @GetMapping("/only-users")
    public List<User> getUsers() {
        return userService.getUsersByRole("USER");
    }
}
