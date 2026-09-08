package com.devflow.ai.service;

import com.devflow.ai.exception.ForbiddenException;
import com.devflow.ai.model.*;
import com.devflow.ai.model.enums.UserRole;
import com.devflow.ai.repository.ProjectMemberRepository;
import com.devflow.ai.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectAuthorizationServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ProjectMemberRepository projectMemberRepository;

    @Mock
    private AuthService authService;

    @InjectMocks
    private ProjectAuthorizationService authorizationService;

    private User owner;
    private User memberUser;
    private User nonMemberUser;
    private User globalAdmin;
    private Project project;
    private ProjectMember memberRole;
    private ProjectMember adminRole;

    @BeforeEach
    void setUp() {
        owner = User.builder().id(1L).name("Owner User").email("owner@example.com").role(UserRole.MEMBER).build();
        memberUser = User.builder().id(2L).name("Member User").email("member@example.com").role(UserRole.MEMBER).build();
        nonMemberUser = User.builder().id(3L).name("Non Member").email("nonmember@example.com").role(UserRole.MEMBER).build();
        globalAdmin = User.builder().id(4L).name("Global Admin").email("admin@example.com").role(UserRole.ADMIN).build();

        project = Project.builder().id(100L).name("Auth Test Project").owner(owner).build();

        memberRole = ProjectMember.builder().id(10L).project(project).user(memberUser).role(UserRole.MEMBER).build();
        adminRole = ProjectMember.builder().id(11L).project(project).user(memberUser).role(UserRole.ADMIN).build();
    }

    @Test
    void verifyCanViewProject_asOwner_shouldPass() {
        when(authService.getCurrentUserEntity()).thenReturn(owner);
        assertDoesNotThrow(() -> authorizationService.verifyCanViewProject(project));
    }

    @Test
    void verifyCanViewProject_asMember_shouldPass() {
        when(authService.getCurrentUserEntity()).thenReturn(memberUser);
        when(projectMemberRepository.existsByProjectIdAndUserId(100L, 2L)).thenReturn(true);
        assertDoesNotThrow(() -> authorizationService.verifyCanViewProject(project));
    }

    @Test
    void verifyCanViewProject_asNonMember_shouldThrowForbidden() {
        when(authService.getCurrentUserEntity()).thenReturn(nonMemberUser);
        when(projectMemberRepository.existsByProjectIdAndUserId(100L, 3L)).thenReturn(false);
        assertThrows(ForbiddenException.class, () -> authorizationService.verifyCanViewProject(project));
    }

    @Test
    void verifyCanManageMembers_asOwner_shouldPass() {
        when(authService.getCurrentUserEntity()).thenReturn(owner);
        assertDoesNotThrow(() -> authorizationService.verifyCanManageMembers(project));
    }

    @Test
    void verifyCanManageMembers_asNormalMember_shouldThrowForbidden() {
        when(authService.getCurrentUserEntity()).thenReturn(memberUser);
        when(projectMemberRepository.findByProjectIdAndUserId(100L, 2L)).thenReturn(Optional.of(memberRole));
        assertThrows(ForbiddenException.class, () -> authorizationService.verifyCanManageMembers(project));
    }

    @Test
    void verifyOwnerNotRemoved_whenRemovingOwner_shouldThrowForbidden() {
        assertThrows(ForbiddenException.class, () -> authorizationService.verifyOwnerNotRemoved(project, 1L));
    }

    @Test
    void verifyOwnerNotRemoved_whenRemovingNormalMember_shouldPass() {
        assertDoesNotThrow(() -> authorizationService.verifyOwnerNotRemoved(project, 2L));
    }
}
