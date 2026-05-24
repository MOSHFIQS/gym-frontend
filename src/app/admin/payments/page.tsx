"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  X,
  FileText,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
import Image from "next/image";

interface Payment {
  id: string;
  transactionId: string;
  amount: number;
  method: "BKASH" | "NAGAD" | "BANK_TRANSFER";
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  adminNote?: string | null;
  member: {
    fullName: string;
    email: string;
    membershipPlan: string;
    profileImage: string;
  } | null;
}

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const verifySchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  adminNote: z.string().optional(),
});

type VerifyFormValues = z.infer<typeof verifySchema>;

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  console.log(payments);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Query state
  const [status, setStatus] = useState("");
  const [method, setMethod] = useState("");
  const [page, setPage] = useState(1);

  // Verification modal state
  const [verifyingPayment, setVerifyingPayment] = useState<Payment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmittingVerify, setIsSubmittingVerify] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      status: "APPROVED",
      adminNote: "",
    },
  });

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", "10");
      if (status) params.append("status", status);
      if (method) params.append("method", method);

      const response = await apiClient.get(`/payments?${params.toString()}`);
      if (response.data?.success) {
        setPayments(response.data.data);
        setMeta(response.data.meta);
      }
    } catch (err) {
      toast.error("Failed to load payments registry");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, status, method]);

  const handleOpenVerifyModal = (pmt: Payment) => {
    setVerifyingPayment(pmt);
    setValue("status", "APPROVED");
    setValue("adminNote", "");
    setIsModalOpen(true);
  };

  const handleCloseVerifyModal = () => {
    setVerifyingPayment(null);
    setIsModalOpen(false);
    reset();
  };

  const onVerifySubmit = async (values: VerifyFormValues) => {
    if (!verifyingPayment) return;

    setIsSubmittingVerify(true);
    try {
      const res = await apiClient.patch(`/payments/${verifyingPayment.id}/verify`, values);
      if (res.data?.success) {
        toast.success(`Payment transaction has been ${values.status.toLowerCase()}!`);
        handleCloseVerifyModal();
        fetchPayments();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update transaction status");
    } finally {
      setIsSubmittingVerify(false);
    }
  };

  const getStatusBadge = (status: "PENDING" | "APPROVED" | "REJECTED") => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/15 text-green-400 border border-green-500/10">
            Approved
          </span>
        );
      case "PENDING":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/15 text-yellow-400 border border-yellow-500/10">
            Pending
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/10">
            Rejected
          </span>
        );
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Payments Verification</h1>
        <p className="text-sm text-secondary-text mt-1">
          Monitor incoming bank transfers, bKash, and Nagad payments for approval.
        </p>
      </div>

      {/* Query Filters */}
      <div className="glass border border-white/10 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-md">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
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
            <option value="PENDING" className="bg-neutral-900">Pending</option>
            <option value="APPROVED" className="bg-neutral-900">Approved</option>
            <option value="REJECTED" className="bg-neutral-900">Rejected</option>
          </select>

          {/* Method Filter */}
          <select
            value={method}
            onChange={(e) => {
              setMethod(e.target.value);
              setPage(1);
            }}
            className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-xs outline-none cursor-pointer focus:border-accent"
          >
            <option value="" className="bg-neutral-900">All Methods</option>
            <option value="BKASH" className="bg-neutral-900">bKash</option>
            <option value="NAGAD" className="bg-neutral-900">Nagad</option>
            <option value="BANK_TRANSFER" className="bg-neutral-900">Bank Transfer</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="glass border border-white/10 rounded-3xl p-6 shadow-xl relative">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-16 text-secondary-text text-sm">
            No payments found matching criteria.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-xs text-secondary-text uppercase tracking-wider">
                    <th className="pb-3 pr-4">Transaction ID</th>
                    <th className="pb-3 px-4">Member</th>
                    <th className="pb-3 px-4">Amount</th>
                    <th className="pb-3 px-4">Method</th>
                    <th className="pb-3 px-4">Submitted Date</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 pl-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {payments.map((pmt) => (
                    <tr key={pmt.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 pr-4">
                        <div className="font-mono text-xs font-bold text-white">{pmt.transactionId}</div>
                        {pmt.adminNote && (
                          <div className="text-[10px] text-accent mt-0.5 italic max-w-xs truncate" title={pmt.adminNote}>
                            Note: {pmt.adminNote}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {pmt.member ? (
                          <div className="flex items-center gap-3">
                          {pmt.member.profileImage && (
                            <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                              <Image
                                src={pmt.member.profileImage}
                                alt={pmt.member.fullName}
                                width={32}
                                height={32}
                                className="object-cover"
                              />
                            </div>
                          )}
                            <div>
                              <div className="font-semibold text-white">{pmt.member.fullName}</div>
                            <div className="text-xs text-secondary-text">{pmt.member.email}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-white/40">Unknown member profile</span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-bold text-white">${pmt.amount}</td>
                      <td className="py-4 px-4 text-xs font-semibold">{pmt.method}</td>
                      <td className="py-4 px-4 text-xs text-secondary-text font-medium">
                        {new Date(pmt.createdAt).toLocaleDateString(undefined, {
                          dateStyle: "medium",
                        })}
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(pmt.status)}</td>
                      <td className="py-4 pl-4 text-right">
                        {pmt.status === "PENDING" ? (
                          <button
                            onClick={() => handleOpenVerifyModal(pmt)}
                            className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-accent/15 cursor-pointer"
                          >
                            Verify Payment
                          </button>
                        ) : (
                          <span className="text-xs text-white/30 font-medium italic">Processed</span>
                        )}
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
                  Showing page {meta.page} of {meta.totalPages} ({meta.total} total payments)
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

      {/* Verify Transaction Modal */}
      {isModalOpen && verifyingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative animate-fade-in text-white">
            <button
              onClick={handleCloseVerifyModal}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-bold mb-1 flex items-center gap-2 border-b border-white/10 pb-3">
              <ClipboardList className="w-5 h-5 text-accent" /> Verify Transaction
            </h3>

            {/* Summary card */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-xs space-y-2 mt-4 mb-5">
              <div className="flex justify-between">
                <span className="text-secondary-text">Transaction ID</span>
                <span className="font-mono font-bold text-white">{verifyingPayment.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-text">Member Name</span>
                <span className="font-semibold text-white">{verifyingPayment.member?.fullName || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-text">Amount Dues</span>
                <span className="font-bold text-white">${verifyingPayment.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-text">Channel Method</span>
                <span className="font-semibold text-accent">{verifyingPayment.method}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onVerifySubmit)} className="space-y-4">
              {/* Verification Status */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/80">Verification Outcome</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center justify-center gap-2 border border-white/10 rounded-xl p-3 cursor-pointer bg-white/5 hover:border-green-500/50 has-[:checked]:border-green-500 has-[:checked]:bg-green-500/10">
                    <input
                      type="radio"
                      value="APPROVED"
                      className="accent-green-500"
                      {...register("status")}
                    />
                    <span className="text-xs font-bold text-green-400">Approve</span>
                  </label>
                  <label className="flex items-center justify-center gap-2 border border-white/10 rounded-xl p-3 cursor-pointer bg-white/5 hover:border-red-500/50 has-[:checked]:border-red-500 has-[:checked]:bg-red-500/10">
                    <input
                      type="radio"
                      value="REJECTED"
                      className="accent-red-500"
                      {...register("status")}
                    />
                    <span className="text-xs font-bold text-red-400">Reject</span>
                  </label>
                </div>
              </div>

              {/* Admin Note Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/80">Admin Note / Feedback (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Transaction matching confirmed / Incorrect transaction reference number..."
                  className="w-full bg-white/5 border border-white/10 focus:border-accent rounded-xl py-2 px-3 text-white text-xs outline-none transition-all resize-none"
                  {...register("adminNote")}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10 mt-6">
                <button
                  type="button"
                  onClick={handleCloseVerifyModal}
                  disabled={isSubmittingVerify}
                  className="flex-1 border border-white/15 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-semibold text-sm cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingVerify}
                  className="flex-1 bg-accent hover:bg-accent-hover text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-accent/20 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingVerify ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Submit Verification"
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
