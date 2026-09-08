import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { Plus, Search, FolderPlus } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Input from '../components/Input';
import EmptyState from '../components/EmptyState';
import ProjectCard from '../components/ProjectCard';
import ProjectModal from '../components/ProjectModal';
import { CardSkeleton } from '../components/Skeleton';
import ErrorMessage from '../components/ErrorMessage';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      setError('Failed to load projects list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (projectData) => {
    try {
      await api.post('/projects', projectData);
      addToast('Project created successfully', 'success');
      fetchProjects();
    } catch (err) {
      addToast('Failed to create project', 'error');
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 page-fade-enter">
      {/* Page Header */}
      <PageHeader
        title="Projects"
        subtitle="Manage your engineering workspaces, teams, and deliverables."
        actions={
          <Button variant="primary" size="md" icon={Plus} onClick={() => setIsModalOpen(true)}>
            New Project
          </Button>
        }
      />

      {/* Search & Status Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:max-w-md">
          <Input
            type="text"
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name or description..."
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
          {['ALL', 'ACTIVE', 'PLANNING', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all active-press ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-soft-sm'
                  : 'bg-white dark:bg-[#15181E] text-text-secondaryLight dark:text-text-secondaryDark border border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-[#1B1F27]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchProjects} />}

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderPlus}
          title="No Projects Found"
          description={search ? "No projects match your search query." : "Create your first project to start organizing engineering work."}
          actionLabel={search ? undefined : "Create Project"}
          onAction={search ? undefined : () => setIsModalOpen(true)}
          actionIcon={Plus}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
};

export default Projects;
