package com.smartcampus.repository;

import com.smartcampus.entity.User;
import com.smartcampus.entity.User.ApprovalStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleId(String googleId);
    boolean existsByEmail(String email);
    List<User> findByApprovalStatus(ApprovalStatus approvalStatus);
}
