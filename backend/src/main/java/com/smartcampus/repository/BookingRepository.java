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
    List<Booking> findByResourceId(String resourceId);
    List<Booking> findByStatus(BookingStatus status);
    
    @Query(value = "{'resource.id': ?0, 'status': 'APPROVED', 'startTime': {$lte: ?2}, 'endTime': {$gte: ?1}}")
    List<Booking> findConflictingBookings(
            String resourceId,
            LocalDateTime startTime,
            LocalDateTime endTime
    );
    
    List<Booking> findByUserIdAndStatus(String userId, BookingStatus status);
}
