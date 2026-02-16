import { Plane, FileCheck, Cpu, Zap, ClipboardCheck, History } from "lucide-react";
import { TabId } from "@/types/flight";

interface NavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const navItems: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "queue", label: "LIVE QUEUE", icon: <Plane className="w-4 h-4" /> },
  { id: "slots", label: "SLOT REQUESTS", icon: <FileCheck className="w-4 h-4" /> },
  { id: "agents", label: "AGENT ANALYSIS", icon: <Cpu className="w-4 h-4" /> },
  { id: "quantum", label: "QUANTUM CHECK", icon: <Zap className="w-4 h-4" /> },
  { id: "decisions", label: "DECISIONS", icon: <ClipboardCheck className="w-4 h-4" /> },
  { id: "audit", label: "AUDIT LOG", icon: <History className="w-4 h-4" /> },
];

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="flex items-center justify-center gap-1 p-2 glass-panel-dark overflow-x-auto">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className={`nav-tab flex items-center gap-2 whitespace-nowrap ${
            activeTab === item.id ? "nav-tab-active" : ""
          }`}
        >
          {item.icon}
          <span className="hidden sm:inline">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
