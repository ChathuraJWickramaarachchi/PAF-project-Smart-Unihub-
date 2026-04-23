package com.smartcampus.repository;

import com.smartcampus.entity.Booking;
import com.smartcampus.entity.Booking.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserId(String userId);

    List<Booking> findByResource_Id(String resourceId);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByResource_IdAndStatusInAndIdNotAndStartTimeBeforeAndEndTimeAfter(
            String resourceId,
            List<BookingStatus> statuses,
            String excludeBookingId,
            LocalDateTime endTimeNew,
            LocalDateTime startTimeNew);

    List<Booking> findByUserIdAndStatus(String userId, BookingStatus status);
}
