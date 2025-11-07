import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import { useRelationshipData } from "../hooks/useRelationshipData";

export const Route = createFileRoute("/heatmap")({
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
        <div className="text-gray-300">Loading relationship data...</div>
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

  // Transform scatter-like series into heatmap-compatible data.
  const transformToHeatmap = (seriesArray: any[]) => {
    // Flatten points
    const points: Array<{ x: number; y: number; size?: number }> = [];
    seriesArray.forEach((s) => {
      (s.data || []).forEach((p: any) => {
        points.push({ x: Number(p.x), y: Number(p.y), size: p.size });
      });
    });

    if (points.length === 0) return { data: [], keys: [] };

    // Determine x labels (unique sorted x values)
    const xLabels = Array.from(new Set(points.map((p) => p.x))).sort(
      (a, b) => a - b
    );

    // Determine y bins
    const ys = points.map((p) => p.y);
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys);
    const BIN_COUNT = 6;
    const binSize = (yMax - yMin) / BIN_COUNT || 1;
    const keys: string[] = [];
    for (let i = 0; i < BIN_COUNT; i++) {
      const start = Math.round(yMin + i * binSize);
      const end = Math.round(yMin + (i + 1) * binSize);
      keys.push(`${start}-${end}`);
    }

    // Initialize rows
    const rows = xLabels.map((x) => {
      const row: any = { id: String(x) };
      keys.forEach((k) => (row[k] = 0));
      return row;
    });

    // Fill counts (or aggregate sizes)
    points.forEach((p) => {
      const xIndex = xLabels.indexOf(p.x);
      if (xIndex === -1) return;
      const bin = Math.min(
        Math.floor((p.y - yMin) / binSize),
        BIN_COUNT - 1
      );
      const key = keys[bin];
      rows[xIndex][key] += 1; // count points in bin
    });

    return { data: rows, keys };
  };

  const heatmap = transformToHeatmap(currentData as any[]);

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
          <p className="text-gray-300 text-lg">
            Explore correlations and relationships between variables using
            heatmaps
          </p>
        </div>

        {/* Filters */}
        <div className="bg-secondary rounded-lg p-6 border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Filters</h2>
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
              <p className="text-sm text-gray-400">
                Select a relationship type to visualize the correlation between
                variables.
              </p>
            </div>
          </div>
        </div>

        {/* Main Bubble Chart */}
        <div className="bg-secondary rounded-lg p-6 border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            {selectedMetric === "age-income" && "Age vs Income Relationship"}
            {selectedMetric === "education-income" &&
              "Education vs Income Relationship"}
            {selectedMetric === "distance-emigrants" &&
              "Distance vs Emigrants Relationship"}
          </h2>
          <div className="h-96">
            {isValidData && heatmap.data.length > 0 ? (
              <ResponsiveHeatMap
                data={heatmap.data}
                key={heatmap.keys.join("-")}
                {...({ keys: heatmap.keys } as any)}
                margin={{ top: 60, right: 60, bottom: 60, left: 100 }}
                forceSquare={false}
                sizeVariation={false}
                colors={{ type: 'quantize', scheme: "reds" }}
                emptyColor="#222832"
                minValue={0}
                maxValue={"auto"}
                axisTop={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: -45,
                }}
                axisLeft={{
                  tickSize: 5,
                }}
                cellOpacity={1}
                cellBorderWidth={1}
                cellBorderColor={{ from: "color", modifiers: [["darker", 0.3]] }}
                hoverTarget="cell"
                animate={true}
                motionConfig="wobbly"
                theme={{
                  background: "transparent",
                  text: { fill: "#9ca3af" },
                  axis: {
                    legend: { text: { fill: "#d1d5db" } },
                    ticks: { text: { fill: "#9ca3af" } },
                  },
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-gray-400 mb-2">No data available</p>
                  <p className="text-sm text-gray-500">
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
          <h3 className="text-lg font-semibold text-white mb-4">
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
            <div className="text-center py-8 text-gray-400">
              No correlation data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
