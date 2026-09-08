import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Plus,
  ArrowUpRight,
  FolderKanban,
  ClipboardCheck,
  Users,
  CircleCheck,
  ListTodo,
  RefreshCw,
  Layers,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import EmptyState from '../components/EmptyState';
import ProjectModal from '../components/ProjectModal';
import { DashboardSkeleton } from '../components/Skeleton';
import ErrorMessage from '../components/ErrorMessage';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const { addToast } = useToast();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/dashboard');
      setStats(res.data);
    } catch (err) {
      setError('Failed to load workspace overview data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCreateProject = async (projectData) => {
    try {
      await api.post('/projects', projectData);
      addToast('Project created successfully', 'success');
      fetchDashboard();
    } catch (err) {
      addToast('Failed to create project', 'error');
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchDashboard} />;
  }

  const totalProjects = stats?.totalProjects || 0;
  const totalIssues = stats?.totalIssues || 0;
  const doneIssues = stats?.doneIssues || 0;
  const inProgressIssues = stats?.inProgressIssues || 0;
  const inReviewIssues = stats?.inReviewIssues || 0;
  const todoIssues = stats?.todoIssues || 0;
  const openIssues = stats?.openIssues || (todoIssues + inProgressIssues + inReviewIssues);
  const memberCount = stats?.totalMembers || 0;
  const criticalIssues = stats?.criticalPriorityIssues || 0;
  const highIssues = stats?.highPriorityIssues || 0;
  const mediumIssues = stats?.mediumPriorityIssues || 0;
  const lowIssues = stats?.lowPriorityIssues || 0;
  const progressPercent = totalIssues > 0 ? Math.round((doneIssues / totalIssues) * 100) : 0;

  const firstName = user?.name ? user.name.split(' ')[0] : 'User';

  return (
    <div className="space-y-6 page-fade-enter pb-8">
      {/* Page Header */}
      <PageHeader
        title={`Good afternoon, ${firstName}`}
        subtitle="A concise, real-time summary of engineering work across your projects."
        actions={
          <>
            <Link to="/projects">
              <Button variant="secondary" size="md">
                View Projects
              </Button>
            </Link>
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => setIsModalOpen(true)}
            >
              New Project
            </Button>
          </>
        }
      />

      {/* Row 1: Compact Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Projects */}
        <Card variant="compact" className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-mutedLight dark:text-text-mutedDark">
              Active Projects
            </span>
            <FolderKanban className="w-4 h-4 text-text-mutedLight dark:text-text-mutedDark" />
          </div>
          <div className="space-y-0.5">
            <span className="text-3xl font-semibold text-text-primaryLight dark:text-text-primaryDark tracking-tight">
              {totalProjects}
            </span>
            <p className="text-[11px] text-text-secondaryLight dark:text-text-secondaryDark">
              {totalProjects === 1 ? '1 active workspace project' : `${totalProjects} active workspace projects`}
            </p>
          </div>
        </Card>

        {/* Card 2: Open Issues */}
        <Card variant="compact" className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-mutedLight dark:text-text-mutedDark">
              Open Issues
            </span>
            <ClipboardCheck className="w-4 h-4 text-text-mutedLight dark:text-text-mutedDark" />
          </div>
          <div className="space-y-0.5">
            <span className="text-3xl font-semibold text-text-primaryLight dark:text-text-primaryDark tracking-tight">
              {openIssues}
            </span>
            <p className="text-[11px] text-text-secondaryLight dark:text-text-secondaryDark">
              {criticalIssues + highIssues > 0
                ? `${criticalIssues + highIssues} High / Critical priority`
                : 'Active workload pending'}
            </p>
          </div>
        </Card>

        {/* Card 3: Team Members */}
        <Card variant="compact" className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-mutedLight dark:text-text-mutedDark">
              Team Members
            </span>
            <Users className="w-4 h-4 text-text-mutedLight dark:text-text-mutedDark" />
          </div>
          <div className="space-y-0.5">
            <span className="text-3xl font-semibold text-text-primaryLight dark:text-text-primaryDark tracking-tight">
              {memberCount}
            </span>
            <p className="text-[11px] text-text-secondaryLight dark:text-text-secondaryDark">
              Across your projects
            </p>
          </div>
        </Card>

        {/* Card 4: Completion Rate */}
        <Card variant="compact" className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-mutedLight dark:text-text-mutedDark">
              Completion
            </span>
            <CircleCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="space-y-0.5">
            <span className="text-3xl font-semibold text-text-primaryLight dark:text-text-primaryDark tracking-tight">
              {totalIssues > 0 ? `${progressPercent}%` : '—'}
            </span>
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              {totalIssues > 0 ? `${doneIssues} of ${totalIssues} issues done` : 'No issues created yet'}
            </p>
          </div>
        </Card>
      </div>

      {/* Row 2: Asymmetric Primary Data Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Progress Feature Card (2 Columns) */}
        <Card variant="feature" className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-mutedLight dark:text-text-mutedDark">
                Project Progress
              </h2>
              <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark mt-0.5">
                Issue completion breakdown per active project
              </p>
            </div>
            {totalIssues > 0 && (
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-200/60 dark:border-blue-900/50">
                {progressPercent}% Workspace Complete
              </span>
            )}
          </div>

          {!stats?.recentProjects || stats.recentProjects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="No projects created yet"
              description="Create your first project to start organizing your engineering tasks."
              actionLabel="Create Project"
              onAction={() => setIsModalOpen(true)}
              actionIcon={Plus}
            />
          ) : (
            <div className="space-y-4 pt-1">
              {stats.recentProjects.map((prj) => {
                const totalPrjIssues = prj.issueCount || 0;
                const donePrjIssues = prj.doneIssueCount || 0;
                const prjProgress = totalPrjIssues > 0 ? Math.round((donePrjIssues / totalPrjIssues) * 100) : 0;

                return (
                  <div key={prj.id} className="space-y-2 p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#1B1F27]/60 transition-colors">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center space-x-2">
                        <Link to={`/projects/${prj.id}`} className="font-semibold text-text-primaryLight dark:text-text-primaryDark hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          {prj.name}
                        </Link>
                        <StatusBadge status={prj.status} />
                      </div>
                      <span className="text-xs text-text-secondaryLight dark:text-text-secondaryDark font-medium">
                        {totalPrjIssues > 0 ? `${prjProgress}% (${donePrjIssues}/${totalPrjIssues})` : 'No issues yet'}
                      </span>
                    </div>
                    <ProgressBar progress={prjProgress} showLabel={false} size="sm" />
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Issue Workload Feature Card (1 Column) */}
        <Card variant="feature" className="space-y-5">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-mutedLight dark:text-text-mutedDark">
              Issue Workload
            </h2>
            <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark mt-0.5">
              Status & priority distribution
            </p>
          </div>

          {totalIssues === 0 ? (
            <div className="text-center py-10 text-xs text-text-mutedLight dark:text-text-mutedDark">
              No issues created yet in workspace.
            </div>
          ) : (
            <div className="space-y-5">
              {/* Status Section */}
              <div className="space-y-3">
                <span className="text-[11px] font-semibold text-text-mutedLight dark:text-text-mutedDark uppercase tracking-wider">Status Breakdown</span>
                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between text-text-secondaryLight dark:text-text-secondaryDark font-medium mb-1">
                      <span>TO DO</span>
                      <span className="font-semibold">{todoIssues}</span>
                    </div>
                    <ProgressBar progress={totalIssues > 0 ? (todoIssues / totalIssues) * 100 : 0} showLabel={false} size="sm" color="purple" />
                  </div>

                  <div>
                    <div className="flex justify-between text-blue-600 dark:text-blue-400 font-medium mb-1">
                      <span>IN PROGRESS</span>
                      <span className="font-semibold">{inProgressIssues}</span>
                    </div>
                    <ProgressBar progress={totalIssues > 0 ? (inProgressIssues / totalIssues) * 100 : 0} showLabel={false} size="sm" color="blue" />
                  </div>

                  <div>
                    <div className="flex justify-between text-purple-600 dark:text-purple-400 font-medium mb-1">
                      <span>IN REVIEW</span>
                      <span className="font-semibold">{inReviewIssues}</span>
                    </div>
                    <ProgressBar progress={totalIssues > 0 ? (inReviewIssues / totalIssues) * 100 : 0} showLabel={false} size="sm" color="purple" />
                  </div>

                  <div>
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium mb-1">
                      <span>DONE</span>
                      <span className="font-semibold">{doneIssues}</span>
                    </div>
                    <ProgressBar progress={totalIssues > 0 ? (doneIssues / totalIssues) * 100 : 0} showLabel={false} size="sm" color="green" />
                  </div>
                </div>
              </div>

              {/* Priority Section */}
              <div className="pt-3 border-t border-border-light dark:border-border-dark space-y-3">
                <span className="text-[11px] font-semibold text-text-mutedLight dark:text-text-mutedDark uppercase tracking-wider">Priority Distribution</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-red-50/60 dark:bg-red-950/30 border border-red-200/50 dark:border-red-900/30">
                    <span className="font-medium text-red-700 dark:text-red-300">Critical</span>
                    <span className="font-semibold text-red-700 dark:text-red-300">{criticalIssues}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/30">
                    <span className="font-medium text-amber-700 dark:text-amber-300">High</span>
                    <span className="font-semibold text-amber-700 dark:text-amber-300">{highIssues}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/30">
                    <span className="font-medium text-blue-700 dark:text-blue-300">Medium</span>
                    <span className="font-semibold text-blue-700 dark:text-blue-300">{mediumIssues}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-[#1B1F27] border border-border-light dark:border-border-dark">
                    <span className="font-medium text-text-secondaryLight dark:text-text-secondaryDark">Low</span>
                    <span className="font-semibold text-text-primaryLight dark:text-text-primaryDark">{lowIssues}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Row 3: My Work & Current Sprint */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Work Card (2 Columns) */}
        <Card variant="standard" className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-mutedLight dark:text-text-mutedDark">
                My Work
              </h2>
              <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark mt-0.5">
                Active issues assigned to you
              </p>
            </div>
            <Link to="/my-tasks" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center">
              View All <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          {!stats?.myAssignedIssues || stats.myAssignedIssues.length === 0 ? (
            <EmptyState
              icon={ListTodo}
              title="You're all caught up"
              description="No active issues are currently assigned to you."
            />
          ) : (
            <div className="divide-y divide-border-light dark:divide-border-dark">
              {stats.myAssignedIssues.slice(0, 5).map((issue) => (
                <div key={issue.id} className="py-3 flex items-center justify-between px-2 hover:bg-slate-50 dark:hover:bg-[#1B1F27]/60 rounded-xl transition-colors">
                  <div className="space-y-1 min-w-0 pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[11px] font-medium text-text-mutedLight dark:text-text-mutedDark">DEV-{issue.id}</span>
                      <h4 className="text-xs font-semibold text-text-primaryLight dark:text-text-primaryDark truncate">
                        {issue.title}
                      </h4>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <PriorityBadge priority={issue.priority} />
                    <StatusBadge status={issue.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Current Sprint Status Card (1 Column) */}
        <Card variant="standard" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-mutedLight dark:text-text-mutedDark">
              Current Sprint
            </h2>
            <RefreshCw className="w-4 h-4 text-text-mutedLight dark:text-text-mutedDark" />
          </div>

          <EmptyState
            icon={Layers}
            title="No active sprint"
            description="Sprints help your team organize work into time-boxed iterations."
          />
        </Card>
      </div>

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
};

export default Dashboard;
