import { ResponsiveHeatMap } from '@nivo/heatmap';

interface HeatmapData {
  id: string;
  data: Array<{
    x: string;
    y: number;
  }>;
}

interface HeatmapChartProps {
  seriesArray: HeatmapData[];
}

function HeatmapChart({ seriesArray }: HeatmapChartProps) {
  // Transform the data into the format expected by Nivo HeatMap
  const transformedData = seriesArray.map(series => ({
    id: series.id,
    data: series.data
  }));

  return (
    <ResponsiveHeatMap
      data={transformedData}
      margin={{ top: 60, right: 90, bottom: 60, left: 90 }}
      axisTop={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: -90,
        legend: '',
        legendOffset: 46
      }}
      axisRight={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: '',
        legendOffset: 70
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: '',
        legendOffset: -70
      }}
      colors={cell => {
        const value = cell.value || 0;
        if (value < 0.2) return '#FFE5EC'; // lightest pink
        if (value < 0.4) return '#FFD5E0'; // light pink
        if (value < 0.6) return '#FFC5CF'; // medium pink
        if (value < 0.8) return '#FFACB5'; // darker pink
        return '#FF8C9A';                  // darkest pink
      }}
      emptyColor="#fff0f3"
      enableLabels={true}
      labelTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
      animate={true}
      motionConfig="gentle"
      theme={{
        axis: {
          ticks: {
            text: {
              fill: '#555555'
            }
          },
          legend: {
            text: {
              fill: '#555555'
            }
          }
        },
        labels: {
          text: {
            fill: '#555555'
          }
        },
        tooltip: {
          container: {
            background: '#ffffff',
            color: '#555555'
          }
        }
      }}
    />
  );
}

export default HeatmapChart;