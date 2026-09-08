import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import { 
  Contact, 
  KeyRound, 
  MonitorSmartphone, 
  Shield,
  Check, 
  LogOut,
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Input, { Select, Textarea } from '../components/Input';
import ProgressBar from '../components/ProgressBar';
import Modal from '../components/Modal';

const REASON_OPTIONS = [
  'No longer using DevFlow',
  'Found a better alternative',
  'Privacy concerns',
  'Too many emails or notifications',
  'Difficulty using the platform',
  'Account security concerns',
  'Personal reasons',
  'Other',
];

const Profile = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('profile');

  // Profile Edit Form State
  const [name, setName] = useState(user?.name || '');
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  const [savingProfile, setSavingProfile] = useState(false);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Account Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState('reason'); // 'reason' | 'confirm'
  const [selectedReason, setSelectedReason] = useState('');
  const [otherReasonText, setOtherReasonText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  if (!user) return null;

  const filledFields = [name, user.email, jobTitle, bio, timezone].filter((val) => val && val.trim().length > 0).length;
  const completionPercentage = Math.round((filledFields / 5) * 100);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put('/users/me', {
        name,
        jobTitle,
        bio,
        timezone,
      });
      addToast('Profile updated successfully!', 'success');
      const savedUser = JSON.parse(localStorage.getItem('devflow_user') || '{}');
      localStorage.setItem('devflow_user', JSON.stringify({ ...savedUser, name, jobTitle, bio, timezone }));
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    setSavingPassword(true);
    try {
      await api.put('/users/me/password', {
        currentPassword,
        newPassword,
      });
      addToast('Password changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password. Check your current password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleOpenDeleteModal = () => {
    setIsDeleteModalOpen(true);
    setDeleteStep('reason');
    setSelectedReason('');
    setOtherReasonText('');
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteStep('reason');
    setSelectedReason('');
    setOtherReasonText('');
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await api.delete('/users/me');
      addToast('Your account has been deleted.', 'info');
      logout();
    } catch (err) {
      console.error("Account deletion failed:", err);
      const msg = err.response?.data?.message || err.message || 'Unable to delete your account. Please try again.';
      addToast(msg, 'error');
      setDeletingAccount(false);
    }
  };

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'U';

  const navItems = [
    { id: 'profile', label: 'Personal Information', icon: Contact },
    { id: 'security', label: 'Security & Password', icon: KeyRound },
    { id: 'session', label: 'Session & Preferences', icon: MonitorSmartphone },
    { id: 'privacy', label: 'Account Privacy', icon: Shield },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 page-fade-enter pb-8">
      {/* Page Header */}
      <PageHeader
        title="Account Settings"
        subtitle="Manage your personal details, security credentials, preferences, and account privacy."
      />

      {/* User Summary Banner */}
      <Card variant="standard" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 dark:bg-blue-500 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-soft-sm">
            {initials}
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-semibold text-text-primaryLight dark:text-text-primaryDark">{user.name}</h2>
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark font-mono">{user.email}</p>
          </div>
        </div>

        {/* Profile Completion Card */}
        <div className="w-full sm:w-52">
          <ProgressBar progress={completionPercentage} showLabel={true} size="sm" />
        </div>
      </Card>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all text-left ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60'
                    : 'text-text-secondaryLight dark:text-text-secondaryDark hover:bg-slate-100/70 dark:hover:bg-[#1B1F27]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Content */}
        <div className="md:col-span-3">
          {/* TAB 1: Personal Information */}
          {activeTab === 'profile' && (
            <Card variant="standard" className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-text-primaryLight dark:text-text-primaryDark">Personal Information</h3>
                <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark">Update your personal profile details.</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name *"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />

                  <Input
                    label="Email Address (Auth ID)"
                    disabled
                    value={user.email}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Job Title"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                  />

                  <Select
                    label="Timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  >
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="EST">EST (Eastern Standard Time)</option>
                    <option value="PST">PST (Pacific Standard Time)</option>
                    <option value="IST">IST (Indian Standard Time)</option>
                    <option value="GMT">GMT (Greenwich Mean Time)</option>
                  </Select>
                </div>

                <Textarea
                  label="Bio / Short Profile Description"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your team about your responsibilities or interests..."
                />

                <div className="pt-2 flex justify-end">
                  <Button type="submit" variant="primary" size="md" icon={Check} disabled={savingProfile}>
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* TAB 2: Security & Password */}
          {activeTab === 'security' && (
            <Card variant="standard" className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-text-primaryLight dark:text-text-primaryDark">Change Password</h3>
                <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark">Ensure your account is protected with a strong password.</p>
              </div>

              {passwordError && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-800/60 flex items-center space-x-2 text-red-700 dark:text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <Input
                  type="password"
                  label="Current Password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />

                <Input
                  type="password"
                  label="New Password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                />

                <Input
                  type="password"
                  label="Confirm New Password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                />

                <div className="pt-2">
                  <Button type="submit" variant="primary" size="md" icon={KeyRound} disabled={savingPassword}>
                    {savingPassword ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* TAB 3: Session & Preferences */}
          {activeTab === 'session' && (
            <Card variant="standard" className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-text-primaryLight dark:text-text-primaryDark">Active Session & Theme</h3>
                <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark">Inspect active session details and application theme settings.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#1B1F27] rounded-xl border border-border-light dark:border-border-dark">
                  <div className="flex items-center space-x-3">
                    {theme === 'light' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-blue-400" />}
                    <div>
                      <p className="text-xs font-semibold text-text-primaryLight dark:text-text-primaryDark">Interface Theme</p>
                      <p className="text-[11px] text-text-secondaryLight dark:text-text-secondaryDark">Currently using {theme} mode</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={toggleTheme}>
                    Switch Mode
                  </Button>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-[#1B1F27] rounded-xl border border-border-light dark:border-border-dark space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondaryLight dark:text-text-secondaryDark">Authentication Protocol</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">JWT Bearer Stateless Token</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondaryLight dark:text-text-secondaryDark">Account Created</span>
                    <span className="font-mono text-text-mutedLight dark:text-text-mutedDark">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button variant="danger" size="md" icon={LogOut} onClick={logout}>
                    Sign Out of Workspace
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 4: Account Privacy */}
          {activeTab === 'privacy' && (
            <Card variant="standard" className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-text-primaryLight dark:text-text-primaryDark">Delete Account</h3>
                <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark mt-0.5">
                  Permanently remove your DevFlow account and personal data.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-[#1B1F27] border border-border-light dark:border-border-dark rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-text-primaryLight dark:text-text-primaryDark">Delete account</h4>
                  <p className="text-[11px] text-text-secondaryLight dark:text-text-secondaryDark">
                    Permanently remove your DevFlow account and personal data.
                  </p>
                </div>
                <Button variant="darkDestructive" size="md" onClick={handleOpenDeleteModal}>
                  Delete account
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Account Deletion Modal (2 Steps) */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={deletingAccount ? undefined : handleCloseDeleteModal}
        title={deleteStep === 'reason' ? 'Delete Account' : 'Are you sure?'}
      >
        {deleteStep === 'reason' ? (
          <div className="space-y-4 text-xs">
            <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark">
              If you need to delete your account, tell us why.
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {REASON_OPTIONS.map((reason) => {
                const isSelected = selectedReason === reason;
                return (
                  <div
                    key={reason}
                    onClick={() => setSelectedReason(reason)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center space-x-3 transition-all ${
                      isSelected
                        ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-medium'
                        : 'bg-white dark:bg-[#15181E] border-border-light dark:border-border-dark text-text-primaryLight dark:text-text-primaryDark hover:bg-slate-50 dark:hover:bg-[#1B1F27]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'border-blue-600 dark:border-blue-400 bg-blue-600 dark:bg-blue-500 text-white'
                          : 'border-slate-300 dark:border-border-dark'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-xs">{reason}</span>
                  </div>
                );
              })}
            </div>

            {selectedReason === 'Other' && (
              <div className="space-y-1.5 pt-1">
                <Textarea
                  label="Tell us more (optional)"
                  rows={2}
                  maxLength={500}
                  value={otherReasonText}
                  onChange={(e) => setOtherReasonText(e.target.value)}
                  placeholder="Share any details..."
                />
                <div className="text-right text-[10px] text-text-mutedLight dark:text-text-mutedDark font-mono">
                  {otherReasonText.length} / 500
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-3 border-t border-border-light dark:border-border-dark">
              <Button variant="secondary" size="md" onClick={handleCloseDeleteModal}>
                Cancel
              </Button>
              <Button
                variant="darkDestructive"
                size="md"
                disabled={!selectedReason}
                onClick={() => setDeleteStep('confirm')}
              >
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark leading-relaxed">
              You want to permanently delete your DevFlow account.<br />
              This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-2 pt-3 border-t border-border-light dark:border-border-dark">
              <Button variant="secondary" size="md" disabled={deletingAccount} onClick={handleCloseDeleteModal}>
                Keep account
              </Button>

              <Button
                variant="darkDestructive"
                size="md"
                disabled={deletingAccount}
                onClick={handleDeleteAccount}
              >
                {deletingAccount ? 'Deleting...' : 'Delete account'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Profile;
