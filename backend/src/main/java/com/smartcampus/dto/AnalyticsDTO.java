package com.smartcampus.dto;

import java.util.List;

public class AnalyticsDTO {
    private List<Integer> ticketResolution;
    private List<Integer> resourceUsage;
    private List<Integer> resourceCounts;
    private List<Integer> resourceTotals;

    public List<Integer> getResourceCounts() {
        return resourceCounts;
    }

    public void setResourceCounts(List<Integer> resourceCounts) {
        this.resourceCounts = resourceCounts;
    }

    public List<Integer> getResourceTotals() {
        return resourceTotals;
    }

    public void setResourceTotals(List<Integer> resourceTotals) {
        this.resourceTotals = resourceTotals;
    }
    private long activeUsers;
    private long activeNodes;
    private long totalTicketsResolved;
    private long resolvedToday;
    private double efficiency;

    public long getActiveNodes() {
        return activeNodes;
    }

    public void setActiveNodes(long activeNodes) {
        this.activeNodes = activeNodes;
    }

    public long getResolvedToday() {
        return resolvedToday;
    }

    public void setResolvedToday(long resolvedToday) {
        this.resolvedToday = resolvedToday;
    }

    public List<Integer> getTicketResolution() {
        return ticketResolution;
    }

    public void setTicketResolution(List<Integer> ticketResolution) {
        this.ticketResolution = ticketResolution;
    }

    public List<Integer> getResourceUsage() {
        return resourceUsage;
    }

    public void setResourceUsage(List<Integer> resourceUsage) {
        this.resourceUsage = resourceUsage;
    }

    public long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(long activeUsers) {
        this.activeUsers = activeUsers;
    }

    public long getTotalTicketsResolved() {
        return totalTicketsResolved;
    }

    public void setTotalTicketsResolved(long totalTicketsResolved) {
        this.totalTicketsResolved = totalTicketsResolved;
    }

    public double getEfficiency() {
        return efficiency;
    }

    public void setEfficiency(double efficiency) {
        this.efficiency = efficiency;
    }
}
