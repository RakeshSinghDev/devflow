package com.devflow.ai.dto;

import com.devflow.ai.model.enums.UserRole;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberProfileDTO {
    private Long id;
    private Long userId;
    private String name;
    private String email;
    private UserRole globalRole;
    private UserRole projectRole;
    private LocalDateTime accountCreatedAt;
    private LocalDateTime joinedProjectAt;
    private long assignedIssueCount;
    private long createdIssueCount;
    private String jobTitle;
    private String bio;
    private String timezone;
}
