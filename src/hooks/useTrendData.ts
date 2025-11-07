import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

interface TrendData {
  id: string;
  data: Array<{ x: string; y: number }>;
}

interface UseTrendDataReturn {
  countryTrends: TrendData[];
  ageGroupTrends: TrendData[];
  loading: boolean;
  error: string | null;
  countries: string[];
  ageGroups: string[];
}

export const useTrendData = (selectedCountry?: string): UseTrendDataReturn => {
  const [countryTrends, setCountryTrends] = useState<TrendData[]>([]);
  const [ageGroupTrends, setAgeGroupTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countries, setCountries] = useState<string[]>([]);
  const [ageGroups, setAgeGroups] = useState<string[]>([]);

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

        const destinationMap = new Map<string, Map<number, number>>();
        const ageMap = new Map<string, Map<number, number>>();
        const availableCountries = new Set<string>();
        const availableAgeGroups = new Set<string>();

        // Process destination data
        destinationSnapshot.docs.forEach((doc) => {
          const docData = doc.data();
          const year = docData.Year;

          Object.keys(docData).forEach((key) => {
            if (
              key !== "Year" &&
              typeof docData[key] === "number" &&
              docData[key] > 0
            ) {
              availableCountries.add(key);

              if (!destinationMap.has(key)) {
                destinationMap.set(key, new Map());
              }
              destinationMap.get(key)!.set(year, docData[key]);
            }
          });
        });

        // Process age data
        ageSnapshot.docs.forEach((doc) => {
          const docData = doc.data();
          const year = docData.Year;

          Object.keys(docData).forEach((key) => {
            if (
              key !== "Year" &&
              typeof docData[key] === "number" &&
              docData[key] > 0
            ) {
              availableAgeGroups.add(key);

              if (!ageMap.has(key)) {
                ageMap.set(key, new Map());
              }
              ageMap.get(key)!.set(year, docData[key]);
            }
          });
        });

        // Convert destination data to trend format
        const countryTrendArray: TrendData[] = [];
        destinationMap.forEach((yearData, country) => {
          if (!selectedCountry || country === selectedCountry) {
            const trendData = Array.from(yearData.entries())
              .sort(([a], [b]) => a - b)
              .map(([year, value]) => ({ x: year.toString(), y: value }));

            countryTrendArray.push({
              id: country,
              data: trendData,
            });
          }
        });

        // Convert age data to trend format
        const ageTrendArray: TrendData[] = [];
        ageMap.forEach((yearData, ageGroup) => {
          const trendData = Array.from(yearData.entries())
            .sort(([a], [b]) => a - b)
            .map(([year, value]) => ({ x: year.toString(), y: value }));

          ageTrendArray.push({
            id: ageGroup,
            data: trendData,
          });
        });

        setCountryTrends(
          countryTrendArray.sort(
            (a, b) =>
              b.data[b.data.length - 1]?.y - a.data[a.data.length - 1]?.y
          )
        );
        setAgeGroupTrends(
          ageTrendArray.sort(
            (a, b) =>
              b.data[b.data.length - 1]?.y - a.data[a.data.length - 1]?.y
          )
        );
        setCountries(Array.from(availableCountries).sort());
        setAgeGroups(Array.from(availableAgeGroups).sort());
      } catch (err) {
        console.error("Error fetching trend data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCountry]);

  return {
    countryTrends,
    ageGroupTrends,
    loading,
    error,
    countries,
    ageGroups,
  };
};
