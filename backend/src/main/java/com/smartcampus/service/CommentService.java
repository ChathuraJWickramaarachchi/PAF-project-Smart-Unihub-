package com.smartcampus.service;

import com.smartcampus.dto.CommentDTO;
import com.smartcampus.entity.Comment;
import com.smartcampus.entity.Ticket;
import com.smartcampus.entity.User;
import com.smartcampus.repository.CommentRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {
    
    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private TicketRepository ticketRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationService notificationService;

    public CommentDTO addComment(String ticketId, String authorId, String content) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Comment comment = new Comment();
        comment.setContent(content);
        comment.setTicket(ticket);
        comment.setAuthor(author);
        
        Comment saved = commentRepository.save(comment);
        
        // Send notification to ticket reporter and assigned technician
        if (ticket.getReportedBy() != null && !ticket.getReportedBy().getId().equals(authorId)) {
            notificationService.createNotification(
                    ticket.getReportedBy().getId(),
                    "New Comment on Your Ticket",
                    "A new comment was added to ticket " + ticket.getTicketNumber(),
                    com.smartcampus.entity.Notification.NotificationType.COMMENT_ADDED,
                    "COMMENT",
                    saved.getId()
            );
        }
        
        if (ticket.getAssignedTo() != null && !ticket.getAssignedTo().getId().equals(authorId)) {
            notificationService.createNotification(
                    ticket.getAssignedTo().getId(),
                    "New Comment on Assigned Ticket",
                    "A new comment was added to ticket " + ticket.getTicketNumber(),
                    com.smartcampus.entity.Notification.NotificationType.COMMENT_ADDED,
                    "COMMENT",
                    saved.getId()
            );
        }
        
        return convertToDTO(saved);
    }

    public CommentDTO updateComment(String commentId, String authorId, String newContent) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        // Verify ownership
        if (!comment.getAuthor().getId().equals(authorId)) {
            throw new RuntimeException("You can only edit your own comments");
        }
        
        comment.setContent(newContent);
        Comment updated = commentRepository.save(comment);
        return convertToDTO(updated);
    }

    public void deleteComment(String commentId, String authorId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        // Verify ownership
        if (!comment.getAuthor().getId().equals(authorId)) {
            throw new RuntimeException("You can only delete your own comments");
        }
        
        commentRepository.deleteById(commentId);
    }

    public List<CommentDTO> getTicketComments(String ticketId) {
        return commentRepository.findByTicketId(ticketId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<CommentDTO> getUserComments(String userId) {
        return commentRepository.findByAuthorId(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CommentDTO getCommentById(String id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        return convertToDTO(comment);
    }

    private CommentDTO convertToDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setTicketId(comment.getTicket().getId());
        dto.setAuthorId(comment.getAuthor().getId());
        dto.setAuthorName(comment.getAuthor().getFullName());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        return dto;
    }
}
