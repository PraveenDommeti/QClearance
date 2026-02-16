import { useState } from "react";
import { Shield, Radio } from "lucide-react";
import { TabId, Flight } from "@/types/flight";
import { useFlightData } from "@/contexts/FlightDataContext";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import MonitoringControls from "@/components/MonitoringControls";
import LiveQueueTab from "@/components/tabs/LiveQueueTab";
import SlotRequestTab from "@/components/tabs/SlotRequestTab";
import AgentAnalysisTab from "@/components/tabs/AgentAnalysisTab";
import QuantumCheckTab from "@/components/tabs/QuantumCheckTab";
import DecisionReviewTab from "@/components/tabs/DecisionReviewTab";
import AuditHistoryTab from "@/components/tabs/AuditHistoryTab";

export default function Index() {
  const [activeTab, setActiveTab] = useState<TabId>("queue");
  const [selectedFlight, setSelectedFlight] = useState<Flight | undefined>();
  const { lastUpdate, clearances } = useFlightData();

  const renderTabContent = () => {
    switch (activeTab) {
      case "queue":
        return <LiveQueueTab onSelectFlight={setSelectedFlight} selectedFlight={selectedFlight} />;
      case "slots":
        return <SlotRequestTab />;
      case "agents":
        return <AgentAnalysisTab />;
      case "quantum":
        return <QuantumCheckTab />;
      case "decisions":
        return <DecisionReviewTab />;
      case "audit":
        return <AuditHistoryTab />;
      default:
        return <LiveQueueTab onSelectFlight={setSelectedFlight} selectedFlight={selectedFlight} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="px-6 py-4 flex items-center justify-between border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">QClearance</h1>
              <p className="text-xs text-muted-foreground">
                Quantum-Enhanced Aviation Safety Monitoring
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/30 rounded-lg">
              <Radio className="w-4 h-4 text-success animate-pulse" />
              <span className="text-xs font-medium text-success">LIVE</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-primary">ADVISORY MODE</span>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-xs text-muted-foreground">OPERATIONAL STATUS</p>
              <p className="text-sm font-medium text-foreground">DXB INTL • RWY 08L/26R</p>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="px-6 py-3 border-b border-white/5 flex-shrink-0">
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-[1800px] mx-auto">
            {renderTabContent()}
          </div>
        </main>

        {/* Footer Status Bar */}
        <footer className="px-6 py-3 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground flex-shrink-0">
          <div className="flex items-center gap-6">
            <span>Last Update: {lastUpdate.toLocaleTimeString()}</span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success" />
              All Systems Operational
            </span>
            <span className="flex items-center gap-2">
              <span className="text-muted-foreground">Active Clearances:</span>
              <span className="text-primary font-medium">{clearances.filter(c => c.status !== "completed").length}</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span>Latency: 24ms</span>
            <span>Session: ATC-DXB-001</span>
            <span className="text-primary font-medium">Human-in-Loop Active</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
