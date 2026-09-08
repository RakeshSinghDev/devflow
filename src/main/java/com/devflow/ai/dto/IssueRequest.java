package com.devflow.ai.dto;

import com.devflow.ai.model.enums.IssuePriority;
import com.devflow.ai.model.enums.IssueStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueRequest {

    @NotBlank(message = "Issue title is required")
    @Size(max = 150, message = "Issue title must not exceed 150 characters")
    private String title;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    private IssueStatus status;

    private IssuePriority priority;

    private Long assigneeId;

    private Long sprintId;

    private LocalDate dueDate;
}
