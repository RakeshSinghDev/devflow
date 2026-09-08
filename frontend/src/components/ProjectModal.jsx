import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FolderKanban, X, AlertCircle, FileText, CircleDot } from 'lucide-react';
import Input, { Select, Textarea } from './Input';
import Button from './Button';
import StatusBadge from './StatusBadge';
import Card from './Card';

/**
 * DevFlow Viewport-Portal Right-Side Project Creation / Edit Workspace Drawer Panel
 * Rendered at document.body level via ReactDOM.createPortal to escape parent CSS transforms,
 * overflow constraints, or page max-width containers.
 * The <form> element wraps both form body and footer to guarantee native submit handler execution.
 */
const ProjectModal = ({ isOpen, onClose, onSubmit, initialValues }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('PLANNING');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const nameInputRef = useRef(null);

  // Initialize form state when drawer opens or initialValues change
  useEffect(() => {
    if (isOpen) {
      setName(initialValues?.name || '');
      setDescription(initialValues?.description || '');
      setStatus(initialValues?.status || (initialValues ? 'ACTIVE' : 'PLANNING'));
      setError('');
      setShowDiscardConfirm(false);
      
      // Lock body scroll while drawer is open
      document.body.style.overflow = 'hidden';

      // Auto-focus project name input after transition
      const timer = setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialValues]);

  // Track if user modified form fields
  const isDirty =
    (initialValues
      ? name !== (initialValues.name || '') ||
        description !== (initialValues.description || '') ||
        status !== (initialValues.status || 'ACTIVE')
      : name.trim().length > 0 || description.trim().length > 0 || status !== 'PLANNING');

  // Handle request to close drawer
  const handleRequestClose = () => {
    if (isDirty && !submitting) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  // Keyboard shortcut listener for Esc key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (showDiscardConfirm) {
          setShowDiscardConfirm(false);
        } else {
          handleRequestClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDirty, showDiscardConfirm, submitting]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Project name is required.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ name: trimmedName, description: description.trim(), status });
      setShowDiscardConfirm(false);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save project. Please check your inputs and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isEdit = !!initialValues;

  return createPortal(
    <>
      {/* Viewport Fixed Backdrop: rgba(15, 23, 42, 0.18) */}
      <div
        className="fixed inset-0 z-50 bg-[#0F172A]/20 dark:bg-black/40 backdrop-blur-[1px] transition-opacity duration-200"
        onClick={handleRequestClose}
      />

      {/* Viewport Fixed Slide-in Right Panel Surface */}
      <aside
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] lg:w-[520px] h-screen max-h-screen bg-white dark:bg-[#15181E] border-l border-border-light dark:border-border-dark shadow-soft-lg flex flex-col transform transition-transform duration-250 ease-out animate-in slide-in-from-right"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Panel Header (Fixed Shrink 0) */}
        <div className="p-6 border-b border-border-light dark:border-border-dark flex items-start justify-between shrink-0">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h2 id="drawer-title" className="text-xl font-semibold text-text-primaryLight dark:text-text-primaryDark tracking-tight">
                {isEdit ? 'Edit project' : 'Create project'}
              </h2>
              <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark mt-0.5 font-medium">
                Set up a workspace for your team and delivery work.
              </p>
            </div>
          </div>
          <button
            onClick={handleRequestClose}
            className="p-1.5 text-text-mutedLight dark:text-text-mutedDark hover:text-text-primaryLight dark:hover:text-text-primaryDark rounded-xl hover:bg-slate-100 dark:hover:bg-[#1B1F27] transition-colors active-press"
            aria-label="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form enclosing scrollable content body AND footer */}
        <form id="project-drawer-form" onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Scrollable Panel Form Content (Flex 1 Overflow Auto) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Error Banner */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-800/60 flex items-start space-x-2.5 text-red-700 dark:text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Section 1: Project Details */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-xs font-semibold text-text-mutedLight dark:text-text-mutedDark uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5" />
                <span>Project Details</span>
              </div>

              <Input
                ref={nameInputRef}
                label="Project name *"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Website Redesign"
              />

              <Textarea
                label="Description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the project's goals, scope, or deliverables..."
                className="resize-y"
              />
            </div>

            {/* Section 2: Status */}
            <div className="space-y-4 pt-2 border-t border-border-light dark:border-border-dark">
              <div className="flex items-center space-x-2 text-xs font-semibold text-text-mutedLight dark:text-text-mutedDark uppercase tracking-wider">
                <CircleDot className="w-3.5 h-3.5" />
                <span>Status</span>
              </div>

              <Select
                label="Project status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="PLANNING">Planning</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </Select>
            </div>

            {/* Section 3: Live Project Preview */}
            <div className="space-y-3 pt-2 border-t border-border-light dark:border-border-dark">
              <div className="flex items-center justify-between text-xs font-semibold text-text-mutedLight dark:text-text-mutedDark uppercase tracking-wider">
                <span>Preview</span>
                <span className="text-[10px] text-text-mutedLight dark:text-text-mutedDark font-normal">Live Card View</span>
              </div>

              <Card variant="standard" className="bg-slate-50/70 dark:bg-[#1B1F27]/60 border-dashed space-y-3">
                <div className="flex items-center justify-between">
                  <StatusBadge status={status} />
                  <span className="text-[10px] font-mono text-text-mutedLight dark:text-text-mutedDark">
                    PRJ-{initialValues?.id || 'NEW'}
                  </span>
                </div>

                <div className="flex items-start space-x-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
                    <FolderKanban className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-text-primaryLight dark:text-text-primaryDark truncate">
                      {name.trim() || 'New software project'}
                    </h4>
                    <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark line-clamp-2 mt-0.5 leading-relaxed">
                      {description.trim() || 'Ready to organize your team\'s engineering work.'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Sticky Non-Overlapping Action Footer (Flex Shrink 0) */}
          <div className="p-5 sm:p-6 bg-white dark:bg-[#15181E] border-t border-border-light dark:border-border-dark flex items-center justify-between shrink-0 sticky bottom-0 z-10">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={handleRequestClose}
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={submitting || !name.trim()}
            >
              {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Create project'}
            </Button>
          </div>
        </form>

        {/* Unsaved Changes Confirmation Banner / Overlay */}
        {showDiscardConfirm && (
          <div className="absolute inset-0 z-20 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in duration-150">
            <Card variant="standard" className="max-w-xs w-full space-y-4 text-center shadow-soft-lg">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-text-primaryLight dark:text-text-primaryDark">
                  Discard changes?
                </h3>
                <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark">
                  Your project details haven't been saved.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border-light dark:border-border-dark">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowDiscardConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setShowDiscardConfirm(false);
                    onClose();
                  }}
                >
                  Discard
                </Button>
              </div>
            </Card>
          </div>
        )}
      </aside>
    </>,
    document.body
  );
};

export default ProjectModal;
