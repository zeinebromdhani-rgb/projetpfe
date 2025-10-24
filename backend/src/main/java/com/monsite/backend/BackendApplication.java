package com.monsite.backend;

import com.monsite.backend.entity.User;
import com.monsite.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

@Override
public void run(String... args) {
   
   /*  try {
        User user = new User();
        user.setName("Zeineb"); 
        user.setEmail("zeineb@example.com"); 
        userRepository.save(user);
        System.out.println("✔ User saved!");
    } catch (Exception e) {
        System.out.println("❌ Failed to save user: " + e.getMessage());
    }
        */
}


}
