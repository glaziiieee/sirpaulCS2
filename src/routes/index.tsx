import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  AiOutlineBarChart,
  AiOutlinePieChart,
  AiOutlineLineChart,
  AiOutlineAreaChart,
  AiOutlineDotChart,
  AiOutlineUpload,
  AiOutlineGlobal,
  AiOutlineRadarChart,
  AiOutlineNodeIndex,
} from "react-icons/ai";
import { useDashboardStats } from "../hooks/useDashboardStats";

export const Route = createFileRoute("/")({
  component: Index,
});

const dashboardCards = [
  {
    title: "Geographic Visualization",
    description: "Interactive choropleth maps of emigrant data",
    icon: <AiOutlineGlobal className="text-4xl text-accent" />,
    path: "/geographic",
    color: "from-accent to-highlight-1",
  },
  {
    title: "Comparison Charts",
    description: "Compare emigrant data across different categories",
    icon: <AiOutlineBarChart className="text-4xl text-accent" />,
    path: "/comparison",
    color: "from-accent to-highlight-2",
  },
  {
    title: "Composition Charts",
    description: "View data composition and proportions",
    icon: <AiOutlinePieChart className="text-4xl text-accent" />,
    path: "/composition",
    color: "from-secondary to-highlight-1",
  },
  {
    title: "Trend Analysis",
    description: "Analyze trends over time",
    icon: <AiOutlineLineChart className="text-4xl text-accent" />,
    path: "/trends",
    color: "from-primary to-accent",
  },
  {
    title: "Distribution Charts",
    description: "Visualize data distribution patterns",
    icon: <AiOutlineAreaChart className="text-4xl text-highlights" />,
    path: "/distribution",
    color: "from-orange-500 to-orange-600",
  },
  {
    title: "Relationship Analysis",
    description: "Explore correlations and relationships",
    icon: <AiOutlineDotChart className="text-4xl text-highlights" />,
    path: "/relationships",
    color: "from-pink-500 to-pink-600",
  },
  {
    title: "Radar Chart Analysis",
    description: "Compare multiple dimensions using spider/web charts",
    icon: <AiOutlineRadarChart className="text-4xl text-highlights" />,
    path: "/radar",
    color: "from-cyan-500 to-cyan-600",
  },
  {
    title: "Parallel Sets Flow",
    description: "Visualize data flow between categories",
    icon: <AiOutlineNodeIndex className="text-4xl text-highlights" />,
    path: "/parallel",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    title: "Upload Data",
    description: "Upload CSV files to Firebase",
    icon: <AiOutlineUpload className="text-4xl text-highlights" />,
    path: "/upload",
    color: "from-indigo-500 to-indigo-600",
  },
];

function Index() {
  const stats = useDashboardStats();

  if (stats.isLoading) {
    return (
      <div className="p-6 bg-primary min-h-screen flex items-center justify-center">
        <div className="text-gray-300">Loading dashboard data...</div>
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="p-6 bg-primary min-h-screen flex items-center justify-center">
        <div className="text-red-400">
          Error loading dashboard: {stats.error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-primary min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Filipino Emigrants Dashboard
          </h1>
          <p className="text-[#333333] text-lg font-medium">
            Comprehensive analysis of Filipino emigrant data
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-secondary rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#333333] text-sm">Total Countries</p>
                <p className="text-2xl font-bold text-white">
                  {stats.totalCountries}
                </p>
              </div>
              <AiOutlineGlobal className="text-3xl text-highlights" />
            </div>
          </div>
          <div className="bg-secondary rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#333333] text-sm">Data Years</p>
                <p className="text-2xl font-bold text-white">
                  {stats.dataYears}
                </p>
              </div>
              <AiOutlineLineChart className="text-3xl text-highlights" />
            </div>
          </div>
          <div className="bg-secondary rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#333333] text-sm">Total Emigrants (M)</p>
                <p className="text-2xl font-bold text-white">
                  {stats.totalEmigrants}M
                </p>
              </div>
              <AiOutlineBarChart className="text-3xl text-highlights" />
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {dashboardCards.map((card) => (
            <Link
              key={card.title}
              to={card.path}
              className="group bg-secondary rounded-lg p-6 border border-gray-700 hover:border-highlights transition-all duration-300 hover:shadow-lg hover:shadow-highlights/20"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 rounded-lg bg-gradient-to-r ${card.color} bg-opacity-20`}
                >
                  {card.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-highlights transition-colors">
                {card.title}
              </h3>
              <p className="text-[#333333] text-sm">{card.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
