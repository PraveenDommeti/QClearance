import AppLayout from "@/components/AppLayout";
import Navigation from "@/components/Navigation";
import AgentAnalysisTab from "@/components/tabs/AgentAnalysisTab";
import AuditHistoryTab from "@/components/tabs/AuditHistoryTab";
import DecisionReviewTab from "@/components/tabs/DecisionReviewTab";
import LiveQueueTab from "@/components/tabs/LiveQueueTab";
import QuantumCheckTab from "@/components/tabs/QuantumCheckTab";
import SlotRequestTab from "@/components/tabs/SlotRequestTab";
import { useAuth } from "@/contexts/AuthContext";
import { playSoundEffect } from "@/lib/soundEffects";
import { Flight, TabId } from "@/types/flight";
import { useState } from "react";
import { toast } from "sonner";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("queue");
  const [selectedFlight, setSelectedFlight] = useState<Flight | undefined>();
  const [animatedFlightId, setAnimatedFlightId] = useState<string | null>(null);
  const { updateActivity } = useAuth();

  // Update activity on user interaction
  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    updateActivity();
  };

  const handleNextPhase = (nextTab: TabId) => {
    setActiveTab(nextTab);
    updateActivity();

    // Add sound effects and notifications for automatic transitions
    if (nextTab === "quantum") {
      playSoundEffect.weatherAlert();
      toast.success("✓ Agent Analysis Complete", {
        description: "Proceeding to Quantum Optimization...",
        duration: 3000,
      });
    } else if (nextTab === "decisions") {
      playSoundEffect.clearanceApproved();
      toast.success("✓ Quantum Optimization Complete", {
        description: "Proceeding to Decision Review...",
        duration: 3000,
      });
    }
  };

  const handleSelectFlight = (flight: Flight) => {
    setSelectedFlight(flight);
    updateActivity();
  };

  const handleDecisionApprove = (flightId: string) => {
    setAnimatedFlightId(flightId);
    setActiveTab("queue"); // Redirect to live queue
    updateActivity();
  };

  const handleTriggerProcessed = () => {
    // Clear the trigger after it's been processed to prevent double animation
    setAnimatedFlightId(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "queue":
        return <LiveQueueTab onSelectFlight={handleSelectFlight} selectedFlight={selectedFlight} triggeredFlightId={animatedFlightId} onTriggerProcessed={handleTriggerProcessed} />;
      case "slots":
        return <SlotRequestTab />;
      case "agents":
        return <AgentAnalysisTab flight={selectedFlight} onComplete={() => handleNextPhase("quantum")} />;
      case "quantum":
        return <QuantumCheckTab onComplete={() => handleNextPhase("decisions")} />;
      case "decisions":
        return <DecisionReviewTab onApprove={handleDecisionApprove} />;
      case "audit":
        return <AuditHistoryTab />;
      default:
        return <LiveQueueTab onSelectFlight={handleSelectFlight} selectedFlight={selectedFlight} />;
    }
  };

  return (
    <AppLayout>
      {/* Tab Navigation */}
      <div className="px-6 py-3 border-b border-white/5 flex-shrink-0">
        <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Dashboard Content */}
      <main className="flex-1 p-6 overflow-auto" onClick={() => updateActivity()}>
        <div className="max-w-[1800px] mx-auto">
          {renderTabContent()}
        </div>
      </main>
    </AppLayout>
  );
}
