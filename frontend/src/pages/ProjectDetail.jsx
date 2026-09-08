import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Kanban, 
  RefreshCw, 
  Users, 
  Settings, 
  Plus, 
  Trash2, 
  Layers,
  Pencil,
  UserPlus,
  UserMinus,
  Check,
  Search,
  AlertCircle,
  Eye,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  BarChart3
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input, { Select, Textarea } from '../components/Input';
import ProgressBar from '../components/ProgressBar';
import Tabs from '../components/Tabs';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import IssueCard from '../components/IssueCard';
import CommentSection from '../components/CommentSection';
import ProjectModal from '../components/ProjectModal';
import { CardSkeleton } from '../components/Skeleton';
import ErrorMessage from '../components/ErrorMessage';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('board');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Issues State
  const [issues, setIssues] = useState([]);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDesc, setIssueDesc] = useState('');
  const [issuePriority, setIssuePriority] = useState('MEDIUM');
  const [issueAssigneeId, setIssueAssigneeId] = useState('');
  const [issueSprintId, setIssueSprintId] = useState('');
  const [issueDueDate, setIssueDueDate] = useState('');

  // Selected Issue Modal
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [issueDetailTab, setIssueDetailTab] = useState('comments');

  // Sprints State
  const [sprints, setSprints] = useState([]);
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [sprintName, setSprintName] = useState('');
  const [sprintGoal, setSprintGoal] = useState('');
  const [sprintStartDate, setSprintStartDate] = useState('');
  const [sprintEndDate, setSprintEndDate] = useState('');

  // Members State
  const [members, setMembers] = useState([]);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState(null);
  const [memberRole, setMemberRole] = useState('MEMBER');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const activeMemberSearchRequestIdRef = useRef(0);

  // Remove Member Confirmation State
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removingMember, setRemovingMember] = useState(false);

  // Member Profile State
  const [selectedProfileUser, setSelectedProfileUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Analytics State
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [projectActivities, setProjectActivities] = useState([]);

  // Edit Project Modal
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const res = await api.get(`/projects/${id}/analytics`);
      setAnalytics(res.data);
    } catch (err) {
      console.error("Failed to load project analytics", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchProjectActivity = async () => {
    try {
      const res = await api.get(`/projects/${id}/activity`);
      setProjectActivities(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load project activity stream", err);
    }
  };

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      setError('');
      const [projRes, issuesRes, sprintsRes, membersRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/issues`),
        api.get(`/projects/${id}/sprints`),
        api.get(`/projects/${id}/members`),
      ]);
      setProject(projRes.data);
      setIssues(issuesRes.data);
      setSprints(sprintsRes.data);
      setMembers(membersRes.data);
    } catch (err) {
      setError('Failed to load project workspace.');
      setLoading(false);
      return;
    }

    fetchAnalytics();
    fetchProjectActivity();
    setLoading(false);
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  // Fetch Available (non-member) Registered Users
  const fetchAvailableUsers = async (query = '') => {
    const requestId = ++activeMemberSearchRequestIdRef.current;
    try {
      const res = await api.get(`/projects/${id}/available-members?query=${encodeURIComponent(query)}`);
      if (requestId === activeMemberSearchRequestIdRef.current) {
        setAvailableUsers(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      if (requestId === activeMemberSearchRequestIdRef.current) {
        console.error("Failed to load available users", err);
      }
    }
  };

  const handleOpenAddMemberModal = () => {
    setIsMemberModalOpen(true);
    setSelectedUserToAdd(null);
    setUserSearchQuery('');
  };

  const handleSearchAvailableUsers = (query) => {
    setUserSearchQuery(query);
  };

  useEffect(() => {
    if (!isMemberModalOpen) return;
    const timer = setTimeout(() => {
      fetchAvailableUsers(userSearchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearchQuery, isMemberModalOpen]);

  const fetchIssueActivity = async (issueId) => {
    try {
      const res = await api.get(`/issues/${issueId}/activity`);
      setActivities(res.data);
    } catch (err) {
      console.error("Failed to load issue activity", err);
    }
  };

  // Optimistic Status Change Handler
  const handleStatusChange = async (issueId, newStatus) => {
    const previousIssues = [...issues];
    setIssues(issues.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i)));

    if (selectedIssue && selectedIssue.id === issueId) {
      setSelectedIssue({ ...selectedIssue, status: newStatus });
    }

    try {
      await api.patch(`/issues/${issueId}/status`, { status: newStatus });
      addToast(`Status updated to ${newStatus.replace('_', ' ')}`, 'success');
      fetchAnalytics();
      if (selectedIssue && selectedIssue.id === issueId) {
        fetchIssueActivity(issueId);
      }
    } catch (err) {
      setIssues(previousIssues);
      if (selectedIssue && selectedIssue.id === issueId) {
        setSelectedIssue(previousIssues.find((i) => i.id === issueId));
      }
      addToast('Failed to update issue status', 'error');
    }
  };

  // Issue Creation
  const handleCreateIssue = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/projects/${id}/issues`, {
        title: issueTitle,
        description: issueDesc,
        priority: issuePriority,
        assigneeId: issueAssigneeId ? parseInt(issueAssigneeId) : null,
        sprintId: issueSprintId ? parseInt(issueSprintId) : null,
        dueDate: issueDueDate || null,
      });
      addToast('Issue created successfully', 'success');
      setIsIssueModalOpen(false);
      setIssueTitle('');
      setIssueDesc('');
      setIssues([...issues, res.data]);
      fetchAnalytics();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create issue', 'error');
    }
  };

  // View Issue Details & Comments & Activity
  const handleOpenIssueDetails = async (issue) => {
    setSelectedIssue(issue);
    setIssueDetailTab('comments');
    try {
      const [commentsRes, activityRes] = await Promise.all([
        api.get(`/issues/${issue.id}/comments`),
        api.get(`/issues/${issue.id}/activity`)
      ]);
      setComments(commentsRes.data);
      setActivities(activityRes.data);
    } catch (err) {
      console.error("Failed to load issue details", err);
    }
  };

  const handleAddComment = async (content) => {
    if (!selectedIssue) return;
    try {
      const res = await api.post(`/issues/${selectedIssue.id}/comments`, { content });
      setComments([...comments, res.data]);
      fetchIssueActivity(selectedIssue.id);
      addToast('Comment posted', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add comment', 'error');
    }
  };

  const handleUpdateComment = async (commentId, content) => {
    if (!selectedIssue) return;
    try {
      const res = await api.put(`/comments/${commentId}`, { content });
      setComments(comments.map((c) => (c.id === commentId ? res.data : c)));
      fetchIssueActivity(selectedIssue.id);
      addToast('Comment updated', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update comment', 'error');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(comments.filter((c) => c.id !== commentId));
      if (selectedIssue) fetchIssueActivity(selectedIssue.id);
      addToast('Comment deleted', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete comment', 'error');
    }
  };

  // Sprint Creation
  const handleCreateSprint = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/projects/${id}/sprints`, {
        name: sprintName,
        goal: sprintGoal,
        startDate: sprintStartDate || null,
        endDate: sprintEndDate || null,
      });
      addToast('Sprint created', 'success');
      setIsSprintModalOpen(false);
      setSprintName('');
      setSprintGoal('');
      setSprints([...sprints, res.data]);
    } catch (err) {
      addToast('Failed to create sprint', 'error');
    }
  };

  const handleUpdateSprintStatus = async (sprintId, status) => {
    try {
      const res = await api.put(`/sprints/${sprintId}`, { status });
      addToast(`Sprint updated to ${status}`, 'success');
      setSprints(sprints.map((s) => (s.id === sprintId ? res.data : s)));
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update sprint', 'error');
    }
  };

  // Member Addition
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserToAdd) return;
    setAddingMember(true);
    try {
      const res = await api.post(`/projects/${id}/members`, {
        userId: selectedUserToAdd.id,
        role: memberRole,
      });
      addToast('Member added successfully', 'success');
      setIsMemberModalOpen(false);
      setSelectedUserToAdd(null);
      setUserSearchQuery('');
      setMembers([...members, res.data]);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add member', 'error');
    } finally {
      setAddingMember(false);
    }
  };

  // View Member Profile
  const handleViewProfile = async (userId) => {
    try {
      setProfileLoading(true);
      const res = await api.get(`/projects/${id}/members/${userId}/profile`);
      setSelectedProfileUser(res.data);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load member profile', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  // Member Removal
  const handleConfirmRemoveMember = async () => {
    if (!memberToRemove) return;
    setRemovingMember(true);
    const removedName = memberToRemove.name;
    const removedId = memberToRemove.id;
    try {
      await api.delete(`/projects/${id}/members/${removedId}`);
      addToast(`${removedName} was removed from the project.`, 'success');
      setMembers(members.filter((m) => m.user?.id !== removedId));
      setMemberToRemove(null);
      if (selectedProfileUser && selectedProfileUser.userId === removedId) {
        setSelectedProfileUser(null);
      }
      fetchProjectData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Unable to remove member. Please try again.', 'error');
    } finally {
      setRemovingMember(false);
    }
  };

  const handleEditProjectSubmit = async (data) => {
    try {
      const res = await api.put(`/projects/${id}`, data);
      setProject(res.data);
      addToast('Project updated', 'success');
    } catch (err) {
      addToast('Failed to update project', 'error');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
    try {
      await api.delete(`/projects/${id}`);
      addToast('Project deleted', 'success');
      navigate('/projects');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete project', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 dark:bg-[#1B1F27] rounded-xl"></div>
        <div className="grid grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return <ErrorMessage message={error || 'Project not found.'} onRetry={fetchProjectData} />;
  }

  const isOwner = project.owner?.id === currentUser?.id;
  const isOwnerOrAdmin = isOwner || members.some((m) => m.user?.id === currentUser?.id && (m.role === 'ADMIN' || m.role === 'OWNER'));

  const doneCount = issues.filter((i) => i.status === 'DONE').length;
  const inProgressCount = issues.filter((i) => i.status === 'IN_PROGRESS').length;
  const inReviewCount = issues.filter((i) => i.status === 'IN_REVIEW').length;
  const todoCount = issues.filter((i) => i.status === 'TODO' || i.status === 'BACKLOG').length;
  const progressPercent = issues.length > 0 ? Math.round((doneCount / issues.length) * 100) : 0;

  const columns = [
    { key: 'TODO', label: 'TODO', badgeBg: 'bg-slate-100 dark:bg-[#1B1F27] text-text-secondaryLight dark:text-text-secondaryDark', columnBg: 'bg-slate-50/50 dark:bg-[#0F1115]' },
    { key: 'IN_PROGRESS', label: 'IN PROGRESS', badgeBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300', columnBg: 'bg-blue-50/30 dark:bg-blue-950/20' },
    { key: 'IN_REVIEW', label: 'IN REVIEW', badgeBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300', columnBg: 'bg-purple-50/30 dark:bg-purple-950/20' },
    { key: 'DONE', label: 'DONE', badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300', columnBg: 'bg-emerald-50/30 dark:bg-emerald-950/20' },
  ];

  const tabList = [
    { id: 'board', label: 'Tasks', icon: Kanban },
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'sprints', label: 'Sprints', icon: RefreshCw, count: sprints.length },
    { id: 'members', label: 'Team', icon: Users, count: members.length },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6 page-fade-enter pb-8">
      {/* Project Header Banner */}
      <Card variant="standard" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-lg border border-blue-200/60 dark:border-blue-900/50">
              PRJ-{project.id}
            </span>
            <h1 className="text-2xl font-bold text-text-primaryLight dark:text-text-primaryDark tracking-tight truncate">
              {project.name}
            </h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark max-w-3xl leading-relaxed">
            {project.description || 'No description specified for this workspace.'}
          </p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          {isOwnerOrAdmin && (
            <Button
              variant="secondary"
              size="md"
              icon={Pencil}
              onClick={() => setIsEditProjectOpen(true)}
            >
              Edit
            </Button>
          )}
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsIssueModalOpen(true)}
          >
            Create Issue
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs tabs={tabList} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: TASKS */}
      {activeTab === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 overflow-x-auto pb-4">
          {columns.map((col) => {
            const colIssues = issues.filter((i) => i.status === col.key);
            return (
              <div key={col.key} className={`${col.columnBg} border border-border-light dark:border-border-dark rounded-2xl p-4 flex flex-col min-w-[270px] shadow-soft-sm`}>
                <div className="flex items-center justify-between mb-3.5 px-1">
                  <span className={`text-[11px] font-semibold tracking-wider px-2.5 py-0.5 rounded-lg ${col.badgeBg}`}>
                    {col.label}
                  </span>
                  <span className="font-mono text-xs font-semibold text-text-mutedLight dark:text-text-mutedDark">{colIssues.length}</span>
                </div>

                <div className="space-y-3 flex-1 min-h-[380px]">
                  {colIssues.length === 0 ? (
                    <div className="h-28 rounded-2xl bg-white/60 dark:bg-[#15181E]/60 border border-dashed border-border-light dark:border-border-dark flex items-center justify-center text-[11px] text-text-mutedLight dark:text-text-mutedDark">
                      No tasks in {col.label.toLowerCase()}
                    </div>
                  ) : (
                    colIssues.map((issue) => (
                      <IssueCard key={issue.id} issue={issue} onClick={handleOpenIssueDetails} onStatusChange={handleStatusChange} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: ANALYTICS & OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {analyticsLoading && !analytics ? (
            <Card variant="standard" className="p-8 text-center space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 dark:text-blue-400" />
              <p className="text-xs font-semibold text-text-mutedLight dark:text-text-mutedDark">Loading real-time project analytics...</p>
            </Card>
          ) : analytics && analytics.totalIssues === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No task data yet"
              description="Create your first task in this project to start tracking real progress, sprint metrics, and team workload."
              actionLabel="Create Task"
              onAction={() => setIsIssueModalOpen(true)}
              actionIcon={Plus}
            />
          ) : analytics ? (
            <>
              {/* Project Health Banner */}
              <Card variant="standard" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-blue-600 dark:border-l-blue-500">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-xl ${
                    analytics.health?.status === 'HEALTHY' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' :
                    analytics.health?.status === 'AT_RISK' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400' :
                    analytics.health?.status === 'COMPLETED' ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400' :
                    'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {analytics.health?.status === 'AT_RISK' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-text-primaryLight dark:text-text-primaryDark">Project Health</span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                        analytics.health?.status === 'HEALTHY' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                        analytics.health?.status === 'AT_RISK' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' :
                        analytics.health?.status === 'COMPLETED' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {analytics.health?.status}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark mt-0.5 font-medium">
                      {analytics.health?.reason}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 shrink-0 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-text-mutedLight dark:text-text-mutedDark block">Overdue</span>
                    <span className={`font-mono font-bold text-sm ${analytics.overdueIssues > 0 ? 'text-red-600 dark:text-red-400' : 'text-text-primaryLight dark:text-text-primaryDark'}`}>
                      {analytics.overdueIssues}
                    </span>
                  </div>
                  <div className="h-6 w-px bg-border-light dark:bg-border-dark" />
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-text-mutedLight dark:text-text-mutedDark block">Unassigned</span>
                    <span className="font-mono font-bold text-sm text-text-primaryLight dark:text-text-primaryDark">
                      {analytics.unassignedIssues}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Progress & Distribution Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Overall Completion & Status Breakdown */}
                <Card variant="feature" className="lg:col-span-2 space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-text-primaryLight dark:text-text-primaryDark">Overall Progress</span>
                      <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">{analytics.completionPercentage}%</span>
                    </div>
                    <ProgressBar progress={analytics.completionPercentage} showLabel={false} size="lg" />
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-text-mutedLight dark:text-text-mutedDark uppercase tracking-wider mb-3">
                      Status Distribution
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <Card variant="compact">
                        <span className="text-[10px] uppercase font-semibold text-text-mutedLight dark:text-text-mutedDark">TODO</span>
                        <p className="text-2xl font-bold font-mono text-text-primaryLight dark:text-text-primaryDark mt-1">{analytics.todoIssues}</p>
                      </Card>
                      <Card variant="compact" className="bg-blue-50/50 dark:bg-blue-950/30 border-blue-200/50 dark:border-blue-900/40">
                        <span className="text-[10px] uppercase font-semibold text-blue-600 dark:text-blue-400">In Progress</span>
                        <p className="text-2xl font-bold font-mono text-blue-700 dark:text-blue-300 mt-1">{analytics.inProgressIssues}</p>
                      </Card>
                      <Card variant="compact" className="bg-purple-50/50 dark:bg-purple-950/30 border-purple-200/50 dark:border-purple-900/40">
                        <span className="text-[10px] uppercase font-semibold text-purple-600 dark:text-purple-400">In Review</span>
                        <p className="text-2xl font-bold font-mono text-purple-700 dark:text-purple-300 mt-1">{analytics.inReviewIssues}</p>
                      </Card>
                      <Card variant="compact" className="bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-900/40">
                        <span className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400">Done</span>
                        <p className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-300 mt-1">{analytics.doneIssues}</p>
                      </Card>
                    </div>
                  </div>
                </Card>

                {/* Priority Breakdown */}
                <Card variant="standard" className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase text-text-mutedLight dark:text-text-mutedDark tracking-wider">Priority Distribution</h3>
                  <div className="space-y-3.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <span className="font-semibold text-text-primaryLight dark:text-text-primaryDark">Critical</span>
                      </div>
                      <span className="font-mono font-bold text-text-primaryLight dark:text-text-primaryDark">{analytics.criticalPriorityIssues}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span className="font-semibold text-text-primaryLight dark:text-text-primaryDark">High</span>
                      </div>
                      <span className="font-mono font-bold text-text-primaryLight dark:text-text-primaryDark">{analytics.highPriorityIssues}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <span className="font-semibold text-text-primaryLight dark:text-text-primaryDark">Medium</span>
                      </div>
                      <span className="font-mono font-bold text-text-primaryLight dark:text-text-primaryDark">{analytics.mediumPriorityIssues}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                        <span className="font-semibold text-text-primaryLight dark:text-text-primaryDark">Low</span>
                      </div>
                      <span className="font-mono font-bold text-text-primaryLight dark:text-text-primaryDark">{analytics.lowPriorityIssues}</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Sprint Progress & Workload Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sprint Progress Section */}
                <Card variant="standard" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase text-text-mutedLight dark:text-text-mutedDark tracking-wider flex items-center">
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-blue-600 dark:text-blue-400" />
                      Sprint Progress ({analytics.sprintAnalytics?.length || 0})
                    </h3>
                  </div>

                  {!analytics.sprintAnalytics || analytics.sprintAnalytics.length === 0 ? (
                    <p className="text-xs text-text-mutedLight dark:text-text-mutedDark italic py-3">No sprints created for this project yet.</p>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {analytics.sprintAnalytics.map((s) => (
                        <div key={s.sprintId} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-border-light dark:border-border-dark space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-text-primaryLight dark:text-text-primaryDark">{s.name}</span>
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                              s.status === 'ACTIVE' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' :
                              s.status === 'COMPLETED' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                              'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}>
                              {s.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-text-secondaryLight dark:text-text-secondaryDark">
                            <span>{s.completedIssues} / {s.totalIssues} tasks completed</span>
                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{s.completionPercentage}%</span>
                          </div>
                          <ProgressBar progress={s.completionPercentage} showLabel={false} size="sm" />
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Team Workload Section */}
                <Card variant="standard" className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase text-text-mutedLight dark:text-text-mutedDark tracking-wider flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1.5 text-blue-600 dark:text-blue-400" />
                    Team Workload ({analytics.memberWorkload?.length || 0})
                  </h3>

                  {!analytics.memberWorkload || analytics.memberWorkload.length === 0 ? (
                    <p className="text-xs text-text-mutedLight dark:text-text-mutedDark italic py-3">No members added to this project yet.</p>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {analytics.memberWorkload.map((m) => (
                        <div key={m.userId} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-border-light dark:border-border-dark space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px] flex items-center justify-center">
                                {m.name ? m.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                              </div>
                              <span className="font-bold text-text-primaryLight dark:text-text-primaryDark">{m.name}</span>
                            </div>
                            <span className="text-[10px] font-mono text-text-mutedLight dark:text-text-mutedDark uppercase">{m.role}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-text-secondaryLight dark:text-text-secondaryDark">
                            <span>{m.completedIssues} / {m.assignedIssues} assigned tasks completed</span>
                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{m.completionPercentage}%</span>
                          </div>
                          <ProgressBar progress={m.completionPercentage} showLabel={false} size="sm" />
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* Project Activity Stream Section */}
              <Card variant="standard" className="space-y-4">
                <h3 className="text-xs font-semibold uppercase text-text-mutedLight dark:text-text-mutedDark tracking-wider flex items-center">
                  <Activity className="w-3.5 h-3.5 mr-1.5 text-blue-600 dark:text-blue-400" />
                  Recent Activity Stream ({projectActivities.length})
                </h3>

                {projectActivities.length === 0 ? (
                  <p className="text-xs text-text-mutedLight dark:text-text-mutedDark italic py-3">No activity recorded for this project yet.</p>
                ) : (
                  <div className="max-h-72 overflow-y-auto space-y-3 pr-1 divide-y divide-border-light dark:divide-border-dark">
                    {projectActivities.map((act) => (
                      <div key={act.id} className="pt-3 first:pt-0 flex items-start space-x-3 text-xs">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {act.actor?.name ? act.actor.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-text-primaryLight dark:text-text-primaryDark leading-normal">
                            <span className="font-bold">{act.actor ? act.actor.name : 'System'}</span>{' '}
                            <span className="text-text-secondaryLight dark:text-text-secondaryDark">{act.description}</span>
                          </p>
                          <p className="text-[10px] text-text-mutedLight dark:text-text-mutedDark font-mono mt-0.5">
                            {new Date(act.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          ) : null}
        </div>
      )}

      {/* TAB 3: SPRINTS */}
      {activeTab === 'sprints' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase text-text-mutedLight dark:text-text-mutedDark tracking-wider">Sprints ({sprints.length})</h2>
            {isOwnerOrAdmin && (
              <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsSprintModalOpen(true)}>
                Create Sprint
              </Button>
            )}
          </div>

          {sprints.length === 0 ? (
            <EmptyState
              icon={RefreshCw}
              title="No Sprints Yet"
              description="Sprints help your team organize work into structured iterations."
              actionLabel={isOwnerOrAdmin ? "Create Sprint" : undefined}
              onAction={isOwnerOrAdmin ? () => setIsSprintModalOpen(true) : undefined}
              actionIcon={Plus}
            />
          ) : (
            <Card variant="standard" className="p-0 overflow-hidden divide-y divide-border-light dark:divide-border-dark">
              {sprints.map((sprint) => (
                <div key={sprint.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2.5">
                      <h3 className="font-semibold text-sm text-text-primaryLight dark:text-text-primaryDark">{sprint.name}</h3>
                      <StatusBadge status={sprint.status} />
                    </div>
                    <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark">{sprint.goal || 'No goal set for this sprint.'}</p>
                  </div>
                  <div className="flex items-center space-x-3 text-xs shrink-0">
                    <span className="font-mono text-text-mutedLight dark:text-text-mutedDark text-[11px]">
                      {sprint.startDate || 'N/A'} &rarr; {sprint.endDate || 'N/A'}
                    </span>
                    {isOwnerOrAdmin && sprint.status === 'PLANNED' && (
                      <Button variant="primary" size="sm" onClick={() => handleUpdateSprintStatus(sprint.id, 'ACTIVE')}>
                        Start Sprint
                      </Button>
                    )}
                    {isOwnerOrAdmin && sprint.status === 'ACTIVE' && (
                      <Button variant="secondary" size="sm" onClick={() => handleUpdateSprintStatus(sprint.id, 'COMPLETED')}>
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      {/* TAB 4: TEAM MEMBERS */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase text-text-mutedLight dark:text-text-mutedDark tracking-wider">
              Project Team ({members.length} {members.length === 1 ? 'member' : 'members'})
            </h2>
            {isOwnerOrAdmin && (
              <Button variant="primary" size="sm" icon={UserPlus} onClick={handleOpenAddMemberModal}>
                Add Member
              </Button>
            )}
          </div>

          {members.length === 1 && project.owner?.id === currentUser?.id ? (
            <EmptyState
              icon={Users}
              title="You are the only member of this project"
              description="Add registered DevFlow users to collaborate on tasks, sprints, and code reviews."
              actionLabel="Add Member"
              onAction={handleOpenAddMemberModal}
              actionIcon={UserPlus}
            />
          ) : (
            <Card variant="standard" className="p-0 overflow-hidden divide-y divide-border-light dark:divide-border-dark">
              {members.map((m) => {
                const isProjectOwner = project.owner?.id === m.user?.id;
                return (
                  <div key={m.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#1B1F27]/60 transition-colors">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 dark:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center">
                        {m.user?.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-xs text-text-primaryLight dark:text-text-primaryDark">{m.user?.name}</h4>
                          {isProjectOwner && (
                            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded-md">
                              OWNER
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-text-mutedLight dark:text-text-mutedDark font-mono">{m.user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-[11px] font-semibold text-text-secondaryLight dark:text-text-secondaryDark bg-slate-100 dark:bg-[#1B1F27] px-2.5 py-1 rounded-lg border border-border-light dark:border-border-dark">
                        {m.role}
                      </span>
                      <button
                        onClick={() => handleViewProfile(m.user?.id)}
                        title="View profile"
                        className="text-text-mutedLight hover:text-blue-600 p-1.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors active-press flex items-center space-x-1 text-xs"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline font-medium text-xs">Profile</span>
                      </button>
                      {isOwnerOrAdmin && !isProjectOwner && (
                        <button
                          onClick={() => setMemberToRemove(m.user)}
                          title="Remove from project"
                          className="text-text-mutedLight hover:text-red-600 p-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors active-press"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </Card>
          )}
        </div>
      )}

      {/* TAB 5: SETTINGS */}
      {activeTab === 'settings' && (
        <Card variant="standard" className="space-y-6 max-w-xl">
          <h2 className="text-base font-bold text-text-primaryLight dark:text-text-primaryDark">Project Settings</h2>
          {isOwnerOrAdmin ? (
            <div className="pt-4 border-t border-border-light dark:border-border-dark space-y-3">
              <h3 className="font-semibold text-red-600 dark:text-red-400 text-xs">Danger Zone</h3>
              <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark leading-relaxed">
                Deleting this project will permanently remove all associated issues, sprints, and comments.
              </p>
              <Button
                variant="danger"
                size="md"
                icon={Trash2}
                onClick={handleDeleteProject}
              >
                Delete Project Permanently
              </Button>
            </div>
          ) : (
            <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark">Only the project owner or admins can modify settings.</p>
          )}
        </Card>
      )}

      {/* Add Team Member Modal */}
      <Modal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} title="Add Team Member">
        <form onSubmit={handleAddMember} className="space-y-4 text-xs">
          <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark">Add a registered DevFlow user to this project workspace.</p>

          <Input
            label="Search Registered Users"
            icon={Search}
            value={userSearchQuery}
            onChange={(e) => handleSearchAvailableUsers(e.target.value)}
            placeholder="Search by name or email..."
          />

          {availableUsers.length === 0 ? (
            <div className="p-6 text-center text-xs text-text-mutedLight dark:text-text-mutedDark bg-slate-50 dark:bg-[#1B1F27] rounded-xl border border-border-light dark:border-border-dark font-medium">
              No available registered users found matching your search.
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto border border-border-light dark:border-border-dark rounded-xl divide-y divide-border-light dark:divide-border-dark">
              {availableUsers.map((u) => {
                const isSelected = selectedUserToAdd?.id === u.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUserToAdd(u)}
                    className={`p-3 cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/60 font-semibold text-blue-700 dark:text-blue-300'
                        : 'hover:bg-slate-50 dark:hover:bg-[#1B1F27]'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-text-primaryLight dark:text-text-primaryDark">{u.name}</p>
                      <p className="text-[10px] text-text-mutedLight dark:text-text-mutedDark font-mono">{u.email}</p>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-md flex items-center">
                        <Check className="w-3 h-3 mr-1" /> Selected
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <Select
            label="Project Member Role"
            value={memberRole}
            onChange={(e) => setMemberRole(e.target.value)}
          >
            <option value="MEMBER">Member (Can view, create & update tasks)</option>
            <option value="ADMIN">Admin (Full project management access)</option>
          </Select>

          <div className="flex justify-end space-x-2 pt-3 border-t border-border-light dark:border-border-dark">
            <Button variant="secondary" size="md" onClick={() => setIsMemberModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={!selectedUserToAdd || addingMember}>
              {addingMember ? 'Adding...' : 'Add Member'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Remove Member Confirmation Modal */}
      <Modal
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        title="Remove Team Member"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-800/60 text-red-700 dark:text-red-300 space-y-1.5">
            <p className="font-semibold flex items-center">
              <AlertCircle className="w-4 h-4 mr-1.5 shrink-0" />
              Remove {memberToRemove?.name}?
            </p>
            <p className="text-[11px] leading-relaxed">
              This will remove this user from the project. Their DevFlow account and other project memberships will remain unchanged.
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-border-light dark:border-border-dark">
            <Button variant="secondary" size="md" onClick={() => setMemberToRemove(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="md" disabled={removingMember} onClick={handleConfirmRemoveMember}>
              {removingMember ? 'Removing...' : 'Remove member'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Member Profile Modal */}
      <Modal
        isOpen={!!selectedProfileUser}
        onClose={() => setSelectedProfileUser(null)}
        title="Member Profile"
      >
        {selectedProfileUser && (
          <div className="space-y-5 text-xs">
            {/* User Details Header */}
            <div className="flex items-center space-x-3.5 pb-4 border-b border-border-light dark:border-border-dark">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 dark:bg-blue-500 text-white font-bold text-base flex items-center justify-center shadow-soft-sm">
                {selectedProfileUser.name?.charAt(0)}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-sm text-text-primaryLight dark:text-text-primaryDark">
                    {selectedProfileUser.name}
                  </h3>
                  <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200/50 dark:border-blue-900/40">
                    {selectedProfileUser.projectRole}
                  </span>
                </div>
                <p className="text-xs text-text-mutedLight dark:text-text-mutedDark font-mono mt-0.5">
                  {selectedProfileUser.email}
                </p>
              </div>
            </div>

            {/* Dates / Account Info */}
            <div className="grid grid-cols-2 gap-3">
              <Card variant="compact" className="bg-slate-50/70 dark:bg-[#1B1F27]/70 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-text-mutedLight dark:text-text-mutedDark tracking-wider">
                  Joined DevFlow
                </span>
                <p className="font-mono text-xs font-semibold text-text-primaryLight dark:text-text-primaryDark">
                  {selectedProfileUser.accountCreatedAt
                    ? new Date(selectedProfileUser.accountCreatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                    : 'N/A'}
                </p>
              </Card>

              <Card variant="compact" className="bg-slate-50/70 dark:bg-[#1B1F27]/70 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-text-mutedLight dark:text-text-mutedDark tracking-wider">
                  Joined Project
                </span>
                <p className="font-mono text-xs font-semibold text-text-primaryLight dark:text-text-primaryDark">
                  {selectedProfileUser.joinedProjectAt
                    ? new Date(selectedProfileUser.joinedProjectAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                    : 'N/A'}
                </p>
              </Card>
            </div>

            {/* Work Counts */}
            <div className="space-y-2">
              <h4 className="text-[10px] uppercase font-semibold text-text-mutedLight dark:text-text-mutedDark tracking-wider">
                Work Activity
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <Card variant="compact" className="bg-blue-50/40 dark:bg-blue-950/20 border-blue-200/40 dark:border-blue-900/30">
                  <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Assigned Issues</span>
                  <p className="text-xl font-bold font-mono text-blue-700 dark:text-blue-300 mt-1">
                    {selectedProfileUser.assignedIssueCount}
                  </p>
                </Card>

                <Card variant="compact" className="bg-purple-50/40 dark:bg-purple-950/20 border-purple-200/40 dark:border-purple-900/30">
                  <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">Created Issues</span>
                  <p className="text-xl font-bold font-mono text-purple-700 dark:text-purple-300 mt-1">
                    {selectedProfileUser.createdIssueCount}
                  </p>
                </Card>
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex justify-end pt-3 border-t border-border-light dark:border-border-dark">
              <Button variant="secondary" size="md" onClick={() => setSelectedProfileUser(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Issue Creation Modal */}
      <Modal isOpen={isIssueModalOpen} onClose={() => setIsIssueModalOpen(false)} title="Create Issue">
        <form onSubmit={handleCreateIssue} className="space-y-4 text-xs">
          <Input
            label="Title"
            required
            value={issueTitle}
            onChange={(e) => setIssueTitle(e.target.value)}
            placeholder="e.g. Implement OAuth2 login redirect"
          />

          <Textarea
            label="Description"
            rows={3}
            value={issueDesc}
            onChange={(e) => setIssueDesc(e.target.value)}
            placeholder="Acceptance criteria and notes..."
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Priority"
              value={issuePriority}
              onChange={(e) => setIssuePriority(e.target.value)}
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </Select>

            <Select
              label="Assignee"
              value={issueAssigneeId}
              onChange={(e) => setIssueAssigneeId(e.target.value)}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.user?.id} value={m.user?.id}>{m.user?.name}</option>
              ))}
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-border-light dark:border-border-dark">
            <Button variant="secondary" size="md" onClick={() => setIsIssueModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Create Issue
            </Button>
          </div>
        </form>
      </Modal>

      {/* Selected Issue Details Modal */}
      <Modal
        isOpen={!!selectedIssue}
        onClose={() => setSelectedIssue(null)}
        title={selectedIssue ? `#${selectedIssue.id} • ${selectedIssue.title}` : 'Issue Details'}
      >
        {selectedIssue && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="md:col-span-2 space-y-4">
              <div>
                <p className="font-semibold uppercase text-text-mutedLight dark:text-text-mutedDark mb-1.5 text-[10px]">Description</p>
                <p className="text-text-primaryLight dark:text-text-primaryDark leading-relaxed bg-slate-50 dark:bg-[#1B1F27] p-4 rounded-xl border border-border-light dark:border-border-dark">
                  {selectedIssue.description || 'No detailed description provided for this issue.'}
                </p>
              </div>

              {/* Tabs for Comments and Activity */}
              <div className="space-y-4 pt-2">
                <div className="flex border-b border-border-light dark:border-border-dark space-x-6 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setIssueDetailTab('comments')}
                    className={`pb-2 border-b-2 transition-colors ${
                      issueDetailTab === 'comments'
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    Comments ({comments.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setIssueDetailTab('activity')}
                    className={`pb-2 border-b-2 transition-colors ${
                      issueDetailTab === 'activity'
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    Activity History ({activities.length})
                  </button>
                </div>

                {issueDetailTab === 'comments' ? (
                  <CommentSection
                    comments={comments}
                    onAddComment={handleAddComment}
                    onUpdateComment={handleUpdateComment}
                    onDeleteComment={handleDeleteComment}
                  />
                ) : (
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center">
                      <Activity className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                      Activity Timeline ({activities.length})
                    </h4>
                    <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                      {activities.length === 0 ? (
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl text-center">
                          <p className="text-xs text-slate-400">No activity recorded for this issue yet.</p>
                        </div>
                      ) : (
                        activities.map((act) => (
                          <div key={act.id} className="flex items-start space-x-3 p-3 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-100 dark:border-slate-800/60 text-xs">
                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                              {act.user?.name ? act.user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-slate-800 dark:text-slate-200 leading-normal">
                                <span className="font-bold">{act.user ? act.user.name : 'System'}</span>{' '}
                                <span className="text-slate-600 dark:text-slate-300">{act.description}</span>
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono mt-1">
                                {new Date(act.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#1B1F27] border border-border-light dark:border-border-dark p-4 rounded-xl space-y-4 h-fit">
              <p className="font-semibold uppercase text-text-mutedLight dark:text-text-mutedDark text-[10px]">Metadata</p>
              
              <div className="space-y-3.5">
                <div>
                  <span className="text-text-secondaryLight dark:text-text-secondaryDark block text-[10px] mb-1 font-semibold">Status</span>
                  <select
                    value={selectedIssue.status}
                    onChange={(e) => handleStatusChange(selectedIssue.id, e.target.value)}
                    className="w-full text-xs font-semibold bg-white dark:bg-[#15181E] text-text-primaryLight dark:text-text-primaryDark border border-border-light dark:border-border-dark rounded-xl px-3 py-1.5 focus:outline-none"
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="IN_REVIEW">IN REVIEW</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>

                <div>
                  <span className="text-text-secondaryLight dark:text-text-secondaryDark block text-[10px] mb-1 font-semibold">Priority</span>
                  <PriorityBadge priority={selectedIssue.priority} />
                </div>

                <div>
                  <span className="text-text-secondaryLight dark:text-text-secondaryDark block text-[10px] mb-0.5 font-semibold">Assignee</span>
                  <p className="font-semibold text-text-primaryLight dark:text-text-primaryDark">
                    {selectedIssue.assignee ? selectedIssue.assignee.name : 'Unassigned'}
                  </p>
                </div>

                <div>
                  <span className="text-text-secondaryLight dark:text-text-secondaryDark block text-[10px] mb-0.5 font-semibold">Created By</span>
                  <p className="font-semibold text-text-primaryLight dark:text-text-primaryDark">
                    {selectedIssue.createdBy?.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Sprint Modal */}
      <Modal isOpen={isSprintModalOpen} onClose={() => setIsSprintModalOpen(false)} title="Create Sprint">
        <form onSubmit={handleCreateSprint} className="space-y-4 text-xs">
          <Input
            label="Sprint Name"
            required
            value={sprintName}
            onChange={(e) => setSprintName(e.target.value)}
            placeholder="e.g. Sprint 1 - Auth MVP"
          />

          <Textarea
            label="Sprint Goal"
            rows={2}
            value={sprintGoal}
            onChange={(e) => setSprintGoal(e.target.value)}
            placeholder="Goal of this sprint..."
          />

          <div className="flex justify-end space-x-2 pt-3 border-t border-border-light dark:border-border-dark">
            <Button variant="secondary" size="md" onClick={() => setIsSprintModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Create Sprint
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Project Modal */}
      {project && (
        <ProjectModal
          isOpen={isEditProjectOpen}
          onClose={() => setIsEditProjectOpen(false)}
          onSubmit={handleEditProjectSubmit}
          initialValues={project}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
