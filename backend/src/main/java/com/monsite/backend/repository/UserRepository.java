package com.monsite.backend.repository;

import com.monsite.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Optional;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Rechercher tous les utilisateurs avec un rôle spécifique (ex : "ADMIN" ou "USER")
    List<User> findByRole(String role);

  Optional<User> findByEmail(String email);

    // 1. Update name + email (by id)
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.name = :name, u.email = :email WHERE u.id = :id")
    int updateNameAndEmailById(@Param("id") Long id,
                               @Param("name") String name,
                               @Param("email") String email);

    // 2. Update password (by id)
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.password = :password WHERE u.id = :id")
    int updatePasswordById(@Param("id") Long id,
                           @Param("password") String password);

    // 3. Update role (by id)
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.role = :role WHERE u.id = :id")
    int updateRoleById(@Param("id") Long id,
                       @Param("role") String role);


}
