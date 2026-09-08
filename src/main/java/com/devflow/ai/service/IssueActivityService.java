package com.devflow.ai.service;

import com.devflow.ai.dto.IssueActivityDTO;
import com.devflow.ai.model.Issue;
import com.devflow.ai.model.IssueActivity;
import com.devflow.ai.model.User;
import com.devflow.ai.repository.IssueActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IssueActivityService {

    private final IssueActivityRepository issueActivityRepository;
    private final AuthService authService;

    @Transactional
    public void logActivity(Issue issue, User user, String actionType, String description) {
        if (issue == null || user == null) return;

        IssueActivity activity = IssueActivity.builder()
                .issue(issue)
                .user(user)
                .actionType(actionType)
                .description(description)
                .createdAt(LocalDateTime.now())
                .build();

        issueActivityRepository.save(activity);
    }

    public List<IssueActivityDTO> getActivityByIssue(Long issueId) {
        return issueActivityRepository.findByIssueIdOrderByCreatedAtDesc(issueId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public IssueActivityDTO mapToDTO(IssueActivity activity) {
        if (activity == null) return null;
        return IssueActivityDTO.builder()
                .id(activity.getId())
                .issueId(activity.getIssue().getId())
                .user(authService.mapToUserDTO(activity.getUser()))
                .actionType(activity.getActionType())
                .description(activity.getDescription())
                .createdAt(activity.getCreatedAt())
                .build();
    }
}
