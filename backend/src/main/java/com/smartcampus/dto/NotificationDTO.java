package com.smartcampus.dto;

import com.smartcampus.entity.Notification.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private Long userId;
    private String title;
    private String message;
    private NotificationType type;
    private String relatedEntityType;
    private Long relatedEntityId;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
}
