package com.smartcampus.service;

import com.smartcampus.dto.ResourceDTO;
import com.smartcampus.entity.Resource;
import com.smartcampus.entity.Resource.ResourceStatus;
import com.smartcampus.entity.User;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResourceService {
    
    @Autowired
    private ResourceRepository resourceRepository;
    
    @Autowired
    private UserRepository userRepository;

    public ResourceDTO createResource(ResourceDTO resourceDTO, String createdById) {
        Resource resource = new Resource();
        resource.setResourceName(resourceDTO.getResourceName());
        resource.setResourceType(resourceDTO.getResourceType());
        resource.setCapacity(resourceDTO.getCapacity());
        resource.setLocation(resourceDTO.getLocation());
        resource.setDescription(resourceDTO.getDescription());
        resource.setStatus(ResourceStatus.ACTIVE);
        
        User createdBy = userRepository.findById(createdById)
                .orElseThrow(() -> new RuntimeException("User not found"));
        resource.setCreatedBy(createdBy);
        
        Resource saved = resourceRepository.save(resource);
        return convertToDTO(saved);
    }

    public ResourceDTO updateResource(String id, ResourceDTO resourceDTO) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        
        if (resourceDTO.getResourceName() != null) {
            resource.setResourceName(resourceDTO.getResourceName());
        }
        if (resourceDTO.getResourceType() != null) {
            resource.setResourceType(resourceDTO.getResourceType());
        }
        if (resourceDTO.getCapacity() != null) {
            resource.setCapacity(resourceDTO.getCapacity());
        }
        if (resourceDTO.getLocation() != null) {
            resource.setLocation(resourceDTO.getLocation());
        }
        if (resourceDTO.getDescription() != null) {
            resource.setDescription(resourceDTO.getDescription());
        }
        if (resourceDTO.getImageUrl() != null) {
            resource.setImageUrl(resourceDTO.getImageUrl());
        }
        
        Resource updated = resourceRepository.save(resource);
        return convertToDTO(updated);
    }

    public void deleteResource(String id) {
        if (!resourceRepository.existsById(id)) {
            throw new RuntimeException("Resource not found");
        }
        resourceRepository.deleteById(id);
    }

    public ResourceDTO getResourceById(String id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        return convertToDTO(resource);
    }

    public List<ResourceDTO> getAllResources() {
        return resourceRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ResourceDTO> searchResources(String searchTerm) {
        return resourceRepository.searchResources(searchTerm)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ResourceDTO> getResourcesByType(String type) {
        return resourceRepository.findByResourceType(type)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ResourceDTO> getResourcesByStatus(ResourceStatus status) {
        return resourceRepository.findByStatus(status)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ResourceDTO> getResourcesByLocation(String location) {
        return resourceRepository.findByLocationContainingIgnoreCase(location)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ResourceDTO changeResourceStatus(String id, ResourceStatus status) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        resource.setStatus(status);
        Resource updated = resourceRepository.save(resource);
        return convertToDTO(updated);
    }

    public List<ResourceDTO> getResourcesByCapacity(Integer minCapacity) {
        return resourceRepository.findByCapacityGreaterThanEqual(minCapacity)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private ResourceDTO convertToDTO(Resource resource) {
        ResourceDTO dto = new ResourceDTO();
        dto.setId(resource.getId());
        dto.setResourceName(resource.getResourceName());
        dto.setResourceType(resource.getResourceType());
        dto.setCapacity(resource.getCapacity());
        dto.setLocation(resource.getLocation());
        dto.setDescription(resource.getDescription());
        dto.setStatus(resource.getStatus());
        dto.setImageUrl(resource.getImageUrl());
        dto.setCreatedAt(resource.getCreatedAt());
        dto.setUpdatedAt(resource.getUpdatedAt());
        return dto;
    }
}
