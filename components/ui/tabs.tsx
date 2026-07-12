"use client";

import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TabsProps {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

interface TabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

const TabsContext = React.createContext<{
  selectedValue: string;
  setSelectedValue: (val: string) => void;
} | null>(null);

export function Tabs({ defaultValue, className, children }: TabsProps) {
  const [selectedValue, setSelectedValue] = React.useState(defaultValue);

  return (
    <TabsContext.Provider value={{ selectedValue, setSelectedValue }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children }: TabsListProps) {
  return (
    <div className={cn("inline-flex items-center justify-start rounded-lg bg-zinc-900/60 p-1 border border-white/[0.05] text-zinc-400 w-full overflow-x-auto whitespace-nowrap scrollbar-none", className)}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, className, children }: TabsTriggerProps) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const isActive = context.selectedValue === value;

  return (
    <button
      type="button"
      onClick={() => context.setSelectedValue(value)}
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive 
          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/25 scale-[1.02]" 
          : "hover:bg-zinc-800/50 hover:text-zinc-200",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children }: TabsContentProps) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  if (context.selectedValue !== value) return null;

  return <div className={cn("mt-4 outline-none", className)}>{children}</div>;
}
