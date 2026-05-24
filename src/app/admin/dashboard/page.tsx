"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import {
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  UserPlus,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

interface DashboardStats {
  members: {
    total: number;
    active: number;
    inactive: number;
    pending: number;
  };
  payments: {
    pending: number;
    approved: number;
    rejected: number;
  };
  revenue: {
    total: number;
    monthly: Array<{
      createdAt: string;
      _sum: {
        amount: number;
      };
    }>;
  };
  recentRegistrations: Array<{
    id: string;
    fullName: string;
    email: string;
    membershipPlan: string;
    status: "PENDING" | "ACTIVE" | "INACTIVE";
    createdAt: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/admin/dashboard");
      if (res.data?.success && res.data?.data) {
        setStats(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to load admin stats");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getStatusBadge = (status: "PENDING" | "ACTIVE" | "INACTIVE") => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-500/15 text-green-400 border border-green-500/10">
            Active
          </span>
        );
      case "PENDING":
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-500/15 text-yellow-400 border border-yellow-500/10">
            Pending
          </span>
        );
      case "INACTIVE":
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/10">
            Inactive
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-10 space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-white/5 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-80 bg-white/5 rounded-2xl animate-pulse" />
          <div className="h-80 bg-white/5 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Admin Overview</h1>
          <p className="text-sm text-secondary-text mt-1">
            Realtime stats, member metrics, and revenue details.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="self-start flex items-center gap-2 border border-white/10 hover:bg-white/5 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Stats
        </button>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div className="space-y-1.5">
            <span className="text-xs text-secondary-text font-semibold uppercase tracking-wider">Total Members</span>
            <p className="text-3xl font-black text-white">{stats.members.total}</p>
          </div>
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="glass border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div className="space-y-1.5">
            <span className="text-xs text-secondary-text font-semibold uppercase tracking-wider">Active Members</span>
            <p className="text-3xl font-black text-green-400">{stats.members.active}</p>
          </div>
          <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="glass border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div className="space-y-1.5">
            <span className="text-xs text-secondary-text font-semibold uppercase tracking-wider">Pending Approvals</span>
            <p className="text-3xl font-black text-yellow-400">{stats.members.pending}</p>
          </div>
          <div className="w-12 h-12 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="glass border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div className="space-y-1.5">
            <span className="text-xs text-secondary-text font-semibold uppercase tracking-wider">Total Revenue</span>
            <p className="text-3xl font-black text-accent">${stats.revenue.total}</p>
          </div>
          <div className="w-12 h-12 bg-accent/15 border border-accent/20 text-accent rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Payment Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass border border-white/5 bg-white/[0.02] rounded-2xl p-5 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <span className="text-xs text-secondary-text font-medium">Pending Payments</span>
            <p className="text-2xl font-bold text-yellow-400">{stats.payments.pending}</p>
          </div>
          <Clock className="w-5 h-5 text-yellow-400/60" />
        </div>
        <div className="glass border border-white/5 bg-white/[0.02] rounded-2xl p-5 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <span className="text-xs text-secondary-text font-medium">Approved Payments</span>
            <p className="text-2xl font-bold text-green-400">{stats.payments.approved}</p>
          </div>
          <CheckCircle className="w-5 h-5 text-green-400/60" />
        </div>
        <div className="glass border border-white/5 bg-white/[0.02] rounded-2xl p-5 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <span className="text-xs text-secondary-text font-medium">Rejected Payments</span>
            <p className="text-2xl font-bold text-red-400">{stats.payments.rejected}</p>
          </div>
          <XCircle className="w-5 h-5 text-red-400/60" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Registrations Table */}
        <div className="lg:col-span-2 glass border border-white/10 rounded-3xl p-6 shadow-xl">
          <h3 className="text-lg font-bold mb-1 flex items-center gap-2 border-b border-white/10 pb-4">
            <UserPlus className="w-5 h-5 text-accent" /> Recent Registrations
          </h3>
          {stats.recentRegistrations.length === 0 ? (
            <div className="text-center py-12 text-secondary-text text-sm">
              No recent member registrations.
            </div>
          ) : (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-xs text-secondary-text uppercase tracking-wider">
                    <th className="pb-3 pr-4">Member Name</th>
                    <th className="pb-3 px-4">Selected Plan</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 pl-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {stats.recentRegistrations.map((member) => (
                    <tr key={member.id} className="hover:text-white transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="font-semibold">{member.fullName}</div>
                        <div className="text-xs text-secondary-text">{member.email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-accent">{member.membershipPlan}</td>
                      <td className="py-3.5 px-4">{getStatusBadge(member.status)}</td>
                      <td className="py-3.5 pl-4 text-xs text-secondary-text">
                        {new Date(member.createdAt).toLocaleDateString(undefined, {
                          dateStyle: "medium",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Revenue chart */}
        <div className="glass border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2 border-b border-white/10 pb-4">
              <TrendingUp className="w-5 h-5 text-accent" /> Financial Health
            </h3>
            <p className="text-xs text-secondary-text mt-3">
              Summary of cash flow received through membership purchases.
            </p>

            <div className="w-full h-44 mt-6 relative flex items-end">
              {stats.revenue.monthly.length > 0 ? (
                <div className="w-full flex items-end justify-between h-36 px-2 border-b border-white/10">
                  {stats.revenue.monthly.map((month, idx) => {
                    const amount = month._sum.amount || 0;
                    const maxAmount = Math.max(...stats.revenue.monthly.map(m => m._sum.amount || 1));
                    const percentage = (amount / maxAmount) * 100;
                    const monthName = new Date(month.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                    });

                    return (
                      <div key={idx} className="flex flex-col items-center flex-1 group">
                        <div className="text-[10px] text-accent font-bold opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-mono">
                          ${amount}
                        </div>
                        <div
                          style={{ height: `${Math.max(percentage, 5)}%` }}
                          className="w-4 bg-accent hover:bg-accent-hover rounded-t-sm transition-all duration-500 shadow-md shadow-accent/10"
                        />
                        <span className="text-[10px] text-secondary-text mt-2 font-semibold">
                          {monthName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="w-full text-center text-xs text-secondary-text py-12">
                  No monthly analytics found.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mt-6">
            <span className="text-xs text-secondary-text block">Revenue Efficiency</span>
            <span className="text-sm font-extrabold text-white">100% Verified Cash</span>
            <p className="text-[10px] text-secondary-text mt-0.5">
              All dashboard earnings correspond to APPROVED payment verifications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
