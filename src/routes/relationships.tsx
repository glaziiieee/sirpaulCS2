import { createFileRoute } from "@tanstack/react-router";
import HeatmapChart from "../components/HeatmapChart";

export const Route = createFileRoute('/relationships')({
  component: RelationshipCharts,
});

function RelationshipCharts() {

  return (
    <div className="p-6 bg-primary min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Age vs Sex Analysis
          </h1>
          <p className="text-gray-300 text-lg">
            Explore emigration patterns across different age groups and sex categories using heatmap visualization
          </p>
        </div>

        {/* Main Heatmap Chart */}
        <div className="bg-secondary rounded-lg p-6 border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 text-center">
            Age Group vs Sex Heatmap
          </h2>
          <p className="text-gray-400 text-sm text-center mb-4">
            This heatmap shows the distribution of emigrants across age groups (x-axis) and sex categories (y-axis). 
            Darker/warmer colors indicate higher emigrant numbers.
          </p>
          <div className="h-[500px]">
            <HeatmapChart />
          </div>
        </div>

        {/* Insights Panel */}
        <div className="bg-secondary rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            About This Analysis
          </h3>
          <div className="space-y-3 text-gray-300">
            <p>
              This heatmap visualizes the relationship between age groups and sex categories in emigration patterns. 
              The data is aggregated across all available years to show overall trends in emigration demographics.
            </p>
            <div className="bg-primary rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-white mb-2">Key Insights:</h4>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Darker/warmer colors indicate higher emigrant numbers for specific age group and sex combinations</li>
                <li>Cooler colors represent lower emigration in those categories</li>
                <li>Patterns reveal which age groups and sex categories are most likely to emigrate</li>
                <li>The visualization helps identify demographic trends in Filipino emigration</li>
                <li>Hover over cells to see exact emigrant counts for each category</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}