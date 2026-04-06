package com.smartcampus.controller;

import com.smartcampus.dto.CommentDTO;
import com.smartcampus.service.CommentService;
import com.smartcampus.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/comments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CommentController {
    
    @Autowired
    private CommentService commentService;

    @Autowired
    private JwtUtil jwtUtil;

    private Long getCurrentUserId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtUtil.getUserIdFromToken(token);
        }
        return null;
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<CommentDTO> addComment(@RequestParam Long ticketId,
                                                 @Valid @RequestBody CommentDTO commentDTO,
                                                 HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        CommentDTO created = commentService.addComment(ticketId, userId != null ? userId : 1L, commentDTO.getContent());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<CommentDTO> updateComment(@PathVariable Long id,
                                                    @Valid @RequestBody CommentDTO commentDTO,
                                                    HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        CommentDTO updated = commentService.updateComment(id, userId != null ? userId : 1L, commentDTO.getContent());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        commentService.deleteComment(id, userId != null ? userId : 1L);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<List<CommentDTO>> getTicketComments(@PathVariable Long ticketId) {
        List<CommentDTO> comments = commentService.getTicketComments(ticketId);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommentDTO> getComment(@PathVariable Long id) {
        CommentDTO comment = commentService.getCommentById(id);
        return ResponseEntity.ok(comment);
    }
}
