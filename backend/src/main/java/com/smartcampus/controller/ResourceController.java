package com.smartcampus.controller;

import com.smartcampus.dto.ResourceDTO;
import com.smartcampus.entity.Resource.ResourceStatus;
import com.smartcampus.service.ResourceService;
import com.smartcampus.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/resources")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ResourceController {
    
    @Autowired
    private ResourceService resourceService;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Extract user ID from Authorization header
     */
    private String getCurrentUserId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtUtil.getUserIdFromToken(token);
        }
        return null;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceDTO> createResource(@Valid @RequestBody ResourceDTO resourceDTO, HttpServletRequest request) {
        String userId = getCurrentUserId(request);
        ResourceDTO created = resourceService.createResource(resourceDTO, userId != null ? userId : "1");
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceDTO> updateResource(@PathVariable String id, 
                                                     @Valid @RequestBody ResourceDTO resourceDTO) {
        ResourceDTO updated = resourceService.updateResource(id, resourceDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceDTO> getResource(@PathVariable String id) {
        ResourceDTO resource = resourceService.getResourceById(id);
        return ResponseEntity.ok(resource);
    }

    @GetMapping
    public ResponseEntity<List<ResourceDTO>> getAllResources() {
        List<ResourceDTO> resources = resourceService.getAllResources();
        return ResponseEntity.ok(resources);
    }

    @GetMapping("/search")
    public ResponseEntity<List<ResourceDTO>> searchResources(@RequestParam String searchTerm) {
        List<ResourceDTO> resources = resourceService.searchResources(searchTerm);
        return ResponseEntity.ok(resources);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<ResourceDTO>> getByType(@PathVariable String type) {
        List<ResourceDTO> resources = resourceService.getResourcesByType(type);
        return ResponseEntity.ok(resources);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ResourceDTO>> getByStatus(@PathVariable String status) {
        ResourceStatus statusEnum = ResourceStatus.valueOf(status.toUpperCase());
        List<ResourceDTO> resources = resourceService.getResourcesByStatus(statusEnum);
        return ResponseEntity.ok(resources);
    }

    @GetMapping("/location/{location}")
    public ResponseEntity<List<ResourceDTO>> getByLocation(@PathVariable String location) {
        List<ResourceDTO> resources = resourceService.getResourcesByLocation(location);
        return ResponseEntity.ok(resources);
    }

    @GetMapping("/capacity/{capacity}")
    public ResponseEntity<List<ResourceDTO>> getByCapacity(@PathVariable Integer capacity) {
        List<ResourceDTO> resources = resourceService.getResourcesByCapacity(capacity);
        return ResponseEntity.ok(resources);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceDTO> changeStatus(@PathVariable String id, 
                                                    @RequestParam String status) {
        ResourceStatus statusEnum = ResourceStatus.valueOf(status.toUpperCase());
        ResourceDTO updated = resourceService.changeResourceStatus(id, statusEnum);
        return ResponseEntity.ok(updated);
    }
}
