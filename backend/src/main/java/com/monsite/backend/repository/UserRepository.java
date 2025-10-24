package com.monsite.backend.repository;

import com.monsite.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Rechercher un utilisateur par email
    Optional<User> findByEmail(String email);

    // Rechercher tous les utilisateurs avec un rôle spécifique (ex : "ADMIN" ou "USER")
    List<User> findByRole(String role);

}
