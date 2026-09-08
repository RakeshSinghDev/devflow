import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { 
  Plus, 
  Search, 
  Calendar, 
  RefreshCw, 
  Pencil, 
  Trash2, 
  Eye, 
  Check, 
  AlertCircle, 
  Layers,
  BarChart3,
  ClipboardList
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Input, { Select, Textarea } from '../components/Input';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import Table, { TableHeader, TableHeadCell, TableRow, TableCell } from '../components/Table';
import { ListSkeleton } from '../components/Skeleton';
import ErrorMessage from '../components/ErrorMessage';

const Sprints = () => {
  const [projects, setProjects] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToast } = useToast();

  // Filters
  const [selectedProjectId, setSelectedProjectId] = useState('ALL');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Create / Edit Sprint Modal State
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState(null);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [projectId, setProjectId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('PLANNED');
  const [savingSprint, setSavingSprint] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Confirmation Modal State
  const [sprintToDelete, setSprintToDelete] = useState(null);
  const [deletingSprint, setDeletingSprint] = useState(false);

  // Sprint Detail View Modal State
  const [selectedSprintDetails, setSelectedSprintDetails] = useState(null);
  const [sprintIssues, setSprintIssues] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data || []);
    } catch (err) {
      console.error("Failed to load projects", err);
    }
  };

  const fetchSprints = async () => {
    try {
      setLoading(true);
      setError('');
      let res;
      if (selectedProjectId && selectedProjectId !== 'ALL') {
        res = await api.get(`/projects/${selectedProjectId}/sprints`);
      } else {
        res = await api.get('/sprints');
      }
      setSprints(res.data || []);
    } catch (err) {
      setError('Failed to load sprints list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchSprints();
  }, [selectedProjectId]);

  // Handle Form Modal Open
  const handleOpenCreateModal = () => {
    setEditingSprint(null);
    setName('');
    setGoal('');
    setProjectId(selectedProjectId !== 'ALL' ? selectedProjectId : (projects.length > 0 ? projects[0].id : ''));
    setStartDate('');
    setEndDate('');
    setStatus('PLANNED');
    setFormError('');
    setIsSprintModalOpen(true);
  };

  const handleOpenEditModal = (sprint) => {
    setEditingSprint(sprint);
    setName(sprint.name || '');
    setGoal(sprint.goal || '');
    setProjectId(sprint.projectId || '');
    setStartDate(sprint.startDate || '');
    setEndDate(sprint.endDate || '');
    setStatus(sprint.status || 'PLANNED');
    setFormError('');
    setIsSprintModalOpen(true);
  };

  const handleCloseSprintModal = () => {
    setIsSprintModalOpen(false);
    setEditingSprint(null);
    setFormError('');
  };

  // Handle Create / Edit Submit
  const handleSaveSprint = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Sprint name is required');
      return;
    }
    if (!projectId) {
      setFormError('Project selection is required');
      return;
    }
    if (!startDate) {
      setFormError('Start date is required');
      return;
    }
    if (!endDate) {
      setFormError('End date is required');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setFormError('End date cannot be before start date');
      return;
    }

    setSavingSprint(true);
    try {
      if (editingSprint) {
        // Update existing sprint
        const res = await api.put(`/sprints/${editingSprint.id}`, {
          name,
          goal,
          startDate,
          endDate,
          status,
        });
        addToast('Sprint updated successfully', 'success');
        setSprints(sprints.map((s) => (s.id === editingSprint.id ? res.data : s)));
        if (selectedSprintDetails && selectedSprintDetails.id === editingSprint.id) {
          setSelectedSprintDetails(res.data);
        }
      } else {
        // Create new sprint
        const res = await api.post(`/projects/${projectId}/sprints`, {
          name,
          goal,
          startDate,
          endDate,
          status,
        });
        addToast('Sprint created successfully', 'success');
        setSprints([res.data, ...sprints]);
      }
      handleCloseSprintModal();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to save sprint';
      setFormError(errorMsg);
      addToast(errorMsg, 'error');
    } finally {
      setSavingSprint(false);
    }
  };

  // Status Change Handler
  const handleStatusChange = async (sprintId, newStatus) => {
    const previousSprints = [...sprints];
    setSprints(sprints.map((s) => (s.id === sprintId ? { ...s, status: newStatus } : s)));

    try {
      const res = await api.put(`/sprints/${sprintId}`, { status: newStatus });
      addToast(`Sprint status updated to ${newStatus}`, 'success');
      setSprints(sprints.map((s) => (s.id === sprintId ? res.data : s)));
      if (selectedSprintDetails && selectedSprintDetails.id === sprintId) {
        setSelectedSprintDetails(res.data);
      }
    } catch (err) {
      setSprints(previousSprints);
      const errorMsg = err.response?.data?.message || 'Failed to update sprint status';
      addToast(errorMsg, 'error');
    }
  };

  // Delete Sprint Handler
  const handleDeleteSprint = async () => {
    if (!sprintToDelete) return;
    setDeletingSprint(true);
    try {
      await api.delete(`/sprints/${sprintToDelete.id}`);
      addToast(`Sprint "${sprintToDelete.name}" deleted`, 'info');
      setSprints(sprints.filter((s) => s.id !== sprintToDelete.id));
      if (selectedSprintDetails && selectedSprintDetails.id === sprintToDelete.id) {
        setSelectedSprintDetails(null);
      }
      setSprintToDelete(null);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete sprint', 'error');
    } finally {
      setDeletingSprint(false);
    }
  };

  // View Sprint Details & Issues
  const handleOpenSprintDetails = async (sprint) => {
    setSelectedSprintDetails(sprint);
    setLoadingIssues(true);
    try {
      const res = await api.get(`/sprints/${sprint.id}/issues`);
      setSprintIssues(res.data || []);
    } catch (err) {
      console.error("Failed to load sprint issues", err);
      addToast('Failed to load issues for this sprint', 'error');
    } finally {
      setLoadingIssues(false);
    }
  };

  const handleIssueStatusChangeInDetails = async (issueId, newStatus) => {
    const previousIssues = [...sprintIssues];
    setSprintIssues(sprintIssues.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i)));

    try {
      await api.patch(`/issues/${issueId}/status`, { status: newStatus });
      addToast('Issue status updated', 'success');
      // Refresh sprints to recalculate progress counts
      fetchSprints();
    } catch (err) {
      setSprintIssues(previousIssues);
      addToast('Failed to update issue status', 'error');
    }
  };

  const filteredSprints = sprints.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.goal && s.goal.toLowerCase().includes(search.toLowerCase())) ||
      (s.projectName && s.projectName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 page-fade-enter pb-8">
      {/* Page Header */}
      <PageHeader
        title="Sprints"
        subtitle="Plan iterations, view active sprint status, and track agile delivery cycles."
        actions={
          <Button variant="primary" size="md" icon={Plus} onClick={handleOpenCreateModal}>
            Create Sprint
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          type="text"
          icon={Search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search sprints by name, goal, or project..."
        />

        <Select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
        >
          <option value="ALL">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Sprint Statuses</option>
          <option value="PLANNED">Planned</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
        </Select>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchSprints} />}

      {/* Sprints Content */}
      {loading ? (
        <ListSkeleton rows={4} />
      ) : filteredSprints.length === 0 ? (
        <EmptyState
          icon={RefreshCw}
          title="No Sprints Yet"
          description="Sprints allow your team to bundle tasks into focused iteration cycles. Create your first sprint to organize project work."
          actionLabel="Create Sprint"
          onAction={handleOpenCreateModal}
          actionIcon={Plus}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredSprints.map((sprint) => {
            const hasIssues = sprint.totalIssues > 0;
            return (
              <Card
                key={sprint.id}
                variant="standard"
                className="space-y-4 transition-all hover:border-blue-300 dark:hover:border-blue-900/60"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-sm font-semibold text-text-primaryLight dark:text-text-primaryDark">
                        {sprint.name}
                      </h3>
                      <StatusBadge status={sprint.status} />
                      <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                        {sprint.projectName || `Project #${sprint.projectId}`}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark">
                      {sprint.goal || 'No explicit goal set for this sprint.'}
                    </p>
                  </div>

                  {/* Actions & Dates */}
                  <div className="flex items-center space-x-2 shrink-0 self-start sm:self-auto">
                    <div className="hidden md:flex items-center space-x-1.5 text-[11px] font-mono text-text-mutedLight dark:text-text-mutedDark mr-2">
                      <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span>
                        {sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : 'Unscheduled'} &rarr; {sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : 'Unscheduled'}
                      </span>
                    </div>

                    <select
                      value={sprint.status}
                      onChange={(e) => handleStatusChange(sprint.id, e.target.value)}
                      className="text-xs font-semibold bg-slate-50 dark:bg-[#1B1F27] border border-border-light dark:border-border-dark rounded-xl px-2.5 py-1.5 text-text-primaryLight dark:text-text-primaryDark focus:outline-none focus:border-blue-500"
                    >
                      <option value="PLANNED">PLANNED</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>

                    <Button variant="ghost" size="sm" icon={Eye} onClick={() => handleOpenSprintDetails(sprint)}>
                      Details
                    </Button>

                    <Button variant="ghost" size="sm" icon={Pencil} onClick={() => handleOpenEditModal(sprint)} title="Edit sprint" />

                    <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setSprintToDelete(sprint)} title="Delete sprint" className="text-slate-400 hover:text-red-600 dark:hover:text-red-400" />
                  </div>
                </div>

                {/* Date range for mobile */}
                <div className="md:hidden flex items-center space-x-1.5 text-[11px] font-mono text-text-mutedLight dark:text-text-mutedDark">
                  <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span>
                    {sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : 'Unscheduled'} &rarr; {sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : 'Unscheduled'}
                  </span>
                </div>

                {/* Real Progress Section */}
                <div className="pt-2 border-t border-border-light dark:border-border-dark space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-text-secondaryLight dark:text-text-secondaryDark flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      Sprint Progress
                    </span>
                    {hasIssues ? (
                      <span className="font-mono text-text-primaryLight dark:text-text-primaryDark font-semibold">
                        {sprint.completedIssues} / {sprint.totalIssues} completed ({sprint.progressPercentage}%)
                      </span>
                    ) : (
                      <span className="text-text-mutedLight dark:text-text-mutedDark italic">
                        No issues yet
                      </span>
                    )}
                  </div>

                  {hasIssues && (
                    <ProgressBar progress={sprint.progressPercentage || 0} showLabel={false} size="sm" />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Sprint Modal */}
      <Modal
        isOpen={isSprintModalOpen}
        onClose={handleCloseSprintModal}
        title={editingSprint ? 'Edit Sprint' : 'Create New Sprint'}
      >
        <form onSubmit={handleSaveSprint} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-800/60 flex items-center space-x-2 text-red-700 dark:text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Sprint Name *"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sprint 1 - Core Auth & Onboarding"
          />

          <Select
            label="Project *"
            required
            disabled={!!editingSprint}
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            <option value="">Select Target Project...</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>

          <Textarea
            label="Goal / Description"
            rows={3}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="What does your team aim to achieve in this sprint iteration?"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="date"
              label="Start Date *"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <Input
              type="date"
              label="End Date *"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <Select
            label="Sprint Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="PLANNED">PLANNED (Upcoming)</option>
            <option value="ACTIVE">ACTIVE (In Flight)</option>
            <option value="COMPLETED">COMPLETED (Finished)</option>
          </Select>

          <div className="flex justify-end space-x-2 pt-3 border-t border-border-light dark:border-border-dark">
            <Button variant="secondary" size="md" onClick={handleCloseSprintModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={savingSprint} icon={Check}>
              {savingSprint ? 'Saving...' : editingSprint ? 'Update Sprint' : 'Create Sprint'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Sprint Confirmation Modal */}
      <Modal
        isOpen={!!sprintToDelete}
        onClose={deletingSprint ? undefined : () => setSprintToDelete(null)}
        title="Delete Sprint?"
      >
        {sprintToDelete && (
          <div className="space-y-4 text-xs">
            <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark leading-relaxed">
              Are you sure you want to delete <strong className="text-text-primaryLight dark:text-text-primaryDark">{sprintToDelete.name}</strong>?<br />
              Issues assigned to this sprint will <strong className="text-text-primaryLight dark:text-text-primaryDark">NOT be deleted</strong>; their sprint assignment will be safely cleared.
            </p>

            <div className="flex justify-end space-x-2 pt-3 border-t border-border-light dark:border-border-dark">
              <Button variant="secondary" size="md" disabled={deletingSprint} onClick={() => setSprintToDelete(null)}>
                Keep sprint
              </Button>
              <Button variant="darkDestructive" size="md" disabled={deletingSprint} onClick={handleDeleteSprint}>
                {deletingSprint ? 'Deleting...' : 'Delete sprint'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Sprint Details View Modal */}
      <Modal
        isOpen={!!selectedSprintDetails}
        onClose={() => setSelectedSprintDetails(null)}
        title={selectedSprintDetails ? `Sprint Details: ${selectedSprintDetails.name}` : 'Sprint Details'}
      >
        {selectedSprintDetails && (
          <div className="space-y-6 text-xs max-h-[80vh] overflow-y-auto pr-1">
            {/* Metadata Summary */}
            <div className="p-4 bg-slate-50 dark:bg-[#1B1F27] border border-border-light dark:border-border-dark rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md text-xs">
                  {selectedSprintDetails.projectName || `Project #${selectedSprintDetails.projectId}`}
                </span>
                <StatusBadge status={selectedSprintDetails.status} />
              </div>
              <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark">
                {selectedSprintDetails.goal || 'No explicit goal provided.'}
              </p>
              <div className="flex items-center space-x-2 text-[11px] font-mono text-text-mutedLight dark:text-text-mutedDark pt-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {selectedSprintDetails.startDate || 'Unscheduled'} &rarr; {selectedSprintDetails.endDate || 'Unscheduled'}
                </span>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div className="p-3 bg-slate-50 dark:bg-[#15181E] border border-border-light dark:border-border-dark rounded-xl text-center">
                <div className="text-base font-bold text-text-primaryLight dark:text-text-primaryDark">{selectedSprintDetails.totalIssues}</div>
                <div className="text-[10px] text-text-secondaryLight dark:text-text-secondaryDark">Total Issues</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#15181E] border border-border-light dark:border-border-dark rounded-xl text-center">
                <div className="text-base font-bold text-amber-600 dark:text-amber-400">{selectedSprintDetails.todoIssues}</div>
                <div className="text-[10px] text-text-secondaryLight dark:text-text-secondaryDark">To Do</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#15181E] border border-border-light dark:border-border-dark rounded-xl text-center">
                <div className="text-base font-bold text-blue-600 dark:text-blue-400">{selectedSprintDetails.inProgressIssues}</div>
                <div className="text-[10px] text-text-secondaryLight dark:text-text-secondaryDark">In Progress</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#15181E] border border-border-light dark:border-border-dark rounded-xl text-center">
                <div className="text-base font-bold text-purple-600 dark:text-purple-400">{selectedSprintDetails.inReviewIssues}</div>
                <div className="text-[10px] text-text-secondaryLight dark:text-text-secondaryDark">In Review</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#15181E] border border-border-light dark:border-border-dark rounded-xl text-center col-span-2 sm:col-span-1">
                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">{selectedSprintDetails.doneIssues}</div>
                <div className="text-[10px] text-text-secondaryLight dark:text-text-secondaryDark">Done</div>
              </div>
            </div>

            {/* Sprint Issues List */}
            <div className="space-y-3">
              <h4 className="font-semibold text-xs text-text-primaryLight dark:text-text-primaryDark flex items-center justify-between">
                <span>Assigned Issues ({sprintIssues.length})</span>
              </h4>

              {loadingIssues ? (
                <ListSkeleton rows={3} />
              ) : sprintIssues.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-border-light dark:border-border-dark rounded-xl text-text-secondaryLight dark:text-text-secondaryDark text-xs">
                  No issues assigned to this sprint yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <tr>
                      <TableHeadCell className="w-16">ID</TableHeadCell>
                      <TableHeadCell>Title</TableHeadCell>
                      <TableHeadCell className="w-24">Priority</TableHeadCell>
                      <TableHeadCell className="w-28">Status</TableHeadCell>
                      <TableHeadCell className="w-28">Assignee</TableHeadCell>
                    </tr>
                  </TableHeader>
                  <TableCell>
                    {sprintIssues.map((issue) => (
                      <TableRow key={issue.id}>
                        <td className="px-3 py-2.5 font-mono text-[11px] text-text-mutedLight dark:text-text-mutedDark">
                          #{issue.id}
                        </td>
                        <td className="px-3 py-2.5 min-w-0">
                          <div className="font-semibold text-text-primaryLight dark:text-text-primaryDark truncate">
                            {issue.title}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <PriorityBadge priority={issue.priority} />
                        </td>
                        <td className="px-3 py-2.5">
                          <select
                            value={issue.status}
                            onChange={(e) => handleIssueStatusChangeInDetails(issue.id, e.target.value)}
                            className="text-[10px] font-semibold bg-slate-100 dark:bg-[#1B1F27] border border-border-light dark:border-border-dark rounded-lg px-2 py-1 text-text-primaryLight dark:text-text-primaryDark focus:outline-none focus:border-blue-500"
                          >
                            <option value="TODO">TODO</option>
                            <option value="IN_PROGRESS">IN PROGRESS</option>
                            <option value="IN_REVIEW">IN REVIEW</option>
                            <option value="DONE">DONE</option>
                          </select>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[11px] text-text-secondaryLight dark:text-text-secondaryDark truncate">
                          {issue.assignee ? issue.assignee.name : 'Unassigned'}
                        </td>
                      </TableRow>
                    ))}
                  </TableCell>
                </Table>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-border-light dark:border-border-dark">
              <Button variant="secondary" size="md" onClick={() => setSelectedSprintDetails(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Sprints;
