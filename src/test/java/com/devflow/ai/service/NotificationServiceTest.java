package com.devflow.ai.service;

import com.devflow.ai.dto.NotificationDTO;
import com.devflow.ai.dto.UnreadCountResponse;
import com.devflow.ai.exception.ForbiddenException;
import com.devflow.ai.model.Notification;
import com.devflow.ai.model.User;
import com.devflow.ai.model.enums.NotificationType;
import com.devflow.ai.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private AuthService authService;

    @InjectMocks
    private NotificationService notificationService;

    private User recipient;
    private User actor;
    private Notification notification;

    @BeforeEach
    void setUp() {
        recipient = User.builder().id(10L).name("Recipient").email("recipient@example.com").build();
        actor = User.builder().id(20L).name("Actor").email("actor@example.com").build();

        notification = Notification.builder()
                .id(100L)
                .recipient(recipient)
                .type(NotificationType.ISSUE_ASSIGNED)
                .title("Task Assigned")
                .message("Issue assigned to you")
                .referenceType("ISSUE")
                .referenceId(50L)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void sendNotification_forDifferentUser_shouldSaveNotification() {
        notificationService.sendNotification(recipient, actor, NotificationType.ISSUE_ASSIGNED, "Title", "Message", "ISSUE", 50L);
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    void sendNotification_forSelf_shouldNotSaveNotification() {
        notificationService.sendNotification(recipient, recipient, NotificationType.ISSUE_ASSIGNED, "Title", "Message", "ISSUE", 50L);
        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    void getUnreadCount_shouldReturnCorrectCount() {
        when(authService.getCurrentUserEntity()).thenReturn(recipient);
        when(notificationRepository.countByRecipientIdAndIsReadFalse(10L)).thenReturn(3L);

        UnreadCountResponse response = notificationService.getUnreadCountForCurrentUser();
        assertEquals(3L, response.getCount());
    }

    @Test
    void markAsRead_asRecipient_shouldSucceed() {
        when(notificationRepository.findById(100L)).thenReturn(Optional.of(notification));
        when(authService.getCurrentUserEntity()).thenReturn(recipient);
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        NotificationDTO result = notificationService.markAsRead(100L);

        assertNotNull(result);
        assertTrue(result.isRead());
    }

    @Test
    void markAsRead_asOtherUser_shouldThrowForbiddenException() {
        when(notificationRepository.findById(100L)).thenReturn(Optional.of(notification));
        when(authService.getCurrentUserEntity()).thenReturn(actor);

        assertThrows(ForbiddenException.class, () -> notificationService.markAsRead(100L));
    }
}
