import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, toBaseUnit } from "../../utils/formatters.js";

/**
 * Custom React hook containing all active state variables and TanStack Query logic
 * for the Employee Directory view. Includes 300ms search query debouncing,
 * server-side sorting, and dynamic page size controls.
 */
export function useDirectoryLogic() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [country, setCountry] = useState("");
  const [department, setDepartment] = useState("");
  const [sortBy, setSortBy] = useState("employeeId");
  const [sortOrder, setSortOrder] = useState("asc");
  const [limit, setLimit] = useState(20);

  // 300ms Debouncer for the search input term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page to 1 on new search terms
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // Execute the query only when states change
  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ["employees", page, limit, debouncedSearch, country, department, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: debouncedSearch,
        country,
        department,
        sortBy,
        sortOrder,
      });
      const res = await fetch(`/api/employees?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch directory indexes");
      return res.json();
    },
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

  const employees = data?.employees || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handleReset = () => {
    setSearch("");
    setDebouncedSearch("");
    setCountry("");
    setDepartment("");
    setSortBy("employeeId");
    setSortOrder("asc");
    setLimit(20);
    setPage(1);
  };

  const handleCountryChange = (newCountry) => {
    setCountry(newCountry);
    setPage(1);
  };

  const handleDepartmentChange = (newDept) => {
    setDepartment(newDept);
    setPage(1);
  };

  /**
   * Toggle sort: if clicking the same column, flip order; otherwise set new column asc.
   */
  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(columnKey);
      setSortOrder("asc");
    }
    setPage(1);
  };

  /**
   * Change the number of rows per page and reset to page 1.
   */
  const handleLimitChange = (newLimit) => {
    setLimit(parseInt(newLimit) || 20);
    setPage(1);
  };

  // Directory format helper converts cents/pence/paise (toBaseUnit) to decimals and formats it
  const formatEmployeeCurrency = (value, currency) => {
    return formatCurrency(toBaseUnit(value), currency);
  };

  return {
    employees,
    total,
    page,
    totalPages,
    limit,
    search,
    setSearch,
    country,
    handleCountryChange,
    department,
    handleDepartmentChange,
    sortBy,
    sortOrder,
    handleSort,
    handleLimitChange,
    isLoading,
    isFetching,
    isError,
    error,
    handlePrevPage,
    handleNextPage,
    handleReset,
    formatCurrency: formatEmployeeCurrency,
  };
}
