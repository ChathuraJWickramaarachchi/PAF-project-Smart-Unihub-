package com.smartcampus.repository;

import com.smartcampus.entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserId(String userId);
    
    @Query(value = "{'user.id': ?0, 'isRead': false}", sort = "{'createdAt': -1}")
    List<Notification> findUnreadNotifications(String userId);
    
    List<Notification> findByUserIdAndIsReadFalse(String userId);
    
    @Query(value = "{'user.id': ?0, 'isRead': false}")
    Long countUnreadNotifications(String userId);
}
