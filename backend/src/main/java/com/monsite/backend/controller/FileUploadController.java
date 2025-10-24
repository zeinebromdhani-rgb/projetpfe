package com.monsite.backend.controller;

import com.monsite.backend.entity.User;
import com.monsite.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
public class FileUploadController {

    private final UserService userService;
    private final String UPLOAD_DIR = "uploads/profile-photos/";

    @Autowired
    public FileUploadController(UserService userService) {
        this.userService = userService;
        // Créer le répertoire s'il n'existe pas
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    @PostMapping("/profile-photo/{userId}")
    public ResponseEntity<Map<String, Object>> uploadProfilePhoto(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file) {

        Map<String, Object> response = new HashMap<>();

        try {
            // Vérifier si l'utilisateur existe
            Optional<User> userOptional = userService.findById(userId);
            if (userOptional.isEmpty()) {
                response.put("success", false);
                response.put("message", "Utilisateur non trouvé");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            User user = userOptional.get();

            // Vérifier le type de fichier
            if (!isValidImageFile(file)) {
                response.put("success", false);
                response.put("message", "Type de fichier non valide. Seules les images sont acceptées.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            // Vérifier la taille du fichier (max 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                response.put("success", false);
                response.put("message", "Fichier trop volumineux. Taille maximale: 5MB");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            // Générer un nom de fichier unique
            String originalFilename = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFilename);
            String uniqueFilename = UUID.randomUUID().toString() + "." + fileExtension;

            // Chemin complet du fichier
            Path filePath = Paths.get(UPLOAD_DIR + uniqueFilename);

            // Sauvegarder le fichier
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Supprimer l'ancienne photo si elle existe
            if (user.getProfilePhoto() != null && !user.getProfilePhoto().isEmpty()) {
                Path oldFilePath = Paths.get(user.getProfilePhoto());
                try {
                    Files.deleteIfExists(oldFilePath);
                } catch (IOException e) {
                    // Log l'erreur mais ne pas échouer l'upload
                    System.err.println("Could not delete old profile photo: " + e.getMessage());
                }
            }

            // Mettre à jour l'utilisateur avec le nouveau chemin de photo
            String photoPath = UPLOAD_DIR + uniqueFilename;
            user.setProfilePhoto(photoPath);
            userService.updateUser(user);

            response.put("success", true);
            response.put("message", "Photo de profil mise à jour avec succès");
            response.put("photoPath", photoPath);

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            response.put("success", false);
            response.put("message", "Erreur lors du téléchargement du fichier: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/profile-photo/{userId}")
    public ResponseEntity<Map<String, Object>> deleteProfilePhoto(@PathVariable Long userId) {
        Map<String, Object> response = new HashMap<>();

        try {
            Optional<User> userOptional = userService.findById(userId);
            if (userOptional.isEmpty()) {
                response.put("success", false);
                response.put("message", "Utilisateur non trouvé");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            User user = userOptional.get();

            if (user.getProfilePhoto() != null && !user.getProfilePhoto().isEmpty()) {
                Path filePath = Paths.get(user.getProfilePhoto());
                Files.deleteIfExists(filePath);

                user.setProfilePhoto(null);
                userService.updateUser(user);
            }

            response.put("success", true);
            response.put("message", "Photo de profil supprimée avec succès");
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            response.put("success", false);
            response.put("message", "Erreur lors de la suppression du fichier: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private boolean isValidImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && (
            contentType.equals("image/jpeg") ||
            contentType.equals("image/jpg") ||
            contentType.equals("image/png") ||
            contentType.equals("image/gif")
        );
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf(".") == -1) {
            return "jpg"; // extension par défaut
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }
}