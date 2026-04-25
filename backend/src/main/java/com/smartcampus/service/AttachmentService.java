package com.smartcampus.service;

import com.smartcampus.dto.AttachmentDTO;
import com.smartcampus.entity.Attachment;
import com.smartcampus.entity.Ticket;
import com.smartcampus.entity.User;
import com.smartcampus.repository.AttachmentRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AttachmentService {

    @Autowired
    private AttachmentRepository attachmentRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    private final Path uploadDir = Paths.get("uploads/tickets");

    public List<AttachmentDTO> uploadFiles(String ticketId, String userId, List<MultipartFile> files) throws IOException {
        // Ensure upload directory exists
        Files.createDirectories(uploadDir);

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User uploader = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Attachment> savedAttachments = new ArrayList<>();

        for (MultipartFile file : files) {
            // Validate file type (images only)
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new RuntimeException("Only image files are allowed. Got: " + contentType);
            }

            // Generate unique filename
            String extension = getFileExtension(file.getOriginalFilename());
            String storedFileName = UUID.randomUUID().toString() + extension;

            // Save file to disk
            Path filePath = uploadDir.resolve(storedFileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Create attachment entity
            Attachment attachment = new Attachment();
            attachment.setFileName(file.getOriginalFilename());
            attachment.setFileUrl("/api/tickets/attachments/file/" + storedFileName);
            attachment.setFileType(contentType);
            attachment.setFileSize(file.getSize());
            attachment.setTicket(ticket);
            attachment.setUploadedBy(uploader);
            attachment.setCreatedAt(LocalDateTime.now());

            savedAttachments.add(attachmentRepository.save(attachment));
        }

        // Update ticket's attachment list
        List<Attachment> existingAttachments = ticket.getAttachments();
        if (existingAttachments == null) {
            existingAttachments = new ArrayList<>();
        }
        existingAttachments.addAll(savedAttachments);
        ticket.setAttachments(existingAttachments);
        ticketRepository.save(ticket);

        return savedAttachments.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<AttachmentDTO> getAttachmentsByTicket(String ticketId) {
        return attachmentRepository.findByTicketId(ticketId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Path getFilePath(String fileName) {
        return uploadDir.resolve(fileName);
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) return "";
        return fileName.substring(fileName.lastIndexOf("."));
    }

    private AttachmentDTO convertToDTO(Attachment attachment) {
        AttachmentDTO dto = new AttachmentDTO();
        dto.setId(attachment.getId());
        dto.setFileName(attachment.getFileName());
        dto.setFileUrl(attachment.getFileUrl());
        dto.setFileType(attachment.getFileType());
        dto.setFileSize(attachment.getFileSize());
        if (attachment.getTicket() != null) {
            dto.setTicketId(attachment.getTicket().getId());
        }
        if (attachment.getUploadedBy() != null) {
            dto.setUploadedById(attachment.getUploadedBy().getId());
        }
        dto.setCreatedAt(attachment.getCreatedAt());
        return dto;
    }
}
