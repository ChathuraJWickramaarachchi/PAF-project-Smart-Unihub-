package com.smartcampus.repository;

import com.smartcampus.entity.Ticket;
import com.smartcampus.entity.Ticket.TicketStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {
    Optional<Ticket> findByTicketNumber(String ticketNumber);
    List<Ticket> findByStatus(TicketStatus status);
    List<Ticket> findByReportedById(String userId);
    List<Ticket> findByAssignedToId(String userId);
    List<Ticket> findByResourceId(String resourceId);
    
    @Query(value = "{'status': ?0}", sort = "{'createdAt': -1}")
    List<Ticket> findByStatusOrderByCreatedAtDesc(TicketStatus status);
    
    @Query(value = "{'status': ?0, 'assignedTo.id': ?1}")
    Long countByStatusAndAssignedToId(TicketStatus status, String userId);
}
