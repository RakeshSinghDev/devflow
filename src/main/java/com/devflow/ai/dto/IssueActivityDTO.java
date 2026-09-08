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
public class IssueActivityDTO {
    private Long id;
    private Long issueId;
    private UserDTO user;
    private String actionType;
    private String description;
    private LocalDateTime createdAt;
}
