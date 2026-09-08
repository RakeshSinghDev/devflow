package com.devflow.ai.dto;

import com.devflow.ai.model.enums.IssueStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private IssueStatus status;
}
