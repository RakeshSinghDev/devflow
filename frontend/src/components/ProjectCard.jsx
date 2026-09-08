import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ClipboardCheck, ArrowUpRight, FolderKanban } from 'lucide-react';
import StatusBadge from './StatusBadge';
import Card from './Card';
import ProgressBar from './ProgressBar';

const ProjectCard = ({ project }) => {
  const issueCount = project.issueCount || 0;
  const doneIssueCount = project.doneIssueCount || 0;
  const memberCount = project.memberCount || 1;
  
  const hasIssues = issueCount > 0;
  const progressPercent = hasIssues ? Math.round((doneIssueCount / issueCount) * 100) : (project.status === 'COMPLETED' ? 100 : 0);

  return (
    <Link to={`/projects/${project.id}`} className="block group">
      <Card variant="standard" hoverable className="h-full flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <StatusBadge status={project.status} />
            <span className="text-[11px] font-mono text-text-mutedLight dark:text-text-mutedDark">
              PRJ-{project.id}
            </span>
          </div>

          <div className="flex items-start justify-between gap-2 pt-0.5">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="p-2 rounded-xl shrink-0 bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <FolderKanban className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-text-primaryLight dark:text-text-primaryDark truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {project.name}
              </h3>
            </div>
            <ArrowUpRight className="w-4 h-4 text-text-mutedLight dark:text-text-mutedDark group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shrink-0" />
          </div>

          <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark line-clamp-2 leading-relaxed">
            {project.description || 'No description provided for this project.'}
          </p>

          {/* Real Progress Bar */}
          <div className="pt-1">
            <ProgressBar progress={hasIssues ? progressPercent : 0} size="sm" showLabel={true} />
          </div>
        </div>

        <div className="pt-3 border-t border-border-light dark:border-border-dark flex items-center justify-between text-xs text-text-secondaryLight dark:text-text-secondaryDark">
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="flex items-center">
              <Users className="w-3.5 h-3.5 mr-1 text-text-mutedLight dark:text-text-mutedDark" />
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </span>
            <span className="flex items-center">
              <ClipboardCheck className="w-3.5 h-3.5 mr-1 text-text-mutedLight dark:text-text-mutedDark" />
              {issueCount} {issueCount === 1 ? 'issue' : 'issues'}
            </span>
          </div>
          <span className="text-[10px] text-text-mutedLight dark:text-text-mutedDark font-mono">
            {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : ''}
          </span>
        </div>
      </Card>
    </Link>
  );
};

export default ProjectCard;
