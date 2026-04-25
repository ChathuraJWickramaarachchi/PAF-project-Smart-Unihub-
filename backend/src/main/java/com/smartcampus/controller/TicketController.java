package com.smartcampus.controller;

import com.smartcampus.dto.AttachmentDTO;
import com.smartcampus.dto.TicketDTO;
import com.smartcampus.entity.Ticket.TicketStatus;
import com.smartcampus.service.AttachmentService;
import com.smartcampus.service.TicketService;
import com.smartcampus.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/tickets")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TicketController {
    
    @Autowired
    private TicketService ticketService;

    @Autowired
    private AttachmentService attachmentService;

    @Autowired
    private JwtUtil jwtUtil;

    private String getCurrentUserId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtUtil.getUserIdFromToken(token);
        }
        return null;
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<TicketDTO> createTicket(@Valid @RequestBody TicketDTO ticketDTO, HttpServletRequest request) {
        String userId = getCurrentUserId(request);
        ticketDTO.setReportedById(userId != null ? userId : "1");
        TicketDTO created = ticketService.createTicket(ticketDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('TECHNICIAN') or hasRole('ADMIN')")
    public ResponseEntity<TicketDTO> updateStatus(@PathVariable String id,
                                                  @RequestParam String status) {
        TicketStatus statusEnum = TicketStatus.valueOf(status.toUpperCase());
        TicketDTO updated = ticketService.updateTicketStatus(id, statusEnum);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketDTO> assignTicket(@PathVariable String id,
                                                  @RequestParam String technicianId) {
        TicketDTO assigned = ticketService.assignTicket(id, technicianId);
        return ResponseEntity.ok(assigned);
    }

    @PatchMapping("/{id}/resolution-notes")
    @PreAuthorize("hasRole('TECHNICIAN') or hasRole('ADMIN')")
    public ResponseEntity<TicketDTO> addResolutionNotes(@PathVariable String id,
                                                        @RequestParam String notes) {
        TicketDTO updated = ticketService.addResolutionNotes(id, notes);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketDTO> getTicket(@PathVariable String id) {
        TicketDTO ticket = ticketService.getTicketById(id);
        return ResponseEntity.ok(ticket);
    }

    @GetMapping
    public ResponseEntity<List<TicketDTO>> getAllTickets() {
        List<TicketDTO> tickets = ticketService.getAllTickets();
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<TicketDTO>> getByStatus(@PathVariable String status) {
        TicketStatus statusEnum = TicketStatus.valueOf(status.toUpperCase());
        List<TicketDTO> tickets = ticketService.getTicketsByStatus(statusEnum);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TicketDTO>> getUserTickets(@PathVariable String userId) {
        List<TicketDTO> tickets = ticketService.getUserTickets(userId);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/assigned/{technicianId}")
    public ResponseEntity<List<TicketDTO>> getAssignedTickets(@PathVariable String technicianId) {
        List<TicketDTO> tickets = ticketService.getAssignedTickets(technicianId);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<List<TicketDTO>> getResourceTickets(@PathVariable String resourceId) {
        List<TicketDTO> tickets = ticketService.getTicketsByResource(resourceId);
        return ResponseEntity.ok(tickets);
    }

    @PostMapping("/{id}/attachments")
    public ResponseEntity<List<AttachmentDTO>> uploadAttachments(
            @PathVariable String id,
            @RequestParam("files") List<MultipartFile> files,
            HttpServletRequest request) {
        try {
            String userId = getCurrentUserId(request);
            List<AttachmentDTO> attachments = attachmentService.uploadFiles(id, userId != null ? userId : "1", files);
            return ResponseEntity.status(HttpStatus.CREATED).body(attachments);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}/attachments")
    public ResponseEntity<List<AttachmentDTO>> getAttachments(@PathVariable String id) {
        List<AttachmentDTO> attachments = attachmentService.getAttachmentsByTicket(id);
        return ResponseEntity.ok(attachments);
    }

    @GetMapping("/attachments/file/{fileName}")
    public ResponseEntity<Resource> serveFile(@PathVariable String fileName) {
        try {
            Path filePath = attachmentService.getFilePath(fileName);
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) contentType = "application/octet-stream";
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            }
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
