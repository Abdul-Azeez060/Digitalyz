"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Database,
  Settings,
  Download,
  AlertTriangle,
  CheckCircle,
  Brain,
  BarChart3,
  Search,
  Home,
  Activity,
} from "lucide-react";
import { useData } from "@/contexts/data-context";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
    description: "Overview",
  },
  {
    name: "Data Upload",
    href: "/upload",
    icon: Upload,
    description: "Import CSV files",
  },
  {
    name: "Data View",
    href: "/dashboard",
    icon: Database,
    description: "View and edit data",
  },
  {
    name: "Search",
    href: "/search",
    icon: Search,
    description: "Natural language queries",
  },
  {
    name: "Rules",
    href: "/rules",
    icon: Settings,
    description: "Configure allocation rules",
  },
  {
    name: "Prioritization",
    href: "/prioritization",
    icon: BarChart3,
    description: "Set weights and priorities",
  },
  {
    name: "AI Insights",
    href: "/insights",
    icon: Brain,
    description: "AI-powered suggestions",
  },
  {
    name: "Export",
    href: "/export",
    icon: Download,
    description: "Download cleaned data",
  },
];

export function Sidebar() {
  const { state } = useData();
  const pathname = usePathname();

  const errorCount = state.validationErrors.filter(
    (e) => e.type === "error"
  ).length;
  const warningCount = state.validationErrors.filter(
    (e) => e.type === "warning"
  ).length;

  const hasData =
    state.clients.length > 0 ||
    state.workers.length > 0 ||
    state.tasks.length > 0;
  const totalRecords =
    state.clients.length + state.workers.length + state.tasks.length;

  return (
    <div className="w-64 bg-[#1a1d29] text-white flex flex-col border-r border-gray-800">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Data Alchemist</h1>
            <p className="text-xs text-gray-400">AI Resource Configurator</p>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
          {hasData ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-white">
                  Data Loaded
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {totalRecords} records
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-300">
                  No Data
                </span>
              </div>
              <span className="text-xs text-gray-500">Upload files</span>
            </div>
          )}
        </div>

        {/* Error/Warning Indicators */}
        {errorCount > 0 && (
          <div className="mt-3 flex items-center space-x-2 text-red-400">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs font-medium">{errorCount} errors</span>
          </div>
        )}

        {warningCount > 0 && errorCount === 0 && (
          <div className="mt-3 flex items-center space-x-2 text-yellow-400">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs font-medium">{warningCount} warnings</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        <ScrollArea className="h-full">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center w-full p-3 rounded-lg transition-all duration-200 text-left group",
                      isActive
                        ? "bg-white/10 text-white"
                        : "hover:bg-white/5 text-gray-400 hover:text-white"
                    )}>
                    <item.icon
                      className={cn(
                        "h-5 w-5 mr-3 transition-all duration-200",
                        isActive
                          ? "text-white"
                          : "text-gray-500 group-hover:text-gray-300"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-gray-500 group-hover:text-gray-400">
                        {item.description}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
