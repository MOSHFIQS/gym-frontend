"use client";

import { useEffect, useState, useRef } from "react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Search,
  UserPlus,
  Trash2,
  X,
  User,
  Shield,
  ChevronLeft,
  ChevronRight,
  Mail,
  Lock,
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  isActive: boolean;
  createdAt: string;
  member?: {
    id: string;
    fullName: string;
    status: string;
    membershipPlan: string;
  } | null;
}

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const adminCreateSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AdminCreateValues = z.infer<typeof adminCreateSchema>;

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Page query parameters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [page, setPage] = useState(1);

  // Create Admin modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Search debouncer (400ms)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [search]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminCreateValues>({
    resolver: zodResolver(adminCreateSchema),
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", "10");
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (roleFilter) params.append("role", roleFilter);
      if (activeFilter) params.append("isActive", activeFilter);

      const res = await apiClient.get(`/admin/users?${params.toString()}`);
      if (res.data?.success) {
        setUsers(res.data.data);
        setMeta(res.data.meta);
      }
    } catch (err) {
      toast.error("Failed to load users list");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, debouncedSearch, roleFilter, activeFilter]);

  const handleRoleChange = async (userId: string, newRole: "ADMIN" | "MEMBER") => {
    if (userId === currentUser?.id) {
      toast.error("You cannot change your own role!");
      return;
    }

    try {
      const res = await apiClient.patch(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data?.success) {
        toast.success("User role updated successfully!");
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update role");
    }
  };

  const handleToggleActive = async (userId: string) => {
    if (userId === currentUser?.id) {
      toast.error("You cannot deactivate your own account!");
      return;
    }

    try {
      const res = await apiClient.patch(`/admin/users/${userId}/toggle-active`);
      if (res.data?.success) {
        toast.success(res.data.message || "Status toggled successfully");
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle status");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      toast.error("You cannot delete your own account!");
      return;
    }

    if (!window.confirm("Are you sure you want to permanently delete this user? All associated details will be lost.")) return;

    try {
      const res = await apiClient.delete(`/admin/users/${userId}`);
      if (res.data?.success) {
        toast.success("User deleted successfully!");
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    }
  };

  const onCreateAdminSubmit = async (values: AdminCreateValues) => {
    setIsCreatingAdmin(true);
    try {
      const res = await apiClient.post("/admin/users", values);
      if (res.data?.success) {
        toast.success("New admin user created successfully!");
        setIsModalOpen(false);
        reset();
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create admin user");
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">System Users</h1>
          <p className="text-sm text-secondary-text mt-1">
            Manage authentication records, change roles, toggle access, or register administrators.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-accent/15 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Create Admin User
        </button>
      </div>

      {/* Query Filters */}
      <div className="glass border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-md">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-white/40">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 focus:border-accent rounded-xl py-2 px-9 text-white text-xs outline-none transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-xs outline-none cursor-pointer focus:border-accent"
          >
            <option value="" className="bg-neutral-900">All Roles</option>
            <option value="ADMIN" className="bg-neutral-900">Admin</option>
            <option value="MEMBER" className="bg-neutral-900">Member</option>
          </select>

          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setPage(1);
            }}
            className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-xs outline-none cursor-pointer focus:border-accent"
          >
            <option value="" className="bg-neutral-900">All Active States</option>
            <option value="true" className="bg-neutral-900">Active</option>
            <option value="false" className="bg-neutral-900">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass border border-white/10 rounded-3xl p-6 shadow-xl relative">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-secondary-text text-sm">
            No system users found matching criteria.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-xs text-secondary-text uppercase tracking-wider">
                    <th className="pb-3 pr-4">User Email</th>
                    <th className="pb-3 px-4">Associated Member Name</th>
                    <th className="pb-3 px-4">System Role</th>
                    <th className="pb-3 px-4">Active Toggle</th>
                    <th className="pb-3 px-4">Registered Date</th>
                    <th className="pb-3 pl-4 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 pr-4">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-white/40" />
                          {user.email}
                          {user.id === currentUser?.id && (
                            <span className="text-[9px] font-bold bg-white/10 px-1.5 py-0.5 rounded text-white/60">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs font-semibold text-white/80">
                        {user.member ? (
                          <div className="flex items-center gap-2">
                            <span className="text-accent">{user.member.fullName}</span>
                            <span className="text-[10px] text-white/40 font-mono">({user.member.membershipPlan})</span>
                          </div>
                        ) : (
                          <span className="text-white/30 italic">No Member Profile</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {user.id === currentUser?.id ? (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-accent/20 text-accent border border-accent/20 flex items-center gap-1 w-max">
                            <Shield className="w-3.5 h-3.5" /> {user.role}
                          </span>
                        ) : (
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as "ADMIN" | "MEMBER")}
                            className="bg-white/5 border border-white/10 rounded-xl py-1.5 px-3 text-white text-xs outline-none cursor-pointer focus:border-accent"
                          >
                            <option value="MEMBER" className="bg-neutral-900">MEMBER</option>
                            <option value="ADMIN" className="bg-neutral-900">ADMIN</option>
                          </select>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleToggleActive(user.id)}
                          disabled={user.id === currentUser?.id}
                          className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                            user.isActive ? "bg-green-500" : "bg-neutral-700"
                          } disabled:opacity-30 disabled:cursor-not-allowed`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
                              user.isActive ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="py-4 px-4 text-xs text-secondary-text">
                        {new Date(user.createdAt).toLocaleDateString(undefined, {
                          dateStyle: "medium",
                        })}
                      </td>
                      <td className="py-4 pl-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.id === currentUser?.id}
                          className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:text-white hover:bg-red-500 rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-red-500/10 disabled:hover:text-red-400 cursor-pointer disabled:cursor-not-allowed"
                          title="Delete User"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <span className="text-xs text-secondary-text">
                  Showing page {meta.page} of {meta.totalPages} ({meta.total} total users)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                    className="p-2 border border-white/10 rounded-xl bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page >= meta.totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="p-2 border border-white/10 rounded-xl bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative animate-fade-in text-white">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-bold mb-1 flex items-center gap-2 border-b border-white/10 pb-3">
              <User className="w-5 h-5 text-accent" /> Create Admin User
            </h3>

            <p className="text-xs text-secondary-text mb-5 leading-relaxed">
              Create a new administrator credential. Administrative users have permissions to manage all settings, approve payments, and update role rules.
            </p>

            <form onSubmit={handleSubmit(onCreateAdminSubmit)} className="space-y-4">
              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/80">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/40">
                    <Mail className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="email"
                    placeholder="admin@fitness.com"
                    className="w-full bg-white/5 border border-white/10 focus:border-accent rounded-xl py-3 pl-11 pr-4 text-white text-sm outline-none transition-all"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-accent mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/80">Secret Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/40">
                    <Lock className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 focus:border-accent rounded-xl py-3 pl-11 pr-4 text-white text-sm outline-none transition-all"
                    {...register("password")}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-accent mt-1">{errors.password.message}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isCreatingAdmin}
                  className="flex-1 border border-white/15 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-semibold text-sm cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingAdmin}
                  className="flex-1 bg-accent hover:bg-accent-hover text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-accent/20 cursor-pointer disabled:opacity-50"
                >
                  {isCreatingAdmin ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
