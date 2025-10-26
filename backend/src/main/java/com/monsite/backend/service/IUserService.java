package com.monsite.backend.service;

import com.monsite.backend.entity.User;
import org.springframework.security.core.userdetails.UserDetailsService;

public interface IUserService extends UserDetailsService {

  public User addUser(User user);

  User findByEmail(String email);
}
