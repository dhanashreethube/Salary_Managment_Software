import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "../../utils/formatters.js";

/**
 * Custom hook to execute and format global metrics data.
 */
export function useDashboardMetrics() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["metrics"],
    queryFn: async () => {
      const res = await fetch("/api/metrics");
      if (!res.ok) throw new Error("Failed to fetch dashboard metrics");
      return res.json();
    },
    // The query will execute automatically when this component mounts
    // (which only happens when authenticated and on the dashboard tab).
    refetchOnWindowFocus: false,
  });

  return {
    metrics,
    isLoading,
    formatCurrency,
  };
}
