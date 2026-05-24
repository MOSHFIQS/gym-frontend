"use client";

import { useEffect, useState, useRef } from "react";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";
import {
  Search,
  Filter,
  Eye,
  Check,
  Trash2,
  X,
  CreditCard,
  Phone,
  Mail,
  User,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Member {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth: string;
  address: string;
  membershipPlan: "MONTHLY" | "QUARTERLY" | "HALF_YEARLY" | "YEARLY";
  joiningDate: string;
  emergencyContact: string;
  profileImage: string | null;
  status: "PENDING" | "ACTIVE" | "INACTIVE";
  createdAt: string;
}

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters and Query parameters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [plan, setPlan] = useState("");
  const [gender, setGender] = useState("");
  const [page, setPage] = useState(1);

  // Detail view state
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Debouncing timeout reference
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Search input debouncer (400ms)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on search
    }, 400);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [search]);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", "10");
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (status) params.append("status", status);
      if (plan) params.append("membershipPlan", plan);
      if (gender) params.append("gender", gender);

      const response = await apiClient.get(`/members?${params.toString()}`);
      if (response.data?.success) {
        setMembers(response.data.data);
        setMeta(response.data.meta);
      }
    } catch (err) {
      toast.error("Failed to load members list");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [page, debouncedSearch, status, plan, gender]);

  const handleApprove = async (memberId: string) => {
    try {
      const res = await apiClient.patch(`/admin/members/${memberId}/approve`);
      if (res.data?.success) {
        toast.success("Member approved successfully!");
        fetchMembers();
        if (selectedMember && selectedMember.id === memberId) {
          handleViewDetails(memberId); // Refresh details view if open
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to approve member");
    }
  };

  const handleDelete = async (memberId: string) => {
    if (!window.confirm("Are you absolutely sure you want to delete this member profile?")) return;

    try {
      const res = await apiClient.delete(`/members/${memberId}`);
      if (res.data?.success) {
        toast.success("Member deleted successfully!");
        fetchMembers();
        if (selectedMember && selectedMember.id === memberId) {
          setIsDetailOpen(false);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete member");
    }
  };

  const handleViewDetails = async (memberId: string) => {
    setIsLoadingDetail(true);
    setIsDetailOpen(true);
    try {
      const res = await apiClient.get(`/members/${memberId}`);
      if (res.data?.success && res.data?.data) {
        setSelectedMember(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to load member profile details");
      setIsDetailOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const getStatusBadge = (status: "PENDING" | "ACTIVE" | "INACTIVE") => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/15 text-green-400 border border-green-500/10">
            Active
          </span>
        );
      case "PENDING":
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/15 text-yellow-400 border border-yellow-500/10">
            Pending
          </span>
        );
      case "INACTIVE":
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/10">
            Inactive
          </span>
        );
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Members Registry</h1>
        <p className="text-sm text-secondary-text mt-1">
          Review, approve, and manage registered gym members.
        </p>
      </div>

      {/* Search and Filters Header */}
      <div className="glass border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-md">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-white/40">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by name, email, phone..."
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
          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-xs outline-none cursor-pointer focus:border-accent"
          >
            <option value="" className="bg-neutral-900">All Statuses</option>
            <option value="ACTIVE" className="bg-neutral-900">Active</option>
            <option value="PENDING" className="bg-neutral-900">Pending</option>
            <option value="INACTIVE" className="bg-neutral-900">Inactive</option>
          </select>

          {/* Plan Filter */}
          <select
            value={plan}
            onChange={(e) => {
              setPlan(e.target.value);
              setPage(1);
            }}
            className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-xs outline-none cursor-pointer focus:border-accent"
          >
            <option value="" className="bg-neutral-900">All Plans</option>
            <option value="MONTHLY" className="bg-neutral-900">Monthly</option>
            <option value="QUARTERLY" className="bg-neutral-900">Quarterly</option>
            <option value="HALF_YEARLY" className="bg-neutral-900">Half Yearly</option>
            <option value="YEARLY" className="bg-neutral-900">Yearly</option>
          </select>

          {/* Gender Filter */}
          <select
            value={gender}
            onChange={(e) => {
              setGender(e.target.value);
              setPage(1);
            }}
            className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-xs outline-none cursor-pointer focus:border-accent"
          >
            <option value="" className="bg-neutral-900">All Genders</option>
            <option value="MALE" className="bg-neutral-900">Male</option>
            <option value="FEMALE" className="bg-neutral-900">Female</option>
            <option value="OTHER" className="bg-neutral-900">Other</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="glass border border-white/10 rounded-3xl p-6 shadow-xl relative">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-16 text-secondary-text text-sm">
            No gym members found matching criteria.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-xs text-secondary-text uppercase tracking-wider">
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 px-4">Contact Info</th>
                    <th className="pb-3 px-4">Membership Plan</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 px-4">Joined Date</th>
                    <th className="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          {member.profileImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={member.profileImage}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 shrink-0">
                              <User className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-white">{member.fullName}</div>
                            <div className="text-xs text-secondary-text capitalize">{member.gender.toLowerCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs">
                        <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-white/40" /> {member.email}</div>
                        <div className="flex items-center gap-1.5 mt-1 font-mono text-white/60"><Phone className="w-3.5 h-3.5 text-white/40" /> {member.phone}</div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-accent">{member.membershipPlan}</td>
                      <td className="py-4 px-4">{getStatusBadge(member.status)}</td>
                      <td className="py-4 px-4 text-xs text-secondary-text">
                        {new Date(member.joiningDate).toLocaleDateString(undefined, {
                          dateStyle: "medium",
                        })}
                      </td>
                      <td className="py-4 pl-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(member.id)}
                            className="p-2 bg-white/5 border border-white/10 text-white/80 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {member.status === "PENDING" && (
                            <button
                              onClick={() => handleApprove(member.id)}
                              className="p-2 bg-green-500/10 border border-green-500/20 text-green-400 hover:text-white hover:bg-green-500 rounded-lg transition-all cursor-pointer"
                              title="Approve Member"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(member.id)}
                            className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:text-white hover:bg-red-500 rounded-lg transition-all cursor-pointer"
                            title="Delete Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
                  Showing page {meta.page} of {meta.totalPages} ({meta.total} total members)
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

      {/* Member Details Drawer Modal */}
      {isDetailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm p-4">
          {/* Backdrop trigger close */}
          <div className="fixed inset-0" onClick={() => setIsDetailOpen(false)} />

          <div className="w-full max-w-lg bg-neutral-900 border-l border-white/10 h-full p-6 shadow-2xl relative z-10 flex flex-col justify-between overflow-y-auto animate-slide-right text-white">
            <button
              onClick={() => setIsDetailOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {isLoadingDetail || !selectedMember ? (
              <div className="flex-1 flex flex-col justify-center items-center space-y-4">
                <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-secondary-text">Loading profile details...</span>
              </div>
            ) : (
              <div className="flex-1 space-y-8 mt-6">
                {/* Profile Header */}
                <div className="flex items-center gap-4 border-b border-white/10 pb-5">
                  {selectedMember.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedMember.profileImage}
                      alt={selectedMember.fullName}
                      className="w-20 h-20 rounded-full object-cover border border-white/10"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 font-bold text-2xl">
                      {selectedMember.fullName[0]}
                    </div>
                  )}
                  <div className="space-y-1">
                    <h3 className="text-xl font-extrabold">{selectedMember.fullName}</h3>
                    <div className="flex gap-2">
                      {getStatusBadge(selectedMember.status)}
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-accent/15 text-accent border border-accent/10">
                        {selectedMember.membershipPlan}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-secondary-text">Personal Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                    <div className="space-y-0.5">
                      <span className="text-xs text-secondary-text flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email</span>
                      <p className="font-semibold truncate">{selectedMember.email}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs text-secondary-text flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Phone</span>
                      <p className="font-semibold font-mono">{selectedMember.phone}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs text-secondary-text flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Birthday</span>
                      <p className="font-semibold">
                        {new Date(selectedMember.dateOfBirth).toLocaleDateString(undefined, {
                          dateStyle: "medium",
                        })}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs text-secondary-text flex items-center gap-1"><User className="w-3.5 h-3.5" /> Gender</span>
                      <p className="font-semibold capitalize">{selectedMember.gender.toLowerCase()}</p>
                    </div>
                    <div className="sm:col-span-2 space-y-0.5">
                      <span className="text-xs text-secondary-text flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Address</span>
                      <p className="font-semibold text-xs leading-relaxed">{selectedMember.address}</p>
                    </div>
                    <div className="sm:col-span-2 space-y-0.5 border-t border-white/5 pt-2 mt-2">
                      <span className="text-xs text-secondary-text flex items-center gap-1">Emergency Contact Info</span>
                      <p className="font-semibold text-xs text-white/95">{selectedMember.emergencyContact}</p>
                    </div>
                  </div>
                </div>

                {/* Verification/Payments history */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-secondary-text">Recent Payments</h4>
                  {selectedMember.payments?.length === 0 ? (
                    <p className="text-xs text-secondary-text bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                      No payments recorded for this member.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {selectedMember.payments.map((pmt: any) => (
                        <div
                          key={pmt.id}
                          className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-white/[0.01] text-xs"
                        >
                          <div>
                            <div className="font-mono text-white/70 font-semibold">{pmt.transactionId}</div>
                            <div className="text-[10px] text-secondary-text mt-0.5">
                              {new Date(pmt.createdAt).toLocaleDateString(undefined, {
                                dateStyle: "medium",
                              })}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold block text-sm text-white">${pmt.amount}</span>
                            <span
                              className={`text-[10px] uppercase font-bold tracking-wider ${
                                pmt.status === "APPROVED"
                                  ? "text-green-400"
                                  : pmt.status === "REJECTED"
                                  ? "text-red-400"
                                  : "text-yellow-400"
                              }`}
                            >
                              {pmt.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="flex gap-3 pt-6 border-t border-white/10 mt-6">
                  {selectedMember.status === "PENDING" && (
                    <button
                      onClick={() => handleApprove(selectedMember.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-green-500/10 cursor-pointer"
                    >
                      <Check className="w-4.5 h-4.5" /> Approve Registration
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(selectedMember.id)}
                    className="flex-1 border border-red-500/20 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4.5 h-4.5" /> Delete Member
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
