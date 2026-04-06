package com.smartcampus.service;

import com.smartcampus.dto.BookingDTO;
import com.smartcampus.entity.Booking;
import com.smartcampus.entity.Booking.BookingStatus;
import com.smartcampus.entity.Role;
import com.smartcampus.entity.User;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private ResourceRepository resourceRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationService notificationService;

    public BookingDTO createBooking(BookingDTO bookingDTO, Long creatorUserId) {
        // Check for conflicts
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                bookingDTO.getResourceId(),
                bookingDTO.getStartTime(),
                bookingDTO.getEndTime()
        );

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Resource is already booked for this time period");
        }

        User creator = userRepository.findById(creatorUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isAdmin = creator.getRoles() != null &&
                creator.getRoles().stream()
                        .map(Role::getRoleName)
                        .anyMatch(name -> name.equalsIgnoreCase("ADMIN") || name.equalsIgnoreCase("ROLE_ADMIN"));

        Booking booking = new Booking();
        booking.setResource(resourceRepository.findById(bookingDTO.getResourceId())
                .orElseThrow(() -> new RuntimeException("Resource not found")));
        booking.setUser(creator);
        booking.setBookingPurpose(bookingDTO.getBookingPurpose());
        booking.setExpectedAttendees(bookingDTO.getExpectedAttendees());
        booking.setAdditionalNotes(bookingDTO.getAdditionalNotes());
        booking.setStartTime(bookingDTO.getStartTime());
        booking.setEndTime(bookingDTO.getEndTime());

        if (isAdmin) {
            // Admins bypass the approval flow — booking is immediately approved
            booking.setStatus(BookingStatus.APPROVED);
            booking.setApprovedBy(creator);
            booking.setApprovalNotes("Auto-approved by admin");
        } else {
            booking.setStatus(BookingStatus.PENDING);
        }

        Booking saved = bookingRepository.save(booking);
        return convertToDTO(saved);
    }

    public BookingDTO approveBooking(Long bookingId, Long approvedById, String notes) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (!booking.getStatus().equals(BookingStatus.PENDING)) {
            throw new RuntimeException("Only pending bookings can be approved");
        }
        
        booking.setStatus(BookingStatus.APPROVED);
        booking.setApprovedBy(userRepository.findById(approvedById)
                .orElseThrow(() -> new RuntimeException("Approver not found")));
        booking.setApprovalNotes(notes);
        
        Booking updated = bookingRepository.save(booking);
        
        // Send notification
        notificationService.createNotification(
                booking.getUser().getId(),
                "Booking Approved",
                "Your booking for " + booking.getResource().getResourceName() + " has been approved",
                com.smartcampus.entity.Notification.NotificationType.BOOKING_APPROVED,
                "BOOKING",
                bookingId
        );
        
        return convertToDTO(updated);
    }

    public BookingDTO rejectBooking(Long bookingId, Long approvedById, String notes) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (!booking.getStatus().equals(BookingStatus.PENDING)) {
            throw new RuntimeException("Only pending bookings can be rejected");
        }
        
        booking.setStatus(BookingStatus.REJECTED);
        booking.setApprovedBy(userRepository.findById(approvedById)
                .orElseThrow(() -> new RuntimeException("Approver not found")));
        booking.setApprovalNotes(notes);
        
        Booking updated = bookingRepository.save(booking);
        
        // Send notification
        notificationService.createNotification(
                booking.getUser().getId(),
                "Booking Rejected",
                "Your booking for " + booking.getResource().getResourceName() + " has been rejected",
                com.smartcampus.entity.Notification.NotificationType.BOOKING_REJECTED,
                "BOOKING",
                bookingId
        );
        
        return convertToDTO(updated);
    }

    public BookingDTO cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (booking.getStatus().equals(BookingStatus.CANCELLED)) {
            throw new RuntimeException("Booking is already cancelled");
        }
        
        booking.setStatus(BookingStatus.CANCELLED);
        Booking updated = bookingRepository.save(booking);
        return convertToDTO(updated);
    }

    public List<BookingDTO> getUserBookings(Long userId) {
        return bookingRepository.findByUserId(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BookingDTO> getBookingsByResource(Long resourceId) {
        return bookingRepository.findByResourceId(resourceId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BookingDTO> getBookingsByStatus(BookingStatus status) {
        return bookingRepository.findByStatus(status)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public BookingDTO getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return convertToDTO(booking);
    }

    private BookingDTO convertToDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setResourceId(booking.getResource().getId());
        dto.setResourceName(booking.getResource().getResourceName());
        dto.setUserId(booking.getUser().getId());
        dto.setUserFullName(booking.getUser().getFullName());
        dto.setBookingPurpose(booking.getBookingPurpose());
        dto.setExpectedAttendees(booking.getExpectedAttendees());
        dto.setAdditionalNotes(booking.getAdditionalNotes());
        dto.setStartTime(booking.getStartTime());
        dto.setEndTime(booking.getEndTime());
        dto.setStatus(booking.getStatus());
        dto.setApprovalNotes(booking.getApprovalNotes());
        if (booking.getApprovedBy() != null) {
            dto.setApprovedById(booking.getApprovedBy().getId());
        }
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setUpdatedAt(booking.getUpdatedAt());
        return dto;
    }
}
