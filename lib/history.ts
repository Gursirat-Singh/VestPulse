import { AgentStateData } from "../types";

export interface HistoryItem {
  companyName: string;
  ticker: string;
  decision: "INVEST" | "PASS" | null;
  confidence: number | null;
  timestamp: string;
  agentData?: AgentStateData;
}

const STORAGE_KEY = "investment_research_history";

export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    
    const parsed: HistoryItem[] = JSON.parse(raw);
    const now = new Date().getTime();
    
    // Filter items within last 1 hour (3600000 ms)
    const filtered = parsed.filter(item => {
      const itemTime = new Date(item.timestamp).getTime();
      return (now - itemTime) <= 3600000;
    });

    if (filtered.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }

    return filtered;
  } catch (e) {
    console.error("Failed to read history from localStorage", e);
    return [];
  }
}

export function saveHistoryItem(item: Omit<HistoryItem, "timestamp">): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const history = getHistory();
    // Remove if already exists to deduplicate
    const filtered = history.filter(
      (h) => h.companyName.toLowerCase() !== item.companyName.toLowerCase()
    );
    
    const newItem: HistoryItem = {
      ...item,
      timestamp: new Date().toISOString(),
    };
    
    const updated = [newItem, ...filtered].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to save history to localStorage", e);
    return [];
  }
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}
