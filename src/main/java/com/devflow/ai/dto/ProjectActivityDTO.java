package com.devflow.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectActivityDTO {
    private Long id;
    private Long projectId;
    private UserDTO actor;
    private String actionType;
    private String entityType;
    private Long entityId;
    private String description;
    private LocalDateTime createdAt;
}
