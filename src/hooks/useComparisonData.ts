import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "../firebase";

interface ComparisonData {
  country: string;
  emigrants: number;
  year: number;
}

interface UseComparisonDataReturn {
  data: ComparisonData[];
  loading: boolean;
  error: string | null;
  years: number[];
}

export const useComparisonData = (
  selectedYear?: number
): UseComparisonDataReturn => {
  const [data, setData] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [years, setYears] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const destinationQuery = query(
          collection(db, "emigrantData/allDestination/years"),
          orderBy("Year")
        );
        const snapshot = await getDocs(destinationQuery);

        const allData: ComparisonData[] = [];
        const availableYears = new Set<number>();

        snapshot.docs.forEach((doc) => {
          const docData = doc.data();
          const year = docData.Year;
          availableYears.add(year);

          if (!selectedYear || year === selectedYear) {
            Object.keys(docData).forEach((key) => {
              if (
                key !== "Year" &&
                typeof docData[key] === "number" &&
                docData[key] > 0
              ) {
                allData.push({
                  country: key,
                  emigrants: docData[key],
                  year: year,
                });
              }
            });
          }
        });

        // Sort by emigrants count (descending) and take top 10
        const sortedData = allData
          .sort((a, b) => b.emigrants - a.emigrants)
          .slice(0, 10);

        setData(sortedData);
        setYears(Array.from(availableYears).sort());
      } catch (err) {
        console.error("Error fetching comparison data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

  return { data, loading, error, years };
};
