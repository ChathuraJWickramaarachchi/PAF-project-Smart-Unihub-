package com.smartcampus.controller;

import com.smartcampus.dto.NotificationDTO;
import com.smartcampus.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<NotificationDTO>> getUserNotifications(@PathVariable Long userId) {
        List<NotificationDTO> notifications = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/user/{userId}/unread")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(@PathVariable Long userId) {
        List<NotificationDTO> notifications = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/user/{userId}/unread-count")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable Long userId) {
        Long count = notificationService.getUnreadCount(userId);
        Map<String, Long> response = new HashMap<>();
        response.put("unreadCount", count);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable Long id) {
        NotificationDTO notification = notificationService.markAsRead(id);
        return ResponseEntity.ok(notification);
    }

    @PostMapping("/user/{userId}/read-all")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/user/{userId}/all")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> deleteAllUserNotifications(@PathVariable Long userId) {
        notificationService.deleteAllUserNotifications(userId);
        return ResponseEntity.noContent().build();
    }
}
