import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

interface HeatmapDataPoint {
  x: string | number;
  y: number;
}

interface HeatmapSeries {
  id: string;
  data: HeatmapDataPoint[];
}

interface HeatmapChartProps {
  seriesArray?: HeatmapSeries[]; // Made optional since we're fetching internally
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({ seriesArray }) => {
  const [ageSexData, setAgeSexData] = useState<HeatmapSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch age and sex data from Firebase
  useEffect(() => {
    const fetchAgeSexData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch age data
        const ageQuery = query(
          collection(db, 'emigrantData/age/years'),
          orderBy('Year')
        );
        const ageSnapshot = await getDocs(ageQuery);

        // Fetch sex data
        const sexQuery = query(
          collection(db, 'emigrantData/sex/years'),
          orderBy('Year')
        );
        const sexSnapshot = await getDocs(sexQuery);

        // Aggregate age data by age group (across all years)
        const ageGroupTotals = new Map<string, number>();
        const ageGroups = new Set<string>();

        ageSnapshot.docs.forEach((doc) => {
          const docData = doc.data();
          Object.keys(docData).forEach((key) => {
            if (key !== 'Year' && typeof docData[key] === 'number') {
              ageGroups.add(key);
              const currentTotal = ageGroupTotals.get(key) || 0;
              ageGroupTotals.set(key, currentTotal + docData[key]);
            }
          });
        });

        // Aggregate sex data (across all years)
        // Sex data is stored with MALE and FEMALE as field names (similar to age data)
        const sexTotals = new Map<string, number>();
        sexSnapshot.docs.forEach((doc) => {
          const docData = doc.data();
          Object.keys(docData).forEach((key) => {
            if (key !== 'Year' && typeof docData[key] === 'number') {
              const sexKey = key.toUpperCase();
              // Normalize sex keys (handle variations like "MALE", "Male", "FEMALE", "Female")
              const normalizedKey = sexKey.includes('MALE') ? 'MALE' : 
                                   sexKey.includes('FEMALE') ? 'FEMALE' : sexKey;
              const currentTotal = sexTotals.get(normalizedKey) || 0;
              sexTotals.set(normalizedKey, currentTotal + docData[key]);
            }
          });
        });

        // Calculate total emigrants for sex distribution
        const totalMale = sexTotals.get('MALE') || 0;
        const totalFemale = sexTotals.get('FEMALE') || 0;
        const totalSex = totalMale + totalFemale;

        // Calculate sex distribution percentages
        const malePercentage = totalSex > 0 ? totalMale / totalSex : 0.5;
        const femalePercentage = totalSex > 0 ? totalFemale / totalSex : 0.5;

        // Sort age groups for proper ordering
        const sortedAgeGroups = Array.from(ageGroups).sort((a, b) => {
          // Extract numeric values for sorting
          const getAgeValue = (ageStr: string) => {
            if (ageStr.includes('Below') || ageStr.includes('below')) return 0;
            const match = ageStr.match(/(\d+)/);
            return match ? parseInt(match[1]) : 999;
          };
          return getAgeValue(a) - getAgeValue(b);
        });

        // Create series for Male and Female
        const maleData: HeatmapDataPoint[] = sortedAgeGroups.map((ageGroup) => {
          const ageTotal = ageGroupTotals.get(ageGroup) || 0;
          // Proportionally allocate based on sex distribution
          const maleCount = Math.round(ageTotal * malePercentage);
          return { x: ageGroup, y: maleCount };
        });

        const femaleData: HeatmapDataPoint[] = sortedAgeGroups.map((ageGroup) => {
          const ageTotal = ageGroupTotals.get(ageGroup) || 0;
          // Proportionally allocate based on sex distribution
          const femaleCount = Math.round(ageTotal * femalePercentage);
          return { x: ageGroup, y: femaleCount };
        });

        setAgeSexData([
          { id: 'Male', data: maleData },
          { id: 'Female', data: femaleData },
        ]);
      } catch (err) {
        console.error('Error fetching age and sex data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchAgeSexData();
  }, []);

  // Use internal data if available, otherwise fall back to props
  const processedData = React.useMemo(() => {
    const dataToUse = ageSexData.length > 0 ? ageSexData : seriesArray;
    
    if (!dataToUse || dataToUse.length === 0) return null;

    // Aggregate data by x value for each series
    const aggregatedSeries = dataToUse.map(series => {
      const aggregated = new Map<string | number, number[]>();
      
      series.data.forEach(point => {
        const key = point.x;
        if (!aggregated.has(key)) {
          aggregated.set(key, []);
        }
        aggregated.get(key)!.push(point.y);
      });

      // Sum values for duplicate x values (shouldn't happen with our data, but just in case)
      const uniqueData = Array.from(aggregated.entries()).map(([x, yValues]) => ({
        x,
        y: yValues.reduce((sum, val) => sum + val, 0)
      }));

      return {
        ...series,
        data: uniqueData
      };
    });

    return aggregatedSeries;
  }, [ageSexData, seriesArray]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Loading age and sex data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (!processedData || processedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }

  // Extract all unique x values (age groups) and y series names (sex)
  const allXValues = Array.from(
    new Set(processedData.flatMap(series => series.data.map(d => String(d.x))))
  ).sort((a, b) => {
    // Sort age groups properly
    const getAgeValue = (ageStr: string) => {
      if (ageStr.includes('Below') || ageStr.includes('below')) return 0;
      const match = ageStr.match(/(\d+)/);
      return match ? parseInt(match[1]) : 999;
    };
    return getAgeValue(a) - getAgeValue(b);
  });

  const seriesNames = processedData.map(s => s.id);

  // Find min and max values for color scaling
  const allValues = processedData.flatMap(series => series.data.map(d => d.y));
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);

  // Create a color scale function
  const getColor = (value: number) => {
    if (maxValue === minValue) return 'rgb(100, 100, 100)';
    
    const normalized = (value - minValue) / (maxValue - minValue);
    
    // Color gradient: blue (low) -> yellow (medium) -> red (high)
    if (normalized < 0.5) {
      const ratio = normalized * 2;
      const r = Math.round(0 + ratio * 255);
      const g = Math.round(100 + ratio * 155);
      const b = Math.round(255 - ratio * 100);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      const ratio = (normalized - 0.5) * 2;
      const r = Math.round(255);
      const g = Math.round(255 - ratio * 100);
      const b = Math.round(155 - ratio * 155);
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  // Create a lookup map for quick access
  const dataMap = new Map<string, number>();
  processedData.forEach(series => {
    series.data.forEach(point => {
      const key = `${series.id}-${String(point.x)}`;
      dataMap.set(key, point.y);
    });
  });

  // Calculate cell dimensions
  const cellWidth = Math.max(60, Math.min(100, 800 / allXValues.length));
  const cellHeight = Math.max(40, Math.min(60, 400 / seriesNames.length));

  return (
    <div className="w-full h-full overflow-auto">
      <div className="min-w-max p-4">
        {/* Legend */}
        <div className="mb-4 flex items-center justify-center gap-2">
          <span className="text-gray-300 text-sm">Low</span>
          <div className="flex h-6 w-64 rounded">
            {Array.from({ length: 10 }).map((_, i) => {
              const value = minValue + (i / 9) * (maxValue - minValue);
              return (
                <div
                  key={i}
                  className="flex-1"
                  style={{ backgroundColor: getColor(value) }}
                />
              );
            })}
          </div>
          <span className="text-gray-300 text-sm">High</span>
        </div>

        {/* Heatmap Grid */}
        <div className="flex">
          {/* Y-axis labels */}
          <div className="flex flex-col justify-start pt-8">
            {seriesNames.map((name, idx) => (
              <div
                key={`y-label-${idx}`}
                className="text-right pr-3 text-sm text-gray-300 flex items-center"
                style={{ height: `${cellHeight}px` }}
              >
                {name}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div>
            {/* X-axis labels */}
            <div className="flex mb-1">
              {allXValues.map((xVal, idx) => (
                <div
                  key={`x-label-${idx}`}
                  className="text-center text-xs text-gray-300 px-1"
                  style={{ width: `${cellWidth}px` }}
                >
                  {xVal}
                </div>
              ))}
            </div>

            {/* Data cells */}
            {seriesNames.map((seriesName, seriesIdx) => (
              <div key={`row-${seriesIdx}`} className="flex">
                {allXValues.map((xVal, xIdx) => {
                  const key = `${seriesName}-${String(xVal)}`;
                  const value = dataMap.get(key);
                  const hasValue = value !== undefined;

                  return (
                    <div
                      key={`cell-${seriesIdx}-${xIdx}`}
                      className="border border-gray-700 flex items-center justify-center text-xs font-medium relative group"
                      style={{
                        width: `${cellWidth}px`,
                        height: `${cellHeight}px`,
                        backgroundColor: hasValue ? getColor(value) : '#1a1a1a',
                        color: hasValue && value > (maxValue - minValue) / 2 + minValue ? '#000' : '#fff'
                      }}
                    >
                      {hasValue && (
                        <>
                          {value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          {/* Tooltip */}
                          <div className="absolute hidden group-hover:block bg-gray-900 text-white text-xs rounded p-2 z-10 bottom-full mb-1 whitespace-nowrap border border-gray-700">
                            <div><strong>Sex: {seriesName}</strong></div>
                            <div>Age Group: {xVal}</div>
                            <div>Emigrants: {value.toLocaleString()}</div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Value range info */}
        <div className="mt-4 text-center text-sm text-gray-400">
          Range: {minValue.toLocaleString()} - {maxValue.toLocaleString()} emigrants
        </div>
      </div>
    </div>
  );
};

export default HeatmapChart;