package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {
    private Long id;

    @NotBlank(message = "Comment content cannot be blank")
    private String content;

    private Long ticketId;
    private Long authorId;
    private String authorName;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
