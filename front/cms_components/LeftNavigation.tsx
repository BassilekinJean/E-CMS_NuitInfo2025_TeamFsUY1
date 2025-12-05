// ComponentsCms/LeftNavigation.tsx
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Globe,
  Settings,
  LogOut,
  X,
  ChevronRight,
  Building2,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface LeftNavigationProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export const LeftNavigation = ({
  activeMenu,
  setActiveMenu,
  isSidebarOpen,
  setIsSidebarOpen,
}: LeftNavigationProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Tableau de bord", path: "/cms/mayor-dashboard" },
    { id: "site-web", icon: Globe, label: "Site Web", path: "/cms/mayor-dashboard/site-web" },
    { id: "publications", icon: FileText, label: "Publications", path: "/cms/mayor-dashboard/publications" },
    { id: "events", icon: Calendar, label: "Emploi du temps", path: "/cms/mayor-dashboard/evenements" },
    { id: "settings", icon: Settings, label: "Paramètres", path: "/cms/mayor-dashboard/parametres" },
  ];

  const handleDesktopSelect = (id: string, path: string) => {
    setActiveMenu(id);
    navigate(path);
    setIsExpanded(false); // auto-collapse when selecting
  };

  const handleMobileSelect = (id: string, path: string) => {
    setActiveMenu(id);
    navigate(path);
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* --- Desktop Sidebar Expandable --- */}
      <aside
        className={`hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col py-6 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 text-white shadow-2xl transition-all duration-500 ease-out
        ${isExpanded ? "w-64 px-4" : "w-20 items-center"}`}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
        
        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute top-6 right-[-14px] bg-white p-1.5 rounded-full border border-slate-200 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
        >
          <ChevronRight
            className={`h-4 w-4 text-slate-600 transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Logo */}
        <div className="flex items-center space-x-3 mb-10 relative z-10">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-2 ring-white/10">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          {isExpanded && (
            <div className="transition-all duration-300">
              <span className="text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Mairie
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Administration</p>
            </div>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 flex flex-col space-y-1.5 w-full relative z-10">
          {menuItems.map(({ id, icon: Icon, label, path }) => {
            const isActive =
              activeMenu === id || location.pathname.startsWith(path);

            return (
              <button
                key={id}
                onClick={() => handleDesktopSelect(id, path)}
                className={`group flex items-center w-full px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500/90 to-indigo-500/90 text-white shadow-lg shadow-blue-500/25 scale-[1.02]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className={`${isActive ? "bg-white/20" : "bg-slate-700/50 group-hover:bg-slate-700"} p-2 rounded-xl transition-all duration-300`}>
                  <Icon className="h-5 w-5" />
                </div>
                {isExpanded && (
                  <span className="ml-3 text-sm font-medium tracking-wide">{label}</span>
                )}
                {isActive && isExpanded && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User section & Logout */}
        <div className="relative z-10 space-y-3 w-full">
          {isExpanded && (
            <div className="px-4 py-3 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                  M
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">Maire</p>
                  <p className="text-xs text-slate-400 truncate">Administrateur</p>
                </div>
              </div>
            </div>
          )}
          
          <button
            className={`flex items-center w-full px-4 py-3 rounded-2xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-300 ${
              isExpanded ? "justify-start" : "justify-center"
            }`}
          >
            <LogOut className="h-5 w-5" />
            {isExpanded && <span className="ml-3 text-sm font-medium">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* --- Mobile Sidebar --- */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Background Overlay */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Sidebar panel */}
          <div className="relative w-80 bg-gradient-to-b from-white to-slate-50 h-full shadow-2xl animate-slideIn">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50/30">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Mairie</h2>
                  <p className="text-xs text-slate-500">Administration</p>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2.5 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-slate-50 transition-all duration-200"
                aria-label="Fermer"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            {/* Navigation items */}
            <nav className="flex-1 overflow-y-auto p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">Navigation</p>
              {menuItems.map(({ id, icon: Icon, label, path }) => {
                const isActive =
                  activeMenu === id || location.pathname.startsWith(path);

                return (
                  <button
                    key={id}
                    onClick={() => handleMobileSelect(id, path)}
                    className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-200 mb-1.5 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/20"
                        : "text-slate-600 hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${isActive ? "bg-white/20" : "bg-slate-100"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-medium">{label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* User & Logout */}
            <div className="p-4 border-t border-slate-100 bg-white/50">
              <div className="p-3 bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-2xl mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg">
                    M
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Maire</p>
                    <p className="text-xs text-slate-500">Administrateur</p>
                  </div>
                </div>
              </div>
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl text-rose-500 bg-rose-50 hover:bg-rose-100 transition-all duration-200 font-medium">
                <LogOut className="h-5 w-5" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
