import { useState, useEffect } from "react";

interface IraqCity {
  name: string;
  latitude: number;
  longitude: number;
  population: number;
}

export function useIraqCities() {
  const [cities, setCities] = useState<IraqCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://countries.dev/cities?country=IQ&limit=50")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load cities");
        return res.json();
      })
      .then((data: any[]) => {
        const mapped: IraqCity[] = data
          .map((c) => ({
            name: c.name,
            latitude: c.latitude,
            longitude: c.longitude,
            population: c.population ?? 0,
          }))
          .sort((a, b) => b.population - a.population);
        setCities(mapped);
      })
      .catch(() => setError("Could not load city list. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  return { cities, loading, error };
}
