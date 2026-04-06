package com.smartcampus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String profilePictureUrl;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private Set<RoleDTO> roles;
}
