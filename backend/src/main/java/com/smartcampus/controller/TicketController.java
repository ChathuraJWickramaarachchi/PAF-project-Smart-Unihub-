package com.smartcampus.controller;

import com.smartcampus.dto.TicketDTO;
import com.smartcampus.entity.Ticket.TicketStatus;
import com.smartcampus.service.TicketService;
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
@RequestMapping("/tickets")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TicketController {
    
    @Autowired
    private TicketService ticketService;

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
    public ResponseEntity<TicketDTO> createTicket(@Valid @RequestBody TicketDTO ticketDTO, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        ticketDTO.setReportedById(userId != null ? userId : 1L);
        TicketDTO created = ticketService.createTicket(ticketDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('TECHNICIAN') or hasRole('ADMIN')")
    public ResponseEntity<TicketDTO> updateStatus(@PathVariable Long id,
                                                  @RequestParam String status) {
        TicketStatus statusEnum = TicketStatus.valueOf(status.toUpperCase());
        TicketDTO updated = ticketService.updateTicketStatus(id, statusEnum);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketDTO> assignTicket(@PathVariable Long id,
                                                  @RequestParam Long technicianId) {
        TicketDTO assigned = ticketService.assignTicket(id, technicianId);
        return ResponseEntity.ok(assigned);
    }

    @PatchMapping("/{id}/resolution-notes")
    @PreAuthorize("hasRole('TECHNICIAN') or hasRole('ADMIN')")
    public ResponseEntity<TicketDTO> addResolutionNotes(@PathVariable Long id,
                                                        @RequestParam String notes) {
        TicketDTO updated = ticketService.addResolutionNotes(id, notes);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketDTO> getTicket(@PathVariable Long id) {
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
    public ResponseEntity<List<TicketDTO>> getUserTickets(@PathVariable Long userId) {
        List<TicketDTO> tickets = ticketService.getUserTickets(userId);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/assigned/{technicianId}")
    public ResponseEntity<List<TicketDTO>> getAssignedTickets(@PathVariable Long technicianId) {
        List<TicketDTO> tickets = ticketService.getAssignedTickets(technicianId);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<List<TicketDTO>> getResourceTickets(@PathVariable Long resourceId) {
        List<TicketDTO> tickets = ticketService.getTicketsByResource(resourceId);
        return ResponseEntity.ok(tickets);
    }
}
