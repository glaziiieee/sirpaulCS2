import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ResponsiveLine } from "@nivo/line";
import {
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Bar,
} from "recharts";
import { useTrendData } from "../hooks/useTrendData";

interface OHLCData {
  year: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

// Custom Candlestick Shape Component
const CandlestickShape = (props: any) => {
  const { x, y, width, height, payload } = props;

  if (
    !payload ||
    !payload.open ||
    !payload.close ||
    !payload.high ||
    !payload.low
  ) {
    return null;
  }

  const { open, close, high, low } = payload as OHLCData;
  const isGreen = close >= open;
  const color = isGreen ? "#22c55e" : "#ef4444";

  // Simple positioning for the candlestick
  const centerX = x + width / 2;
  const bodyTop = Math.min(y, y + height);
  const bodyHeight = Math.abs(height);

  return (
    <g>
      {/* Wick line */}
      <line
        x1={centerX}
        y1={y - 10}
        x2={centerX}
        y2={y + height + 10}
        stroke={color}
        strokeWidth={2}
      />

      {/* Body */}
      <rect
        x={x + width * 0.25}
        y={bodyTop}
        width={width * 0.5}
        height={Math.max(bodyHeight, 3)}
        fill={color}
        stroke={color}
      />
    </g>
  );
};

export const Route = createFileRoute("/trends")({
  component: TrendAnalysis,
});

// Transform age group trend data to OHLC format
function transformToOHLC(
  ageGroupTrends: any[],
  selectedAgeGroup: string
): OHLCData[] {
  const selectedData = ageGroupTrends.find(
    (trend) => trend.id === selectedAgeGroup
  );

  if (!selectedData) return [];

  return selectedData.data.map((point: any, index: number, arr: any[]) => {
    const value = point.y;
    const prevValue = index > 0 ? arr[index - 1].y : value;
    const volatility = value * 0.1; // 10% volatility

    return {
      year: point.x,
      open: prevValue,
      high: value + volatility,
      low: value - volatility,
      close: value,
    };
  });
}

function TrendAnalysis() {
  const [selectedCountry, setSelectedCountry] = useState<string>("USA");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("");

  const {
    countryTrends,
    ageGroupTrends,
    loading,
    error,
    countries,
    ageGroups,
  } = useTrendData(selectedCountry);

  // Set default age group when data loads
  if (!selectedAgeGroup && ageGroups.length > 0) {
    setSelectedAgeGroup(ageGroups[0]);
  }

  const candlestickData = transformToOHLC(ageGroupTrends, selectedAgeGroup);

  if (loading) {
    return (
      <div className="p-6 bg-primary min-h-screen flex items-center justify-center">
        <div className="text-gray-300">Loading trend data...</div>
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

  return (
    <div className="p-6 bg-primary min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Trend Analysis</h1>
          <p className="text-gray-300 text-lg">
            Analyze trends over time across different countries and categories
          </p>
        </div>

        {/* Filters */}
        <div className="bg-secondary rounded-lg p-6 border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full p-3 border border-gray-600 rounded-lg bg-primary text-white focus:ring-highlights focus:border-highlights"
              >
                {countries.map((country) => (
                  <option
                    key={country}
                    value={country}
                    className="bg-primary text-white"
                  >
                    {country}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Age Group
              </label>
              <select
                value={selectedAgeGroup}
                onChange={(e) => setSelectedAgeGroup(e.target.value)}
                className="w-full p-3 border border-gray-600 rounded-lg bg-primary text-white focus:ring-highlights focus:border-highlights"
              >
                {ageGroups.map((ageGroup) => (
                  <option
                    key={ageGroup}
                    value={ageGroup}
                    className="bg-primary text-white"
                  >
                    {ageGroup}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Country Trends */}
          <div className="bg-secondary rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">
              Country Trends Over Time
            </h2>
            <div className="h-80">
              <ResponsiveLine
                data={countryTrends.slice(0, 5)}
                margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                xScale={{ type: "point" }}
                yScale={{
                  type: "linear",
                  min: "auto",
                  max: "auto",
                  stacked: false,
                  reverse: false,
                }}
                yFormat=" >-.0f"
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Year",
                  legendOffset: 36,
                  legendPosition: "middle",
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Emigrants",
                  legendOffset: -40,
                  legendPosition: "middle",
                }}
                pointSize={10}
                pointColor={{ theme: "background" }}
                pointBorderWidth={2}
                pointBorderColor={{ from: "serieColor" }}
                pointLabelYOffset={-12}
                useMesh={true}
                legends={[
                  {
                    anchor: "bottom-right",
                    direction: "column",
                    justify: false,
                    translateX: 100,
                    translateY: 0,
                    itemsSpacing: 0,
                    itemDirection: "left-to-right",
                    itemWidth: 80,
                    itemHeight: 20,
                    itemOpacity: 0.75,
                    symbolSize: 12,
                    symbolShape: "circle",
                    symbolBorderColor: "rgba(0, 0, 0, .5)",
                    effects: [
                      {
                        on: "hover",
                        style: {
                          itemBackground: "rgba(0, 0, 0, .03)",
                          itemOpacity: 1,
                        },
                      },
                    ],
                  },
                ]}
              />
            </div>
          </div>

          {/* Age Group Candlestick Chart */}
          <div className="bg-secondary rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">
              Age Group Trends - {selectedAgeGroup} (Candlestick)
            </h2>
            <div className="h-80">
              <ComposedChart
                width={600}
                height={320}
                data={candlestickData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="year"
                  stroke="#9ca3af"
                  label={{
                    value: "Year",
                    position: "insideBottom",
                    offset: -10,
                    fill: "#fff",
                  }}
                />
                <YAxis
                  stroke="#9ca3af"
                  label={{
                    value: "Emigrants",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#fff",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number) => [
                    Math.round(value).toLocaleString(),
                    "",
                  ]}
                  labelFormatter={(label: string) => `Year: ${label}`}
                />
                <Bar
                  dataKey="close"
                  fill="transparent"
                  shape={<CandlestickShape />}
                />
              </ComposedChart>
            </div>
          </div>
        </div>

        {/* Data Summary */}
        <div className="bg-secondary rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            Trend Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Countries Tracked</p>
              <p className="text-2xl font-bold text-white">
                {countries.length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Age Groups</p>
              <p className="text-2xl font-bold text-white">
                {ageGroups.length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Selected Country</p>
              <p className="text-2xl font-bold text-white">{selectedCountry}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Selected Age Group</p>
              <p className="text-2xl font-bold text-white">
                {selectedAgeGroup}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrendAnalysis;
