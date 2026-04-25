package com.smartcampus.dto;

import java.time.LocalDateTime;
import java.util.Set;

public class UserDTO {
    private String id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String profilePictureUrl;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private Set<RoleDTO> roles;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Set<RoleDTO> getRoles() { return roles; }
    public void setRoles(Set<RoleDTO> roles) { this.roles = roles; }
}
