import React from 'react';
import PriorityBadge from './PriorityBadge';
import Card from './Card';

const IssueCard = ({ issue, onClick, onStatusChange }) => {
  const getAssigneeInitials = (assignee) => {
    if (!assignee || !assignee.name) return 'UA';
    return assignee.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <Card
      variant="compact"
      hoverable
      onClick={() => onClick && onClick(issue)}
      className="space-y-2.5 bg-white dark:bg-[#15181E]"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-xs text-text-primaryLight dark:text-text-primaryDark group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
          {issue.title}
        </h4>
        <span className="font-mono text-[10px] text-text-mutedLight dark:text-text-mutedDark shrink-0 bg-slate-100 dark:bg-[#1B1F27] px-1.5 py-0.5 rounded-md border border-border-light dark:border-border-dark">
          #{issue.id}
        </span>
      </div>

      {issue.description && (
        <p className="text-[11px] text-text-secondaryLight dark:text-text-secondaryDark line-clamp-2 leading-relaxed">
          {issue.description}
        </p>
      )}

      <div className="pt-2 flex items-center justify-between border-t border-border-light dark:border-border-dark text-[11px]">
        <div className="flex items-center space-x-2">
          <PriorityBadge priority={issue.priority} />
          
          {/* Assignee Avatar */}
          <div className="flex items-center space-x-1.5" title={issue.assignee ? issue.assignee.name : 'Unassigned'}>
            <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold text-[9px] flex items-center justify-center">
              {getAssigneeInitials(issue.assignee)}
            </div>
            <span className="text-text-secondaryLight dark:text-text-secondaryDark font-medium text-[10px] max-w-[80px] truncate">
              {issue.assignee ? issue.assignee.name.split(' ')[0] : 'Unassigned'}
            </span>
          </div>
        </div>

        {onStatusChange ? (
          <select
            onClick={(e) => e.stopPropagation()}
            value={issue.status}
            onChange={(e) => onStatusChange(issue.id, e.target.value)}
            className="text-[10px] font-semibold bg-slate-50 dark:bg-[#1B1F27] border border-border-light dark:border-border-dark rounded-lg px-2 py-0.5 text-text-primaryLight dark:text-text-primaryDark focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="IN_REVIEW">IN REVIEW</option>
            <option value="DONE">DONE</option>
          </select>
        ) : (
          <span className="text-[10px] font-mono text-text-mutedLight dark:text-text-mutedDark">{issue.status}</span>
        )}
      </div>
    </Card>
  );
};

export default IssueCard;
