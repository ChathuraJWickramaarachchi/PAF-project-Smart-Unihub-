package com.smartcampus.repository;

import com.smartcampus.entity.Resource;
import com.smartcampus.entity.Resource.ResourceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByResourceType(String resourceType);
    List<Resource> findByStatus(ResourceStatus status);
    List<Resource> findByLocationContainingIgnoreCase(String location);
    
    @Query("SELECT r FROM Resource r WHERE " +
           "LOWER(r.resourceName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(r.location) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Resource> searchResources(@Param("searchTerm") String searchTerm);
    
    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);
}
