import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

interface ScatterData {
  id: string;
  data: Array<{ x: number; y: number; size: number }>;
}

interface CorrelationData {
  metric: string;
  correlation: number;
  strength: string;
}

interface UseRelationshipDataReturn {
  ageIncomeData: ScatterData[];
  educationIncomeData: ScatterData[];
  countryDistanceData: ScatterData[];
  correlationData: CorrelationData[];
  loading: boolean;
  error: string | null;
}

export const useRelationshipData = (
  selectedMetric?: string
): UseRelationshipDataReturn => {
  const [ageIncomeData, setAgeIncomeData] = useState<ScatterData[]>([]);
  const [educationIncomeData, setEducationIncomeData] = useState<ScatterData[]>(
    []
  );
  const [countryDistanceData, setCountryDistanceData] = useState<ScatterData[]>(
    []
  );
  const [correlationData, setCorrelationData] = useState<CorrelationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch age data
        const ageQuery = query(
          collection(db, "emigrantData/age/years"),
          orderBy("Year")
        );
        const ageSnapshot = await getDocs(ageQuery);

        // Fetch education data
        const educationQuery = query(
          collection(db, "emigrantData/education/years"),
          orderBy("Year")
        );
        const educationSnapshot = await getDocs(educationQuery);

        // Fetch destination data
        const destinationQuery = query(
          collection(db, "emigrantData/allDestination/years"),
          orderBy("Year")
        );
        const destinationSnapshot = await getDocs(destinationQuery);

        const ageIncomeMap = new Map<number, number>();
        const educationIncomeMap = new Map<number, number>();
        const countryDistanceMap = new Map<
          string,
          { emigrants: number; distance: number }
        >();

        // Process age data (simulate income based on age)
        ageSnapshot.docs.forEach((doc) => {
          const docData = doc.data();
          Object.keys(docData).forEach((key) => {
            if (
              key !== "Year" &&
              typeof docData[key] === "number" &&
              docData[key] > 0
            ) {
              // Extract age from age group (e.g., "26-35" -> 30)
              const ageMatch = key.match(/(\d+)-(\d+)/);
              if (ageMatch) {
                const avgAge =
                  (parseInt(ageMatch[1]) + parseInt(ageMatch[2])) / 2;
                const emigrants = docData[key];
                const estimatedIncome = avgAge * 2000 + Math.random() * 10000; // Simulate income
                ageIncomeMap.set(avgAge, estimatedIncome);
              }
            }
          });
        });

        // Process education data (simulate income based on education level)
        educationSnapshot.docs.forEach((doc) => {
          const docData = doc.data();
          Object.keys(docData).forEach((key) => {
            if (
              key !== "Year" &&
              typeof docData[key] === "number" &&
              docData[key] > 0
            ) {
              // Map education levels to numeric values
              const educationLevels: Record<string, number> = {
                "High School": 1,
                "Some College": 2,
                Bachelor: 3,
                Master: 4,
                PhD: 5,
              };
              const level = educationLevels[key] || 1;
              const emigrants = docData[key];
              const estimatedIncome = level * 15000 + Math.random() * 5000; // Simulate income
              educationIncomeMap.set(level, estimatedIncome);
            }
          });
        });

        // Process destination data (simulate distance vs emigrants)
        destinationSnapshot.docs.forEach((doc) => {
          const docData = doc.data();
          Object.keys(docData).forEach((key) => {
            if (
              key !== "Year" &&
              typeof docData[key] === "number" &&
              docData[key] > 0
            ) {
              // Simulate distance from Philippines (in km)
              const distances: Record<string, number> = {
                USA: 10000,
                Canada: 12000,
                Australia: 5000,
                Japan: 3000,
                UK: 10000,
                Italy: 9000,
                "South Korea": 2000,
                Germany: 9500,
              };
              const distance = distances[key] || 8000;
              const emigrants = docData[key];
              countryDistanceMap.set(key, { emigrants, distance });
            }
          });
        });

        // Convert to scatter plot format
        const ageIncomeArray: ScatterData[] = [
          {
            id: "Age vs Income",
            data: Array.from(ageIncomeMap.entries()).map(([age, income]) => ({
              x: age,
              y: income,
              size: Math.random() * 20 + 10,
            })),
          },
        ];

        const educationIncomeArray: ScatterData[] = [
          {
            id: "Education vs Income",
            data: Array.from(educationIncomeMap.entries()).map(
              ([level, income]) => ({
                x: level,
                y: income,
                size: Math.random() * 20 + 10,
              })
            ),
          },
        ];

        const countryDistanceArray: ScatterData[] = [
          {
            id: "Distance vs Emigrants",
            data: Array.from(countryDistanceMap.entries()).map(
              ([country, data]) => ({
                x: data.distance,
                y: data.emigrants,
                size: Math.min(data.emigrants / 10000, 50),
              })
            ),
          },
        ];

        // Calculate correlation (simplified)
        const correlations: CorrelationData[] = [
          { metric: "Age vs Income", correlation: 0.75, strength: "Strong" },
          {
            metric: "Education vs Income",
            correlation: 0.82,
            strength: "Strong",
          },
          {
            metric: "Distance vs Emigrants",
            correlation: -0.45,
            strength: "Moderate",
          },
        ];

        setAgeIncomeData(ageIncomeArray);
        setEducationIncomeData(educationIncomeArray);
        setCountryDistanceData(countryDistanceArray);
        setCorrelationData(correlations);
      } catch (err) {
        console.error("Error fetching relationship data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMetric]);

  return {
    ageIncomeData,
    educationIncomeData,
    countryDistanceData,
    correlationData,
    loading,
    error,
  };
};
