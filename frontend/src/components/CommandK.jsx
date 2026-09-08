import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Search, FolderKanban, ClipboardCheck, X } from 'lucide-react';

const CommandK = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [projects, setProjects] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim() || !isOpen) {
      setProjects([]);
      setIssues([]);
      return;
    }

    const searchData = async () => {
      try {
        setLoading(true);
        const [projRes, issuesRes] = await Promise.all([
          api.get('/projects'),
          api.get('/issues/my-assigned'),
        ]);
        const q = query.toLowerCase();
        setProjects(projRes.data.filter((p) => p.name.toLowerCase().includes(q)));
        setIssues(issuesRes.data.filter((i) => i.title.toLowerCase().includes(q)));
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(searchData, 200);
    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/30 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#181B22] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full overflow-hidden shadow-soft-lg">
        <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search workspace..."
            className="w-full text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-xl transition-colors active-press">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-3">
          {loading ? (
            <div className="p-6 text-center text-xs text-slate-400 font-medium">Searching DevFlow workspace...</div>
          ) : query && projects.length === 0 && issues.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 font-medium">No results found for "{query}"</div>
          ) : (
            <div className="space-y-3">
              {projects.length > 0 && (
                <div>
                  <p className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Projects
                  </p>
                  {projects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        navigate(`/projects/${p.id}`);
                        onClose();
                      }}
                      className="flex items-center justify-between px-3 py-2 text-xs text-slate-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 rounded-xl cursor-pointer transition-colors active-press"
                    >
                      <div className="flex items-center space-x-2.5">
                        <FolderKanban className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-semibold">{p.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">PRJ-{p.id}</span>
                    </div>
                  ))}
                </div>
              )}

              {issues.length > 0 && (
                <div>
                  <p className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Assigned Issues
                  </p>
                  {issues.map((i) => (
                    <div
                      key={i.id}
                      onClick={() => {
                        navigate(`/projects/${i.projectId}`);
                        onClose();
                      }}
                      className="flex items-center justify-between px-3 py-2 text-xs text-slate-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 rounded-xl cursor-pointer transition-colors active-press"
                    >
                      <div className="flex items-center space-x-2.5">
                        <ClipboardCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-semibold">{i.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">#{i.id}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#111318] border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">ESC</kbd> to close
          </span>
          <span className="font-mono">DevFlow Command Palette</span>
        </div>
      </div>
    </div>
  );
};

export default CommandK;
