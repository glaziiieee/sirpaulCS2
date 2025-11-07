import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

interface CompositionData {
  id: string;
  label: string;
  value: number;
  color: string;
}

interface UseCompositionDataReturn {
  destinationData: CompositionData[];
  ageGroupData: CompositionData[];
  civilStatusData: CompositionData[];
  loading: boolean;
  error: string | null;
  years: number[];
}

export const useCompositionData = (
  selectedYear?: number
): UseCompositionDataReturn => {
  const [destinationData, setDestinationData] = useState<CompositionData[]>([]);
  const [ageGroupData, setAgeGroupData] = useState<CompositionData[]>([]);
  const [civilStatusData, setCivilStatusData] = useState<CompositionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [years, setYears] = useState<number[]>([]);

  const colors = [
    "hsl(0, 70%, 50%)",
    "hsl(30, 70%, 50%)",
    "hsl(60, 70%, 50%)",
    "hsl(90, 70%, 50%)",
    "hsl(120, 70%, 50%)",
    "hsl(150, 70%, 50%)",
    "hsl(180, 70%, 50%)",
    "hsl(210, 70%, 50%)",
    "hsl(240, 70%, 50%)",
    "hsl(270, 70%, 50%)",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch destination data
        const destinationQuery = query(
          collection(db, "emigrantData/allDestination/years"),
          orderBy("Year")
        );
        const destinationSnapshot = await getDocs(destinationQuery);

        // Fetch age data
        const ageQuery = query(
          collection(db, "emigrantData/age/years"),
          orderBy("Year")
        );
        const ageSnapshot = await getDocs(ageQuery);

        // Fetch civil status data
        const civilStatusQuery = query(
          collection(db, "emigrantData/civilStatus/years"),
          orderBy("Year")
        );
        const civilStatusSnapshot = await getDocs(civilStatusQuery);

        const availableYears = new Set<number>();
        const destinationMap = new Map<string, number>();
        const ageMap = new Map<string, number>();
        const civilStatusMap = new Map<string, number>();

        // Process destination data
        destinationSnapshot.docs.forEach((doc) => {
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
                const currentValue = destinationMap.get(key) || 0;
                destinationMap.set(key, currentValue + docData[key]);
              }
            });
          }
        });

        // Process age data
        ageSnapshot.docs.forEach((doc) => {
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
                const currentValue = ageMap.get(key) || 0;
                ageMap.set(key, currentValue + docData[key]);
              }
            });
          }
        });

        // Process civil status data
        civilStatusSnapshot.docs.forEach((doc) => {
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
                const currentValue = civilStatusMap.get(key) || 0;
                civilStatusMap.set(key, currentValue + docData[key]);
              }
            });
          }
        });

        // Convert destination data to chart format
        const destinationArray = Array.from(destinationMap.entries())
          .map(([country, value], index) => ({
            id: country,
            label: country,
            value: value,
            color: colors[index % colors.length],
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 8); // Top 8 countries

        // Convert age data to chart format
        const ageArray = Array.from(ageMap.entries())
          .map(([ageGroup, value], index) => ({
            id: ageGroup,
            label: ageGroup,
            value: value,
            color: colors[index % colors.length],
          }))
          .sort((a, b) => b.value - a.value);

        // Convert civil status data to chart format
        const civilStatusArray = Array.from(civilStatusMap.entries())
          .map(([status, value], index) => ({
            id: status,
            label: status,
            value: value,
            color: colors[index % colors.length],
          }))
          .sort((a, b) => b.value - a.value);

        setDestinationData(destinationArray);
        setAgeGroupData(ageArray);
        setCivilStatusData(civilStatusArray);
        setYears(Array.from(availableYears).sort());
      } catch (err) {
        console.error("Error fetching composition data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

  return {
    destinationData,
    ageGroupData,
    civilStatusData,
    loading,
    error,
    years,
  };
};
