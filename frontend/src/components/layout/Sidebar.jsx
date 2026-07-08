import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import { logout as logoutApi } from '../../api/auth.api';

export default function Sidebar({ title, subtitle, links, open = false, onClose }) {
  const navigate = useNavigate();
  const { refreshToken, logout, user } = useAuthStore();

  const handleLogout = async () => {
    try { await logoutApi({ refreshToken }); } catch {}
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-gray-900/50 backdrop-blur-sm lg:hidden transition-opacity ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950/50 backdrop-blur-2xl border-r border-white/10 text-white flex flex-col transform transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="px-5 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-base font-extrabold shadow-lg shadow-indigo-600/40 ring-1 ring-white/10">
              L
            </div>
            <div>
              <p className="font-bold text-sm text-white tracking-tight">{title}</p>
              {subtitle && <p className="text-[11px] text-indigo-300/80 font-medium">{subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        {/* User info */}
        <div className="mx-3 mb-2 px-3 py-3 rounded-2xl bg-white/5 ring-1 ring-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold overflow-hidden flex-shrink-0 ring-2 ring-white/10">
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                : <span>{user?.fullName?.[0]}</span>}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-100 truncate">{user?.fullName}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Menu</p>
          {links.map(({ to, icon: Icon, label, end: endProp }) => (
            <NavLink
              key={to}
              to={to}
              end={endProp !== false}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-300'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-300 w-full transition-all"
          >
            <LogOut size={17} />
            Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
}
