package com.devflow.ai.dto;

import com.devflow.ai.model.enums.UserRole;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectMemberResponse {

    private Long id;
    private Long projectId;
    private UserDTO user;
    private UserRole role;
    private LocalDateTime joinedAt;
}
