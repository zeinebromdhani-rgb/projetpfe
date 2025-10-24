package com.monsite.backend.service;

import com.monsite.backend.entity.User;
import com.monsite.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public User updateUser(Long id, User updatedUser) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isPresent()) {
            User existingUser = optionalUser.get();
            existingUser.setName(updatedUser.getName());
            existingUser.setEmail(updatedUser.getEmail());
            existingUser.setRole(updatedUser.getRole());
            existingUser.setProfilePhoto(updatedUser.getProfilePhoto());
            return userRepository.save(existingUser);
        }
        return null;
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
    public List<User> getUsersByRole(String role) {
    return userRepository.findByRole(role);
}

public Optional<User> findByEmail(String email) {
 return userRepository.findByEmail(email);
}

public Optional<User> findById(Long id) {
    return userRepository.findById(id);
}

public User updateUser(User user) {
    return userRepository.save(user);
}

}
