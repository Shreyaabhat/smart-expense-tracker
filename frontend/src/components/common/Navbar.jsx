// ============================================
// Navbar Component
// ============================================

import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Plus, List, BarChart2,
  LogOut, User, TrendingUp, PiggyBank, ArrowLeftRight,
  CalendarDays, Bell, Trophy,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { path: "/dashboard",   icon: LayoutDashboard, label: "Dashboard"  },
  { path: "/add-expense", icon: Plus,            label: "Add"        },
  { path: "/expenses",    icon: List,            label: "History"    },
  { path: "/analytics",   icon: BarChart2,       label: "Analytics"  },
  { path: "/heatmap",     icon: CalendarDays,    label: "Heatmap"    },
  { path: "/bills",       icon: Bell,            label: "Bills"      },
 
  { path: "/piggybank",   icon: PiggyBank,       label: "Piggy Bank" },
  { path: "/converter",   icon: ArrowLeftRight,  label: "Converter"  },
  { path: "/profile",     icon: User,            label: "Profile"    },

];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-surface-800 border-r border-surface-600 p-6 z-40">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg text-gray-100">SpendSmart</span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-brand-500/10 text-brand-400 border border-brand-500/20"
                    : "text-gray-400 hover:text-gray-100 hover:bg-surface-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="mt-auto pt-4 border-t border-surface-600">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-brand-500/20 border border-brand-500/30 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-brand-400" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-100 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-800 border-t border-surface-600 z-40">
        <div className="flex">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
                  active ? "text-brand-400" : "text-gray-500"
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Navbar;