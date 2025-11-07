import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useRelationshipData } from "../hooks/useRelationshipData";
import HeatmapChart from "../components/HeatmapChart";

export const Route = createFileRoute('/relationships')({
  component: RelationshipCharts,
});

function RelationshipCharts() {
  const [selectedMetric, setSelectedMetric] = useState<string>("age-income");
  const {
    ageIncomeData,
    educationIncomeData,
    countryDistanceData,
    correlationData,
    loading,
    error,
  } = useRelationshipData(selectedMetric);

  if (loading) {
    return (
      <div className="p-6 bg-primary min-h-screen flex items-center justify-center">
        <div className="text-[#333333]">Loading relationship data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-primary min-h-screen flex items-center justify-center">
        <div className="text-red-400">Error loading data: {error}</div>
      </div>
    );
  }

  const getCurrentData = () => {
    switch (selectedMetric) {
      case "age-income":
        return ageIncomeData;
      case "education-income":
        return educationIncomeData;
      case "distance-emigrants":
        return countryDistanceData;
      default:
        return ageIncomeData;
    }
  };

  // labels were previously used for the scatterplot axes; heatmap uses
  // generated row/column keys instead.
  const currentData = getCurrentData();

  // use HeatmapChart component to render a heatmap from the series data

  // Validate data structure
  const isValidData =
    Array.isArray(currentData) &&
    currentData.length > 0 &&
    currentData.every(
      (series) =>
        series.id && Array.isArray(series.data) && series.data.length > 0
    );

  return (
    <div className="p-6 bg-primary min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Relationship Analysis
            </h1>
            <p className="text-white text-lg">
              Explore correlations and relationships between variables using
              heatmaps
            </p>
          </div>        {/* Filters */}
          <div className="bg-secondary rounded-lg p-6 border border-gray-700 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4 text-center">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Relationship Type
              </label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="w-full p-3 border border-gray-600 rounded-lg bg-primary text-white focus:ring-highlights focus:border-highlights"
              >
                <option value="age-income">Age vs Income</option>
                <option value="education-income">Education vs Income</option>
                <option value="distance-emigrants">
                  Distance vs Emigrants
                </option>
              </select>
            </div>
              <div className="flex items-end">
              <p className="text-sm text-gray-dark">
                Select a relationship type to visualize the correlation between
                variables.
              </p>
            </div>
          </div>
        </div>

        {/* Main Bubble Chart */}
        <div className="bg-secondary rounded-lg p-6 border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 text-center">
            {selectedMetric === "age-income" && "Age vs Income Relationship"}
            {selectedMetric === "education-income" &&
              "Education vs Income Relationship"}
            {selectedMetric === "distance-emigrants" &&
              "Distance vs Emigrants Relationship"}
          </h2>
          <div className="h-96">
            {isValidData ? (
              <HeatmapChart seriesArray={currentData as any[]} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                <p className="text-sm text-gray-800 mb-2">No data available</p>
                  <p className="text-sm text-gray-700">
                    Please ensure the required data has been uploaded
                  </p>
                  {currentData && (
                    <pre className="mt-4 text-xs text-gray-600 max-w-md overflow-auto">
                      {JSON.stringify(currentData, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Correlation Matrix */}
        <div className="bg-secondary rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 text-center">
            Correlation Matrix
          </h3>
          {correlationData && correlationData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-3 px-4">Metric</th>
                    <th className="text-center py-3 px-4">Correlation</th>
                    <th className="text-center py-3 px-4">Strength</th>
                    <th className="text-center py-3 px-4">Visualization</th>
                  </tr>
                </thead>
                <tbody>
                  {correlationData.map((item, index) => (
                    <tr key={index} className="border-b border-gray-700">
                      <td className="py-3 px-4">{item.metric}</td>
                      <td className="text-center py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            Math.abs(item.correlation) > 0.7
                              ? "bg-green-600"
                              : Math.abs(item.correlation) > 0.5
                                ? "bg-yellow-600"
                                : "bg-red-600"
                          }`}
                        >
                          {item.correlation.toFixed(2)}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">{item.strength}</td>
                      <td className="text-center py-3 px-4">
                        <div className="w-20 bg-gray-700 rounded-full h-2 mx-auto">
                          <div
                            className={`h-2 rounded-full ${
                              Math.abs(item.correlation) > 0.7
                                ? "bg-green-500"
                                : Math.abs(item.correlation) > 0.5
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                            style={{
                              width: `${Math.abs(item.correlation) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-dark">
              No correlation data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
