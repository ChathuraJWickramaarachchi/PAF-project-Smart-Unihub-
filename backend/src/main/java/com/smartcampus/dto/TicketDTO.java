package com.smartcampus.dto;

import com.smartcampus.entity.Ticket.TicketStatus;
import com.smartcampus.entity.Ticket.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketDTO {
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    private TicketStatus status;
    
    @NotNull(message = "Resource ID is required")
    private Long resourceId;

    private Long reportedById;
    private Long assignedToId;
    
    private String resolutionNotes;
    private String ticketNumber;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    
    private List<CommentDTO> comments;
    private List<AttachmentDTO> attachments;
}
