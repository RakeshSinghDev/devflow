package com.devflow.ai.dto;

import com.devflow.ai.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberWorkloadDTO {
    private Long userId;
    private String name;
    private String email;
    private UserRole role;
    private long assignedIssues;
    private long completedIssues;
    private double completionPercentage;
}
