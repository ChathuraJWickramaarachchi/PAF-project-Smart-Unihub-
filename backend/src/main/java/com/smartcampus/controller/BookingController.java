package com.smartcampus.controller;

import com.smartcampus.dto.BookingDTO;
import com.smartcampus.entity.Booking.BookingStatus;
import com.smartcampus.service.BookingService;
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
@RequestMapping("/bookings")
@CrossOrigin(origins = "*", maxAge = 3600)
public class BookingController {

    @Autowired
    private BookingService bookingService;

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
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<BookingDTO> createBooking(@Valid @RequestBody BookingDTO bookingDTO,
            HttpServletRequest request) {
        String userId = getCurrentUserId(request);
        String creatorId = userId != null ? userId : "1";
        bookingDTO.setUserId(creatorId);
        BookingDTO created = bookingService.createBooking(bookingDTO, creatorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingDTO> approveBooking(@PathVariable String id,
            @RequestParam(required = false) String notes,
            HttpServletRequest request) {
        String userId = getCurrentUserId(request);
        BookingDTO approved = bookingService.approveBooking(id, userId != null ? userId : "1", notes);
        return ResponseEntity.ok(approved);
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingDTO> rejectBooking(@PathVariable String id,
            @RequestParam(required = false) String notes,
            HttpServletRequest request) {
        String userId = getCurrentUserId(request);
        BookingDTO rejected = bookingService.rejectBooking(id, userId != null ? userId : "1", notes);
        return ResponseEntity.ok(rejected);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<BookingDTO> cancelBooking(@PathVariable String id) {
        BookingDTO cancelled = bookingService.cancelBooking(id);
        return ResponseEntity.ok(cancelled);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingDTO> getBooking(@PathVariable String id) {
        BookingDTO booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(booking);
    }

    @GetMapping
    public ResponseEntity<List<BookingDTO>> getAllBookings() {
        List<BookingDTO> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingDTO>> getUserBookings(@PathVariable String userId) {
        List<BookingDTO> bookings = bookingService.getUserBookings(userId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<List<BookingDTO>> getResourceBookings(@PathVariable String resourceId) {
        List<BookingDTO> bookings = bookingService.getBookingsByResource(resourceId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<BookingDTO>> getByStatus(@PathVariable String status) {
        BookingStatus statusEnum = BookingStatus.valueOf(status.toUpperCase());
        List<BookingDTO> bookings = bookingService.getBookingsByStatus(statusEnum);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/daily-schedule")
    public ResponseEntity<List<BookingDTO>> getDailySchedule(@RequestParam String resourceId,
            @RequestParam String date) {
        java.time.LocalDateTime startOfDay = java.time.LocalDate.parse(date).atStartOfDay();
        List<BookingDTO> schedule = bookingService.getDailySchedule(resourceId, startOfDay);
        return ResponseEntity.ok(schedule);
    }

    @GetMapping("/check-availability")
    public ResponseEntity<Boolean> checkAvailability(@RequestParam String resourceId,
            @RequestParam String startTime,
            @RequestParam String endTime) {
        java.time.LocalDateTime start = java.time.LocalDateTime.parse(startTime);
        java.time.LocalDateTime end = java.time.LocalDateTime.parse(endTime);
        boolean isAvailable = bookingService.checkAvailability(resourceId, start, end);
        return ResponseEntity.ok(isAvailable);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Void> deleteBooking(@PathVariable String id) {
        System.out.println("Processing delete request for Booking ID: " + id);
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }
}
