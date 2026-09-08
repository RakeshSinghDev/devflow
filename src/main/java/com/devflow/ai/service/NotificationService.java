package com.devflow.ai.service;

import com.devflow.ai.dto.NotificationDTO;
import com.devflow.ai.dto.UnreadCountResponse;
import com.devflow.ai.exception.ForbiddenException;
import com.devflow.ai.exception.ResourceNotFoundException;
import com.devflow.ai.model.Notification;
import com.devflow.ai.model.User;
import com.devflow.ai.model.enums.NotificationType;
import com.devflow.ai.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final AuthService authService;

    public List<NotificationDTO> getNotificationsForCurrentUser() {
        User currentUser = authService.getCurrentUserEntity();
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(currentUser.getId()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public UnreadCountResponse getUnreadCountForCurrentUser() {
        User currentUser = authService.getCurrentUserEntity();
        long count = notificationRepository.countByRecipientIdAndIsReadFalse(currentUser.getId());
        return new UnreadCountResponse(count);
    }

    @Transactional
    public NotificationDTO markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        User currentUser = authService.getCurrentUserEntity();
        if (!notification.getRecipient().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You can only update your own notifications");
        }

        notification.setRead(true);
        Notification saved = notificationRepository.save(notification);
        return mapToDTO(saved);
    }

    @Transactional
    public void markAllAsReadForCurrentUser() {
        User currentUser = authService.getCurrentUserEntity();
        List<Notification> unread = notificationRepository.findByRecipientIdAndIsReadFalse(currentUser.getId());
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    @Transactional
    public void sendNotification(User recipient, User actor, NotificationType type, String title, String message, String refType, Long refId) {
        if (recipient == null || recipient.getId() == null) return;
        // Never notify a user about their own action
        if (actor != null && recipient.getId().equals(actor.getId())) return;

        Notification notification = Notification.builder()
                .recipient(recipient)
                .type(type)
                .title(title)
                .message(message)
                .referenceType(refType)
                .referenceId(refId)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);
    }

    public NotificationDTO mapToDTO(Notification notification) {
        if (notification == null) return null;
        return NotificationDTO.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .referenceType(notification.getReferenceType())
                .referenceId(notification.getReferenceId())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
