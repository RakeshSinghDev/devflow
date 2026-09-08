import React, { useState } from 'react';
import { MessageSquare, Send, Trash2, Edit2, Check, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CommentSection = ({ comments, onAddComment, onUpdateComment, onDeleteComment, isProjectAdmin = false }) => {
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const { user } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onAddComment(content);
    setContent('');
  };

  const handleStartEdit = (c) => {
    setEditingId(c.id);
    setEditContent(c.content);
  };

  const handleSaveEdit = (commentId) => {
    if (!editContent.trim()) return;
    if (onUpdateComment) {
      onUpdateComment(commentId, editContent);
    }
    setEditingId(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleConfirmDelete = (commentId) => {
    if (onDeleteComment) {
      onDeleteComment(commentId);
    }
    setDeletingId(null);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-4">
      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center">
        <MessageSquare className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
        Comments ({comments ? comments.length : 0})
      </h4>

      <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
        {!comments || comments.length === 0 ? (
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl text-center">
            <p className="text-xs text-slate-400">No comments yet. Start the conversation with your team!</p>
          </div>
        ) : (
          comments.map((c) => {
            const isOwner = user && c.user && user.id === c.user.id;
            const isEditing = editingId === c.id;
            const isDeleting = deletingId === c.id;
            const isEdited = c.updatedAt && c.createdAt && new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime() > 1000;

            return (
              <div key={c.id} className="bg-slate-50 dark:bg-slate-900/80 p-3.5 rounded-2xl space-y-2 border border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px] flex items-center justify-center">
                      {getInitials(c.user?.name)}
                    </div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{c.user ? c.user.name : 'Unknown User'}</span>
                    {isEdited && (
                      <span className="text-[10px] text-slate-400 font-medium italic">(edited)</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatTimestamp(c.createdAt)}
                    </span>

                    {(isOwner || isProjectAdmin) && !isEditing && !isDeleting && (
                      <div className="flex items-center space-x-1 pl-1">
                        {isOwner && (
                          <button
                            onClick={() => handleStartEdit(c)}
                            className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 transition-colors"
                            title="Edit comment"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeletingId(c.id)}
                          className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1 transition-colors"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline Delete Confirmation */}
                {isDeleting ? (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl space-y-2 text-xs">
                    <p className="text-red-600 dark:text-red-400 font-medium flex items-center">
                      <AlertCircle className="w-3.5 h-3.5 mr-1.5 inline" /> Are you sure you want to delete this comment?
                    </p>
                    <div className="flex space-x-2 pt-1">
                      <button
                        onClick={() => handleConfirmDelete(c.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-[11px] transition-colors"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium text-[11px] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : isEditing ? (
                  /* Inline Edit Form */
                  <div className="space-y-2 pl-8">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 text-xs border border-blue-400 dark:border-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="flex space-x-2 justify-end">
                      <button
                        onClick={() => handleSaveEdit(c.id)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-medium flex items-center transition-colors"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" /> Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-medium flex items-center transition-colors"
                      >
                        <X className="w-3.5 h-3.5 mr-1" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Comment Text */
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-8 whitespace-pre-wrap">
                    {c.content}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex space-x-2 pt-2">
        <input
          type="text"
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 px-4 py-2.5 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        <button
          type="submit"
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all flex items-center font-medium text-xs shadow-soft"
        >
          <Send className="w-3.5 h-3.5 mr-1.5" /> Post
        </button>
      </form>
    </div>
  );
};

export default CommentSection;
