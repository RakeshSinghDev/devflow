import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { CheckSquare, Search, ClipboardList } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Input, { Select } from '../components/Input';
import Table, { TableHeader, TableHeadCell, TableRow, TableCell } from '../components/Table';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import EmptyState from '../components/EmptyState';
import { ListSkeleton } from '../components/Skeleton';
import ErrorMessage from '../components/ErrorMessage';

const MyTasks = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const { addToast } = useToast();

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/issues/my-assigned');
      setIssues(res.data);
    } catch (err) {
      setError('Failed to load assigned issues.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const handleStatusChange = async (issueId, newStatus) => {
    try {
      await api.patch(`/issues/${issueId}/status`, { status: newStatus });
      setIssues(issues.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i)));
      addToast('Status updated successfully', 'success');
    } catch (err) {
      addToast('Failed to update issue status', 'error');
    }
  };

  const filteredIssues = issues.filter((i) => {
    const matchesSearch =
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      (i.description && i.description.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'TODO' && (i.status === 'TODO' || i.status === 'BACKLOG')) ||
      (statusFilter === 'IN_PROGRESS' && (i.status === 'IN_PROGRESS' || i.status === 'IN_REVIEW')) ||
      (statusFilter === 'DONE' && i.status === 'DONE');

    const matchesPriority = priorityFilter === 'ALL' || i.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6 page-fade-enter pb-8">
      {/* Page Header */}
      <PageHeader
        title="Issues"
        subtitle="Track, filter, and manage engineering tasks assigned to you across all projects."
      />

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          type="text"
          icon={Search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search issues by title or description..."
        />

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </Select>

        <Select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="ALL">All Priorities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </Select>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchMyTasks} />}

      {loading ? (
        <ListSkeleton rows={5} />
      ) : filteredIssues.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No Issues Found"
          description="You currently have no assigned issues matching your search or filters."
        />
      ) : (
        <Table>
          <TableHeader>
            <tr>
              <TableHeadCell className="w-16">ID</TableHeadCell>
              <TableHeadCell>Title & Description</TableHeadCell>
              <TableHeadCell className="w-28">Priority</TableHeadCell>
              <TableHeadCell className="w-36">Status</TableHeadCell>
              <TableHeadCell className="w-40 text-right">Actions</TableHeadCell>
            </tr>
          </TableHeader>
          <TableCell>
            {filteredIssues.map((issue) => (
              <TableRow key={issue.id}>
                <td className="px-4 py-3.5 font-mono text-xs text-text-mutedLight dark:text-text-mutedDark">
                  DEV-{issue.id}
                </td>
                <td className="px-4 py-3.5 min-w-0">
                  <h4 className="text-xs font-semibold text-text-primaryLight dark:text-text-primaryDark truncate">
                    {issue.title}
                  </h4>
                  <p className="text-[11px] text-text-secondaryLight dark:text-text-secondaryDark line-clamp-1 mt-0.5">
                    {issue.description || 'No detailed description provided.'}
                  </p>
                </td>
                <td className="px-4 py-3.5">
                  <PriorityBadge priority={issue.priority} />
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={issue.status} />
                </td>
                <td className="px-4 py-3.5 text-right">
                  <select
                    value={issue.status}
                    onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                    className="text-xs font-semibold bg-slate-100 dark:bg-[#1B1F27] border border-border-light dark:border-border-dark rounded-xl px-2.5 py-1.5 text-text-primaryLight dark:text-text-primaryDark focus:outline-none focus:border-blue-500"
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="IN_REVIEW">IN REVIEW</option>
                    <option value="DONE">DONE</option>
                  </select>
                </td>
              </TableRow>
            ))}
          </TableCell>
        </Table>
      )}
    </div>
  );
};

export default MyTasks;
