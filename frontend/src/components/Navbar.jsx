import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Sun, Moon, Search, Menu, LayoutDashboard, FolderKanban, ClipboardCheck, RefreshCw, User } from 'lucide-react';
import DevFlowLogo from './DevFlowLogo';
import NotificationDropdown from './NotificationDropdown';

const Navbar = ({ onToggleSidebar, onOpenSearch }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Issues', path: '/my-tasks', icon: ClipboardCheck },
    { name: 'Sprints', path: '/sprints', icon: RefreshCw },
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="bg-white dark:bg-[#15181E] border-b border-border-light dark:border-border-dark sticky top-0 z-30 transition-colors shadow-soft-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-15">
          {/* Logo & Navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <button
                onClick={onToggleSidebar}
                className="md:hidden text-text-secondaryLight dark:text-text-secondaryDark hover:text-text-primaryLight dark:hover:text-text-primaryDark p-2 rounded-xl active-press focus:outline-none"
                aria-label="Toggle Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <NavLink to="/" className="flex items-center">
                <DevFlowLogo size="md" />
              </NavLink>
            </div>

            {/* Desktop Navigation Strip */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      `flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all active-press ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                          : 'text-text-secondaryLight dark:text-text-secondaryDark hover:bg-slate-100/70 dark:hover:bg-[#1B1F27] hover:text-text-primaryLight dark:hover:text-text-primaryDark'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Controls: Search, Notifications, Theme Toggle, Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Command Palette Trigger */}
            <button
              onClick={onOpenSearch}
              className="flex items-center space-x-2 px-3 py-1.5 text-xs bg-slate-100/80 dark:bg-[#1B1F27] text-text-secondaryLight dark:text-text-secondaryDark rounded-xl hover:bg-slate-200/70 dark:hover:bg-[#222732] transition-colors active-press group"
            >
              <Search className="w-4 h-4 text-text-mutedLight dark:text-text-mutedDark group-hover:text-blue-600 transition-colors" />
              <span className="hidden sm:inline font-medium">Search...</span>
              <kbd className="hidden sm:inline font-mono text-[10px] bg-white dark:bg-[#15181E] px-1.5 py-0.5 rounded-md text-text-mutedLight dark:text-text-mutedDark border border-border-light dark:border-border-dark">
                ⌘K
              </kbd>
            </button>

            {/* Notifications Dropdown */}
            {user && <NotificationDropdown />}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              className="text-text-secondaryLight dark:text-text-secondaryDark hover:text-text-primaryLight dark:hover:text-text-primaryDark p-2 rounded-xl transition-colors active-press bg-slate-100/80 dark:bg-[#1B1F27]"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* User Profile Trigger */}
            {user && (
              <div className="flex items-center space-x-2 pl-2 border-l border-border-light dark:border-border-dark">
                <NavLink
                  to="/profile"
                  className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-[#1B1F27] transition-colors active-press group"
                  title="Profile & Settings"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 dark:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center">
                    {getInitials(user.name)}
                  </div>
                  <div className="hidden lg:block text-left text-xs">
                    <p className="font-semibold text-text-primaryLight dark:text-text-primaryDark leading-none">{user.name}</p>
                    <p className="text-[10px] text-text-mutedLight dark:text-text-mutedDark mt-0.5 font-medium capitalize">{user.role || 'Member'}</p>
                  </div>
                </NavLink>

                <button
                  onClick={logout}
                  title="Sign out"
                  className="text-text-mutedLight dark:text-text-mutedDark hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded-xl transition-colors active-press"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
