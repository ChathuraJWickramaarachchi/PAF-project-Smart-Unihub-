package com.smartcampus.dto;

import com.smartcampus.entity.Booking.BookingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingDTO {
    private Long id;

    @NotNull(message = "Resource ID is required")
    private Long resourceId;

    @NotNull(message = "User ID is required")
    private Long userId;

    private String bookingPurpose;

    private Integer expectedAttendees;
    private String additionalNotes;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    private BookingStatus status;
    private String approvalNotes;
    private Long approvedById;
    private String resourceName;
    private String userFullName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
