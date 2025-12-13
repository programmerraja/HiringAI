import { NavLink } from "react-router-dom";
import { Bot, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    to: "/dashboard/agents",
    icon: Bot,
    label: "Agents",
  },
  {
    to: "/dashboard/candidates",
    icon: Users,
    label: "Candidates",
  },
  {
    to: "/dashboard/settings",
    icon: Settings,
    label: "Settings",
  },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-neutral-900 border-r border-neutral-800 min-h-[calc(100vh-65px)]">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-white text-black"
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
