"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Upload,
  Database,
  Settings,
  BarChart3,
  Download,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  Shield,
  CheckCircle,
  Users,
  Clock,
  Star,
  Play,
  ChevronRight,
} from "lucide-react";
import { useData } from "@/contexts/data-context";

export default function Home() {
  const router = useRouter();
  const { state } = useData();

  const features = [
    {
      icon: Upload,
      title: "Smart Data Ingestion",
      description:
        "AI-powered CSV parsing with automatic header mapping and data normalization",
      color: "#6366f1",
    },
    {
      icon: Database,
      title: "Interactive Data Grid",
      description:
        "Edit and validate data with real-time error detection and intelligent suggestions",
      color: "#10b981",
    },
    {
      icon: Brain,
      title: "Natural Language Queries",
      description:
        "Search and filter data using plain English commands with AI understanding",
      color: "#8b5cf6",
    },
    {
      icon: Settings,
      title: "Visual Rule Builder",
      description:
        "Create complex allocation rules with intuitive drag-and-drop interface",
      color: "#f59e0b",
    },
    {
      icon: BarChart3,
      title: "Smart Prioritization",
      description:
        "AI-assisted weight optimization for resource allocation strategies",
      color: "#ef4444",
    },
    {
      icon: Download,
      title: "Clean Export",
      description:
        "Export validated data and structured rules ready for production use",
      color: "#06b6d4",
    },
  ];

  const stats = [
    {
      label: "Clients",
      value: state.clients.length,
      icon: Users,
      color: "#6366f1",
      change: "+12%",
    },
    {
      label: "Workers",
      value: state.workers.length,
      icon: Brain,
      color: "#10b981",
      change: "+8%",
    },
    {
      label: "Tasks",
      value: state.tasks.length,
      icon: Zap,
      color: "#8b5cf6",
      change: "+24%",
    },
    {
      label: "Rules",
      value: state.rules.length,
      icon: Settings,
      color: "#f59e0b",
      change: "+5%",
    },
  ];

  const hasData =
    state.clients.length > 0 ||
    state.workers.length > 0 ||
    state.tasks.length > 0;

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Welcome to Data Alchemist</h1>
            <p className="page-subtitle">
              Transform messy spreadsheets into optimized resource allocation
              workflows with AI
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="badge-modern badge-info">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
            <Badge className="badge-modern badge-success">
              <Shield className="h-3 w-3 mr-1" />
              Enterprise Ready
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {hasData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="metric-card">
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15` }}>
                  <stat.icon
                    className="h-5 w-5"
                    style={{ color: stat.color }}
                  />
                </div>
                <div
                  className={`metric-change ${
                    stat.change.startsWith("+") ? "positive" : "negative"
                  }`}>
                  {stat.change}
                </div>
              </div>
              <div className="metric-value">{stat.value}</div>
              <div className="metric-label">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="card-modern overflow-hidden bg-black">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-white">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                {hasData ? (
                  <Database className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 text-white">
                  {hasData ? "Continue Working" : "Get Started"}
                </h3>
                <p className="text-gray-300 mb-4 text-sm">
                  {hasData
                    ? "Continue working with your loaded data and explore AI insights"
                    : "Upload your CSV files to begin the transformation process"}
                </p>
                <Button
                  onClick={() =>
                    router.push(hasData ? "/dashboard" : "/upload")
                  }
                  className="bg-white text-gray-900 hover:bg-gray-50 border-0 font-medium">
                  {hasData ? "View Dashboard" : "Upload Data"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="card-modern overflow-hidden">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Brain className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 text-white">
                  AI Insights
                </h3>
                <p className="text-blue-100 mb-4 text-sm">
                  Get intelligent suggestions and automated optimizations for
                  your workflow
                </p>
                <Button
                  onClick={() => router.push("/insights")}
                  className="border-white/30 bg-white   hover:bg-white/10 text-black"
                  disabled={!hasData}>
                  Explore AI Features
                  <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Features Grid */}
      <div className="mb-8">
        <div className="mb-8">
          <h2 className="text-heading-2 text-gray-900 mb-2">
            Powerful Features
          </h2>
          <p className="text-body">
            Everything you need to transform your data workflow with
            cutting-edge AI technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="card-modern p-6 group cursor-pointer">
              <div className="flex items-start space-x-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 smooth-transition"
                  style={{ backgroundColor: `${feature.color}15` }}>
                  <feature.icon
                    className="h-5 w-5"
                    style={{ color: feature.color }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                    {feature.title}
                  </h3>
                  <p className="text-body text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 smooth-transition" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Process Flow */}
      <div className="mb-8">
        <div className="mb-8">
          <h2 className="text-heading-2 text-gray-900 mb-2">How It Works</h2>
          <p className="text-body">Three simple steps to transform your data</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              icon: Upload,
              title: "Upload Data",
              description:
                "Upload your CSV files and let AI handle intelligent header mapping and data validation",
              color: "#6366f1",
            },
            {
              step: "02",
              icon: Settings,
              title: "Configure Rules",
              description:
                "Build sophisticated allocation rules using our intuitive visual interface",
              color: "#8b5cf6",
            },
            {
              step: "03",
              icon: Download,
              title: "Export Results",
              description:
                "Download clean, validated data and structured rules ready for production",
              color: "#10b981",
            },
          ].map((step, index) => (
            <div key={index} className="text-center">
              <div className="relative mb-6">
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto shadow-sm"
                  style={{ backgroundColor: step.color }}>
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                <div
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: step.color }}>
                  {step.step}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-body text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      {!hasData && (
        <Card className="card-modern overflow-hidden">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-12 text-center text-white relative">
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-8">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">
                Ready to Transform Your Data?
              </h3>
              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of teams who have streamlined their resource
                allocation with Data Alchemist
              </p>
              <div className="flex items-center justify-center space-x-4">
                <Button
                  size="lg"
                  onClick={() => router.push("/upload")}
                  className="bg-white text-gray-900 hover:bg-gray-50 border-0 font-medium px-6 py-3 h-auto">
                  <Star className="mr-2 h-4 w-4" />
                  Start Your Journey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
