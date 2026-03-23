import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Truck,
  FileText,
  DollarSign,
  Globe,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Ship,
  Plane,
  ShoppingCart,
} from "lucide-react";
import foraxisLogo from "@/assets/foraxis-logo.png";

const navItems = [
  { icon: LayoutDashboard, label: "Control Tower", path: "/" },
  { icon: Package, label: "Orders", path: "/orders" },
  { icon: ShoppingCart, label: "Procurement", path: "/procurement" },
  { icon: Truck, label: "Shipments", path: "/shipments" },
  { icon: Package, label: "Tracking", path: "/tracking" },
  { icon: FileText, label: "Documents", path: "/documents" },
  { icon: DollarSign, label: "Invoices", path: "/invoices" },
  { icon: Globe, label: "Risk Monitor", path: "/risk" },
  { icon: MessageSquare, label: "Messages", path: "/messages" },
];

const transportModes = [
  { icon: Ship, label: "Ocean", count: 124 },
  { icon: Plane, label: "Air", count: 45 },
  { icon: Truck, label: "Road", count: 89 },
];

interface SidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, onCollapsedChange }: SidebarProps) {

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <img src={foraxisLogo} alt="Foraxis" className="h-9 w-auto" />
              <span className="text-lg font-bold text-sidebar-accent-foreground">
                Foraxis
              </span>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
              <Ship className="h-5 w-5 text-accent-foreground" />
            </div>
          )}
          <button
            onClick={() => onCollapsedChange(!collapsed)}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground transition-colors hover:bg-sidebar-accent",
              collapsed && "absolute -right-3 top-6 bg-sidebar border border-sidebar-border"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn("nav-item", isActive && "active", collapsed && "justify-center px-2")
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Transport Mode Summary */}
        {!collapsed && (
          <div className="border-t border-sidebar-border p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/60">
              Active by Mode
            </p>
            <div className="space-y-2">
              {transportModes.map((mode) => (
                <div
                  key={mode.label}
                  className="flex items-center justify-between rounded-lg bg-sidebar-accent px-3 py-2"
                >
                  <div className="flex items-center gap-2 text-sidebar-foreground">
                    <mode.icon className="h-4 w-4" />
                    <span className="text-sm">{mode.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-accent">
                    {mode.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="border-t border-sidebar-border p-3">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn("nav-item", isActive && "active", collapsed && "justify-center px-2")
            }
          >
            <Settings className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </NavLink>
        </div>
      </div>
    </aside>
  );
}
