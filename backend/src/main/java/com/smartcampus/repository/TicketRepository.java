package com.smartcampus.repository;

import com.smartcampus.entity.Ticket;
import com.smartcampus.entity.Ticket.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Optional<Ticket> findByTicketNumber(String ticketNumber);
    List<Ticket> findByStatus(TicketStatus status);
    List<Ticket> findByReportedById(Long userId);
    List<Ticket> findByAssignedToId(Long userId);
    List<Ticket> findByResourceId(Long resourceId);
    
    @Query("SELECT t FROM Ticket t WHERE t.status = :status ORDER BY t.createdAt DESC")
    List<Ticket> findByStatusOrderByCreatedAtDesc(@Param("status") TicketStatus status);
    
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.status = :status AND t.assignedTo.id = :userId")
    Long countByStatusAndAssignedToId(@Param("status") TicketStatus status, @Param("userId") Long userId);
}
