package com.smartcampus.service;

import com.smartcampus.dto.BookingDTO;
import com.smartcampus.entity.Booking;
import com.smartcampus.entity.Booking.BookingStatus;
import com.smartcampus.entity.Resource;
import com.smartcampus.entity.Role;
import com.smartcampus.entity.User;
import com.smartcampus.exception.BookingConflictException;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
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

    public BookingDTO createBooking(BookingDTO bookingDTO, String creatorUserId) {
        Resource resource = resourceRepository.findById(bookingDTO.getResourceId())
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        // Check for conflicts
        List<BookingStatus> activeStatuses = List.of(BookingStatus.APPROVED, BookingStatus.PENDING);
        List<Booking> conflicts = bookingRepository.findByResource_IdAndStatusInAndIdNotAndStartTimeBeforeAndEndTimeAfter(
                bookingDTO.getResourceId(),
                activeStatuses,
                "NEW_BOOKING",
                bookingDTO.getEndTime(),
                bookingDTO.getStartTime());

        if (!conflicts.isEmpty()) {
            throw new BookingConflictException(
                    "Resource is already booked for this time period. Please select another time.");
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

        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);
        return convertToDTO(saved);
    }

    public BookingDTO approveBooking(String bookingId, String approvedById, String notes) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getStatus().equals(BookingStatus.PENDING)) {
            throw new RuntimeException("Only pending bookings can be approved");
        }

        // Final check for conflicts before approving (in case another was approved in the meantime)
        List<BookingStatus> activeStatuses = List.of(BookingStatus.APPROVED, BookingStatus.PENDING);
        List<Booking> conflicts = bookingRepository.findByResource_IdAndStatusInAndIdNotAndStartTimeBeforeAndEndTimeAfter(
                booking.getResource().getId(),
                activeStatuses,
                bookingId,
                booking.getEndTime(),
                booking.getStartTime());

        if (!conflicts.isEmpty()) {
            throw new BookingConflictException(
                    "Cannot approve: Resource is already booked for this time period.");
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setApprovedBy(userRepository.findById(approvedById)
                .orElseThrow(() -> new RuntimeException("Approver not found")));
        booking.setApprovalNotes(notes);
        booking.setUpdatedAt(LocalDateTime.now());

        Booking updated = bookingRepository.save(booking);

        // Send notification
        notificationService.createNotification(
                booking.getUser().getId(),
                "Booking Approved",
                "Your booking for " + booking.getResource().getResourceName() + " has been approved",
                com.smartcampus.entity.Notification.NotificationType.BOOKING_APPROVED,
                "BOOKING",
                bookingId);

        return convertToDTO(updated);
    }

    public BookingDTO rejectBooking(String bookingId, String approvedById, String notes) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getStatus().equals(BookingStatus.PENDING)) {
            throw new RuntimeException("Only pending bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setApprovedBy(userRepository.findById(approvedById)
                .orElseThrow(() -> new RuntimeException("Approver not found")));
        booking.setApprovalNotes(notes);
        booking.setUpdatedAt(LocalDateTime.now());

        Booking updated = bookingRepository.save(booking);

        // Send notification
        notificationService.createNotification(
                booking.getUser().getId(),
                "Booking Rejected",
                "Your booking for " + booking.getResource().getResourceName() + " has been rejected",
                com.smartcampus.entity.Notification.NotificationType.BOOKING_REJECTED,
                "BOOKING",
                bookingId);

        return convertToDTO(updated);
    }

    public BookingDTO cancelBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus().equals(BookingStatus.CANCELLED)) {
            throw new RuntimeException("Booking is already cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking updated = bookingRepository.save(booking);
        return convertToDTO(updated);
    }

    public boolean checkAvailability(String resourceId, LocalDateTime startTime, LocalDateTime endTime) {
        List<BookingStatus> activeStatuses = List.of(BookingStatus.APPROVED, BookingStatus.PENDING);
        List<Booking> conflicts = bookingRepository.findByResource_IdAndStatusInAndIdNotAndStartTimeBeforeAndEndTimeAfter(
                resourceId,
                activeStatuses,
                "CHECK_AVAILABILITY",
                endTime,
                startTime);
        return conflicts.isEmpty();
    }

    public List<BookingDTO> getUserBookings(String userId) {
        return bookingRepository.findByUserId(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BookingDTO> getBookingsByResource(String resourceId) {
        return bookingRepository.findByResource_Id(resourceId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public void deleteBooking(String id) {
        if (!bookingRepository.existsById(id)) {
            throw new RuntimeException("Booking not found");
        }
        bookingRepository.deleteById(id);
    }

    public List<BookingDTO> getBookingsByStatus(BookingStatus status) {
        return bookingRepository.findByStatus(status)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BookingDTO> getDailySchedule(String resourceId, LocalDateTime startOfDay) {
        LocalDateTime endOfDay = startOfDay.plusDays(1).minusNanos(1);
        List<BookingStatus> activeStatuses = List.of(BookingStatus.APPROVED, BookingStatus.PENDING);
        return bookingRepository.findByResource_IdAndStatusInAndIdNotAndStartTimeBeforeAndEndTimeAfter(
                resourceId,
                activeStatuses,
                "DAILY_SCHEDULE",
                endOfDay,
                startOfDay)
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

    public BookingDTO getBookingById(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return convertToDTO(booking);
    }

    private BookingDTO convertToDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setResourceId(booking.getResource().getId());
        dto.setResourceName(booking.getResource().getResourceName());
        dto.setLocation(booking.getResource().getLocation());
        dto.setResourceCapacity(booking.getResource().getCapacity());
        dto.setUserId(booking.getUser().getId());
        dto.setUserFullName(booking.getUser().getFullName());
        dto.setUserEmail(booking.getUser().getEmail());
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