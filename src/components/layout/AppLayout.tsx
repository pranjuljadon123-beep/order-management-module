import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";
import { AiAssistant } from "@/components/ai/AiAssistant";
import { AiGlobalBridge } from "@/components/ai/AiGlobalBridge";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
      <div className={cn(
        "min-w-0 overflow-x-hidden transition-all duration-300",
        sidebarCollapsed ? "pl-20" : "pl-64"
      )}>
        <Header />
        <main className="p-6">{children}</main>
      </div>
      <AiAssistant />
      <AiGlobalBridge />
    </div>
  );
}
