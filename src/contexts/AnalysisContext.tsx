import { AgentResult, QuantumResult } from '@/types/flight';
import { createContext, ReactNode, useContext, useState } from 'react';

interface AnalysisState {
    agentResults: AgentResult[] | null;
    quantumResult: QuantumResult | null;
    analysisTimestamp: string | null;
    runwayInUse: boolean;
    activeRunwayFlight: string | null;
}

interface AnalysisContextType extends AnalysisState {
    setAgentResults: (results: AgentResult[]) => void;
    setQuantumResult: (result: QuantumResult) => void;
    clearAnalysis: () => void;
    setRunwayInUse: (inUse: boolean, flightId?: string | null) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AnalysisState>({
        agentResults: null,
        quantumResult: null,
        analysisTimestamp: null,
        runwayInUse: false,
        activeRunwayFlight: null,
    });

    const setAgentResults = (results: AgentResult[]) => {
        setState(prev => ({
            ...prev,
            agentResults: results,
            analysisTimestamp: new Date().toISOString(),
        }));
    };

    const setQuantumResult = (result: QuantumResult) => {
        setState(prev => ({
            ...prev,
            quantumResult: result,
        }));
    };

    const clearAnalysis = () => {
        setState(prev => ({
            ...prev,
            agentResults: null,
            quantumResult: null,
            analysisTimestamp: null,
        }));
    };

    const setRunwayInUse = (inUse: boolean, flightId: string | null = null) => {
        setState(prev => ({
            ...prev,
            runwayInUse: inUse,
            activeRunwayFlight: flightId,
        }));
    };

    return (
        <AnalysisContext.Provider
            value={{
                ...state,
                setAgentResults,
                setQuantumResult,
                clearAnalysis,
                setRunwayInUse,
            }}
        >
            {children}
        </AnalysisContext.Provider>
    );
}

export function useAnalysis() {
    const context = useContext(AnalysisContext);
    if (!context) {
        throw new Error('useAnalysis must be used within AnalysisProvider');
    }
    return context;
}
