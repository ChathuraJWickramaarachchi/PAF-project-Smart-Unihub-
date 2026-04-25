package com.smartcampus.service;

import com.smartcampus.dto.AnalyticsDTO;
import com.smartcampus.entity.Resource;
import com.smartcampus.entity.Resource.ResourceStatus;
import com.smartcampus.entity.Ticket;
import com.smartcampus.entity.Ticket.TicketStatus;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class AnalyticsService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private UserRepository userRepository;

    public AnalyticsDTO getSystemAnalytics() {
        AnalyticsDTO dto = new AnalyticsDTO();

        // 1. Ticket Resolution (Last 7 days)
        // Calculating total resolutions per day for the last 7 days
        List<Integer> resolutionCycle = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        List<Ticket> allTickets = ticketRepository.findAll();
        
        for (int i = 6; i >= 0; i--) {
            LocalDateTime startOfDay = now.minusDays(i).withHour(0).withMinute(0).withSecond(0).withNano(0);
            LocalDateTime endOfDay = now.minusDays(i).withHour(23).withMinute(59).withSecond(59).withNano(999999999);
            
            long count = allTickets.stream()
                    .filter(t -> t.getResolvedAt() != null && 
                            (t.getResolvedAt().isAfter(startOfDay) || t.getResolvedAt().isEqual(startOfDay)) && 
                            (t.getResolvedAt().isBefore(endOfDay) || t.getResolvedAt().isEqual(endOfDay)))
                    .count();
            // Scaling for visual impact if counts are low, or just using raw count
            resolutionCycle.add((int) count);
        }
        dto.setTicketResolution(resolutionCycle);
        dto.setResolvedToday(resolutionCycle.get(6));

        // 2. Resource Usage (Entropy) - Percentage load per category
        List<String> types = Arrays.asList(
            "LAB", "AUDITORIUM", "MEETING_ROOM", "SPORTS_FACILITY", 
            "LECTURE_HALL", "PROJECTOR", "SMART_BOARD", "WHITEBOARD", 
            "SOUND_SYSTEM", "MICROPHONE", "VR_BOX"
        );
        List<Integer> usage = new ArrayList<>();
        List<Integer> counts = new ArrayList<>();
        List<Integer> totals = new ArrayList<>();
        for (String type : types) {
            List<Resource> resources = resourceRepository.findByResourceType(type);
            if (resources.isEmpty()) {
                usage.add(0);
                counts.add(0);
                totals.add(0);
            } else {
                long total = resources.size();
                long active = resources.stream().filter(r -> r.getStatus() == ResourceStatus.ACTIVE).count();
                usage.add((int) ((active * 100) / total));
                counts.add((int) active);
                totals.add((int) total);
            }
        }
        dto.setResourceUsage(usage);
        dto.setResourceCounts(counts);
        dto.setResourceTotals(totals);

        // 3. Active Users
        dto.setActiveUsers(userRepository.countByIsActive(true));

        // 4. Total Tickets Resolved
        long resolved = ticketRepository.countByStatus(TicketStatus.RESOLVED);
        long closed = ticketRepository.countByStatus(TicketStatus.CLOSED);
        dto.setTotalTicketsResolved(resolved + closed);

        // 5. Efficiency
        long totalResources = resourceRepository.count();
        if (totalResources > 0) {
            long activeResources = resourceRepository.countByStatus(ResourceStatus.ACTIVE);
            dto.setActiveNodes(activeResources);
            dto.setEfficiency((double) (activeResources * 100) / totalResources);
        } else {
            dto.setActiveNodes(0);
            dto.setEfficiency(100.0);
        }

        return dto;
    }
}
