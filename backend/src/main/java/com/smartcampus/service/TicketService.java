package com.smartcampus.service;

import com.smartcampus.dto.TicketDTO;
import com.smartcampus.entity.Ticket;
import com.smartcampus.entity.Ticket.TicketStatus;
import com.smartcampus.entity.User;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TicketService {
    
    @Autowired
    private TicketRepository ticketRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ResourceRepository resourceRepository;
    
    @Autowired
    private NotificationService notificationService;

    public TicketDTO createTicket(TicketDTO ticketDTO) {
        Ticket ticket = new Ticket();
        ticket.setTicketNumber("TKT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        ticket.setTitle(ticketDTO.getTitle());
        ticket.setDescription(ticketDTO.getDescription());
        ticket.setPriority(ticketDTO.getPriority());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setResource(resourceRepository.findById(ticketDTO.getResourceId())
                .orElseThrow(() -> new RuntimeException("Resource not found")));
        ticket.setReportedBy(userRepository.findById(ticketDTO.getReportedById())
                .orElseThrow(() -> new RuntimeException("User not found")));
        
        Ticket saved = ticketRepository.save(ticket);
        return convertToDTO(saved);
    }

    public TicketDTO updateTicketStatus(String ticketId, TicketStatus newStatus) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        TicketStatus oldStatus = ticket.getStatus();
        ticket.setStatus(newStatus);
        
        if (newStatus.equals(TicketStatus.RESOLVED) || newStatus.equals(TicketStatus.CLOSED)) {
            ticket.setResolvedAt(LocalDateTime.now());
        }
        
        Ticket updated = ticketRepository.save(ticket);
        
        // Send notification
        if (ticket.getAssignedTo() != null) {
            notificationService.createNotification(
                    ticket.getAssignedTo().getId(),
                    "Ticket Status Updated",
                    "Ticket " + ticket.getTicketNumber() + " status changed to " + newStatus,
                    com.smartcampus.entity.Notification.NotificationType.TICKET_STATUS_CHANGED,
                    "TICKET",
                    ticketId
            );
        }
        
        return convertToDTO(updated);
    }

    public TicketDTO assignTicket(String ticketId, String technicianId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician not found"));
        
        ticket.setAssignedTo(technician);
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        
        Ticket updated = ticketRepository.save(ticket);
        
        // Send notification
        notificationService.createNotification(
                technicianId,
                "New Ticket Assigned",
                "Ticket " + ticket.getTicketNumber() + " has been assigned to you",
                com.smartcampus.entity.Notification.NotificationType.TICKET_ASSIGNED,
                "TICKET",
                ticketId
        );
        
        return convertToDTO(updated);
    }

    public TicketDTO addResolutionNotes(String ticketId, String notes) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        ticket.setResolutionNotes(notes);
        Ticket updated = ticketRepository.save(ticket);
        return convertToDTO(updated);
    }

    public TicketDTO getTicketById(String id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        return convertToDTO(ticket);
    }

    public List<TicketDTO> getAllTickets() {
        return ticketRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TicketDTO> getTicketsByStatus(TicketStatus status) {
        return ticketRepository.findByStatusOrderByCreatedAtDesc(status)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TicketDTO> getUserTickets(String userId) {
        return ticketRepository.findByReportedById(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TicketDTO> getAssignedTickets(String technicianId) {
        return ticketRepository.findByAssignedToId(technicianId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TicketDTO> getTicketsByResource(String resourceId) {
        return ticketRepository.findByResourceId(resourceId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Long countOpenTicketsForTechnician(String technicianId) {
        return ticketRepository.countByStatusAndAssignedToId(TicketStatus.IN_PROGRESS, technicianId);
    }

    private TicketDTO convertToDTO(Ticket ticket) {
        TicketDTO dto = new TicketDTO();
        dto.setId(ticket.getId());
        dto.setTicketNumber(ticket.getTicketNumber());
        dto.setTitle(ticket.getTitle());
        dto.setDescription(ticket.getDescription());
        dto.setStatus(ticket.getStatus());
        dto.setPriority(ticket.getPriority());
        if (ticket.getResource() != null) {
            dto.setResourceId(ticket.getResource().getId());
        }
        if (ticket.getReportedBy() != null) {
            dto.setReportedById(ticket.getReportedBy().getId());
        }
        if (ticket.getAssignedTo() != null) {
            dto.setAssignedToId(ticket.getAssignedTo().getId());
        }
        dto.setResolutionNotes(ticket.getResolutionNotes());
        dto.setCreatedAt(ticket.getCreatedAt());
        dto.setUpdatedAt(ticket.getUpdatedAt());
        dto.setResolvedAt(ticket.getResolvedAt());
        return dto;
    }
}
