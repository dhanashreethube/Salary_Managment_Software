import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LogOut, LayoutDashboard, TableProperties, ShieldAlert, KeyRound, User, Lock } from "lucide-react";
import Dashboard from "./components/Dashboard";
import Directory from "./components/Directory";
import SalaryModal from "./components/SalaryModal";

export default function App() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" or "directory"
  
  // Filtering and pagination states for Directory
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [department, setDepartment] = useState("");
  
  // Selected employee for the modification modal
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Authentication credentials state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // 1. Fetch authenticated session status
  const { data: sessionData, isLoading: isSessionLoading, isError: isSessionError } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error("Unauthenticated");
      return res.json();
    },
    retry: false, // Don't retry on auth failures
  });

  const isAuthenticated = sessionData && sessionData.user;

  // 2. Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      setLoginError("");
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["session"]);
    },
    onError: (err) => {
      setLoginError(err.message);
    },
  });

  // 3. Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(["session"], null);
      queryClient.clear(); // Clear all cached data on logout
    },
  });

  // 4. Fetch metrics data (enabled only when authenticated and tab is dashboard)
  const { data: metrics, isLoading: isMetricsLoading } = useQuery({
    queryKey: ["metrics"],
    queryFn: async () => {
      const res = await fetch("/api/metrics");
      if (!res.ok) throw new Error("Failed to fetch dashboard metrics");
      return res.json();
    },
    enabled: !!isAuthenticated && activeTab === "dashboard",
  });

  // 5. Fetch employees directory (enabled only when authenticated and tab is directory)
  const { data: directoryData, isLoading: isDirectoryLoading, isFetching: isDirectoryFetching } = useQuery({
    queryKey: ["employees", page, search, country, department],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        search,
        country,
        department,
      });
      const res = await fetch(`/api/employees?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch directory indexes");
      return res.json();
    },
    enabled: !!isAuthenticated && activeTab === "directory",
  });

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate({ username: loginUsername, password: loginPassword });
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // If session is checking on startup, render a minimal beautiful loader
  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-400">Loading secure environment...</span>
        </div>
      </div>
    );
  }

  // --- UNAUTHENTICATED LOGIN VIEW ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070b13] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Abstract background glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />

        <div className="w-full max-w-md glass-panel rounded-3xl p-8 relative z-10 space-y-8 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <KeyRound size={24} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-4">HR Manager Access</h1>
            <p className="text-xs text-slate-400">Sign in to administer global compensations</p>
          </div>

          {/* Login Error notification */}
          {loginError && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex gap-2.5 items-start text-xs text-rose-400 font-semibold animate-shake">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                  placeholder="admin"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loginMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Authenticate Session"
              )}
            </button>
          </form>

          <div className="pt-6 border-t border-white/5 text-center">
            <span className="text-slate-600 text-xs">Standard configuration credentials are pre-seeded</span>
          </div>
        </div>
      </div>
    );
  }

  // --- AUTHENTICATED DASHBOARD APPLICATION ---
  return (
    <div className="min-h-screen bg-[#070b13] flex flex-col font-sans relative overflow-hidden">
      {/* Abstract background glows */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-600/5 rounded-full blur-3xl -mr-60 -mt-60" />
      <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-violet-600/5 rounded-full blur-3xl -ml-60 -mb-60" />

      {/* Top bar header */}
      <header className="glass-panel border-x-0 border-t-0 border-b border-white/5 py-4 px-6 md:px-8 relative z-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-base tracking-wider shadow-md shadow-indigo-500/30">
            Ω
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">Onion Salary</h1>
            <span className="text-2xs text-indigo-400 font-mono tracking-widest uppercase">Console v1.0</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-slate-900/50 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-medium">
            <User size={12} className="text-slate-400" />
            <span>Admin Control Panel</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl text-xs font-semibold transition-all border border-rose-500/20"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Primary Layout Body */}
      <div className="flex flex-1 flex-col lg:flex-row relative z-10">
        {/* Navigation Sidebar Panel */}
        <aside className="w-full lg:w-64 glass-panel border-y-0 border-l-0 border-r border-white/5 p-4 lg:p-6 space-y-2 lg:space-y-3 flex flex-row lg:flex-col items-center lg:items-stretch justify-around lg:justify-start shrink-0">
          <span className="hidden lg:block text-2xs text-slate-500 font-bold uppercase tracking-wider mb-2">
            Navigation
          </span>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "dashboard"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard Aggregates</span>
          </button>

          <button
            onClick={() => setActiveTab("directory")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "directory"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <TableProperties size={18} />
            <span>Employee Directory</span>
          </button>
        </aside>

        {/* Content Workspace Panel */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === "dashboard" ? (
            <Dashboard metrics={metrics} isLoading={isMetricsLoading} />
          ) : (
            <Directory
              employees={directoryData?.employees || []}
              total={directoryData?.total || 0}
              page={page}
              setPage={setPage}
              search={search}
              setSearch={setSearch}
              country={country}
              setCountry={setCountry}
              department={department}
              setDepartment={setDepartment}
              isLoading={isDirectoryLoading}
              isFetching={isDirectoryFetching}
              onEditClick={(emp) => setSelectedEmployee(emp)}
              refetch={() => queryClient.invalidateQueries(["employees"])}
            />
          )}
        </main>
      </div>

      {/* Salary Adjustment Modal Layer */}
      {selectedEmployee && (
        <SalaryModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </div>
  );
}
