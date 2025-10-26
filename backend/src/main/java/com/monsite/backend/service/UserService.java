package com.monsite.backend.service;

import com.monsite.backend.entity.User;
import com.monsite.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.DeleteMapping;

import java.util.List;
import java.util.Optional;

@Service
public class UserService implements IUserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

  @Override
  public User addUser(User user) {
    return this.userRepository.save(user);
  }


  @Override
  public User findByEmail(String email) {
    return this.userRepository.findByEmail(email).orElse(null);
  }

    public Boolean findByEmailBoolean(String email) {
        User user = this.userRepository.findByEmail(email).orElse(null);
        return user != null;
    }


  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    User user = this.userRepository.findByEmail(username)
      .orElseThrow(() -> new UsernameNotFoundException("User with username " + username + " not found"));

    return org.springframework.security.core.userdetails.User.builder()
      .username(user.getEmail())
      .password(user.getPassword())
      .roles(user.getRole())
      .build();
  }

  public List<User> getAllUsers() {
    return this.userRepository.findAll();
  }

    public boolean updateNameAndEmail(Long userId, String name, String email) {
        int updated = this.userRepository.updateNameAndEmailById(userId, name, email);
        return updated == 1;
    }

    public boolean updatePassword(Long userId, String rawPassword) {

        String hashed = passwordEncoder.encode(rawPassword);
        int updated = this.userRepository.updatePasswordById(userId, hashed);
        return updated == 1;
    }

    public boolean updateRole(Long userId, String role) {
        int updated = this.userRepository.updateRoleById(userId, role);
        return updated == 1;
    }


    public boolean deleteUserById(Long id) {
        if (!userRepository.existsById(id)) {
            return false;
        }
        userRepository.deleteById(id);
        return true;
    }

    public boolean changeOwnPassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return false;
        }

        // check current password matches
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            // wrong current password
            return false;
        }

        // encode and save new password
        String encoded = passwordEncoder.encode(newPassword);
        int updated = userRepository.updatePasswordById(user.getId(), encoded);

        return (updated == 1);
    }
}
