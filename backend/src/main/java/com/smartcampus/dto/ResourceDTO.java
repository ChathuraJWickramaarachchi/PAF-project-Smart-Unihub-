package com.smartcampus.dto;

import com.smartcampus.entity.Resource.ResourceStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResourceDTO {
    private Long id;

    @NotBlank(message = "Resource name is required")
    private String resourceName;

    @NotBlank(message = "Resource type is required")
    private String resourceType;

    @NotNull(message = "Capacity is required")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location;

    private String description;
    private ResourceStatus status;
    private String imageUrl;
    private Long createdById;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}





































