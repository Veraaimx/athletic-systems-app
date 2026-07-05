"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, CalendarRange, BarChart3, UserRound, History, Target } from "lucide-react";

const LINKS = [
  { href: "/", label: "Inicio", icon: Dumbbell, matchExtra: ["/session"] },
  { href: "/block", label: "Workouts", icon: CalendarRange },
  { href: "/goal", label: "Meta", icon: Target },
  { href: "/stats", label: "Activity", icon: BarChart3 },
  { href: "/profile", label: "Perfil", icon: UserRound },
  { href: "/history", label: "Historial", icon: History },
];

function isActive(pathname: string, href: string, matchExtra?: string[]) {
  return pathname === href || (matchExtra ?? []).includes(pathname);
}

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">Athletic Systems</div>
      <nav className="sidebar-nav">
        {LINKS.map(({ href, label, icon: Icon, matchExtra }) => {
          const active = isActive(pathname, href, matchExtra);
          return (
            <Link key={href} href={href} className={`sidebar-link${active ? " active" : ""}`}>
              <Icon size={18} className="nav-icon" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bottom-nav">
      {LINKS.map(({ href, label, icon: Icon, matchExtra }) => {
        const active = isActive(pathname, href, matchExtra);
        return (
          <Link key={href} href={href} className={active ? "active" : ""}>
            <Icon size={20} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
