// ComponentsCms/LeftNavigation.tsx
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Globe,
  Mail,
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
    { id: "messages", icon: Mail, label: "Messages", path: "/cms/mayor-dashboard/messages" },
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
        className={`hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col py-6 bg-gray-900 text-white shadow-xl transition-all duration-300
        ${isExpanded ? "w-64 px-4" : "w-20 items-center"}`}
      >
        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute top-4 right-[-12px] bg-gray-800 p-1 rounded-full border border-gray-700 hover:bg-gray-700 transition"
        >
          <ChevronRight
            className={`h-5 w-5 text-white transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Logo */}
        <div className="flex items-center space-x-3 mb-10">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          {isExpanded && (
            <span className="text-xl font-semibold transition-opacity duration-300">
              Mairie
            </span>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 flex flex-col space-y-2 w-full">
          {menuItems.map(({ id, icon: Icon, label, path }) => {
            const isActive =
              activeMenu === id || location.pathname.startsWith(path);

            return (
              <button
                key={id}
                onClick={() => handleDesktopSelect(id, path)}
                className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <Icon className="h-6 w-6" />
                {isExpanded && (
                  <span className="ml-3 text-sm font-medium">{label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          className={`mt-6 flex items-center px-4 py-3 rounded-xl text-gray-400 hover:bg-red-600 hover:text-white transition-all duration-200 ${
            isExpanded ? "justify-start" : "justify-center"
          }`}
        >
          <LogOut className="h-6 w-6" />
          {isExpanded && <span className="ml-3">Déconnexion</span>}
        </button>
      </aside>

      {/* --- Mobile Sidebar --- */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Background Overlay */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Sidebar panel */}
          <div className="relative w-72 bg-white h-full shadow-xl animate-slideIn">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Menu</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
                aria-label="Fermer"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* Navigation items */}
            <nav className="flex-1 overflow-y-auto p-4">
              {menuItems.map(({ id, icon: Icon, label, path }) => {
                const isActive =
                  activeMenu === id || location.pathname.startsWith(path);

                return (
                  <button
                    key={id}
                    onClick={() => handleMobileSelect(id, path)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-150 mb-1 ${
                      isActive
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t">
              <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-150">
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
