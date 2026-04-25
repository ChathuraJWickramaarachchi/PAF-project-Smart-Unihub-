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
    
    @Query(value = "{'resource': ?0, 'id': { $ne: ?3 }, 'status': { $in: ['APPROVED', 'PENDING'] }, 'startTime': { $lt: ?2 }, 'endTime': { $gt: ?1 } }")
    List<Booking> findConflictingBookings(
            com.smartcampus.entity.Resource resource,
            LocalDateTime startTime,
            LocalDateTime endTime,
            String excludeBookingId
    );
    
    List<Booking> findByUserIdAndStatus(String userId, BookingStatus status);
}
