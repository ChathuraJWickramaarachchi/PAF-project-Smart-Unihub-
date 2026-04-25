package com.smartcampus.repository;

import com.smartcampus.entity.Resource;
import com.smartcampus.entity.Resource.ResourceStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {
    List<Resource> findByResourceType(String resourceType);
    List<Resource> findByStatus(ResourceStatus status);
    List<Resource> findByLocationContainingIgnoreCase(String location);
    
    @Query(value = "{'$or': [{'resourceName': {'$regex': ?0, '$options': 'i'}}, {'location': {'$regex': ?0, '$options': 'i'}}]}")
    List<Resource> searchResources(String searchTerm);
    
    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);

    long countByStatus(ResourceStatus status);
}
