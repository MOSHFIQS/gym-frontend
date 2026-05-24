"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CreditCard,
  AlertCircle,
  Plus,
  X,
  FileText,
  DollarSign,
  User as UserIcon,
  CheckCircle,
  Clock,
  Ban,
} from "lucide-react";

interface Payment {
  id: string;
  transactionId: string;
  amount: number;
  method: "BKASH" | "NAGAD" | "BANK_TRANSFER";
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  adminNote?: string | null;
}

// Pricing helper
const PLAN_PRICES: Record<string, number> = {
  MONTHLY: 50,
  QUARTERLY: 135,
  HALF_YEARLY: 240,
  YEARLY: 420,
};

const paymentModalSchema = z.object({
  transactionId: z.string().min(4, "Transaction ID must be at least 4 characters"),
  amount: z.number().positive("Amount must be positive"),
  method: z.enum(["BKASH", "NAGAD", "BANK_TRANSFER"]),
  memberId: z.string().uuid(),
});

type PaymentModalValues = z.infer<typeof paymentModalSchema>;

export default function MemberDashboard() {
  const { user, refetchUser } = useAuth();
  const router = useRouter();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const fetchPayments = async () => {
    try {
      const res = await apiClient.get("/payments/my");
      if (res.data?.success && res.data?.data) {
        setPayments(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load payments history", err);
    } finally {
      setIsLoadingPayments(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const memberProfile = user?.member;
  const currentPlan = memberProfile?.membershipPlan || "MONTHLY";
  const requiredAmount = PLAN_PRICES[currentPlan] || 50;

  // Form hooks for payment creation modal
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentModalValues>({
    resolver: zodResolver(paymentModalSchema),
    values: {
      amount: requiredAmount,
      method: "BKASH",
      memberId: memberProfile?.id || "",
      transactionId: "",
    },
  });

  const onPaymentSubmit = async (values: PaymentModalValues) => {
    setIsSubmittingPayment(true);
    try {
      const response = await apiClient.post("/payments", values);
      if (response.data?.success) {
        toast.success("Payment submitted successfully!");
        setIsModalOpen(false);
        reset();
        await fetchPayments();
        await refetchUser();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit payment");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Status Badge visual configurations
  const getMemberStatusBadge = (status: "PENDING" | "ACTIVE" | "INACTIVE") => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
            <CheckCircle className="w-3.5 h-3.5" /> ACTIVE
          </span>
        );
      case "PENDING":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse">
            <Clock className="w-3.5 h-3.5" /> PENDING VERIFICATION
          </span>
        );
      case "INACTIVE":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
            <Ban className="w-3.5 h-3.5" /> INACTIVE / EXPIRED
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (status: "PENDING" | "APPROVED" | "REJECTED") => {
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
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-black text-white pt-28 pb-16 px-4 relative overflow-hidden">
        {/* Visual lighting */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 space-y-8">
          {/* Complete registration warning banner */}
          {!memberProfile && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-accent/15 border border-accent/30 rounded-3xl animate-pulse">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Complete your registration</h3>
                  <p className="text-sm text-white/70 mt-0.5">
                    Create a member profile and assign a package to activate your gym access.
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push("/register")}
                className="bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-accent/20 shrink-0 cursor-pointer"
              >
                Start Registration
              </button>
            </div>
          )}

          {/* Member Profile Dashboard grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Profile details */}
            <div className="lg:col-span-1 space-y-6">
              <div className="glass border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-bl-full pointer-events-none" />
                
                <h3 className="text-lg font-bold border-b border-white/10 pb-3 mb-5 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-accent" /> Profile Card
                </h3>

                {memberProfile ? (
                  <div className="space-y-6 text-center lg:text-left">
                    {/* User profile image preview */}
                    <div className="flex flex-col lg:flex-row items-center gap-4">
                      {memberProfile.profileImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={memberProfile.profileImage}
                          alt={memberProfile.fullName}
                          className="w-20 h-20 rounded-full object-cover border border-white/10 shadow-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                          <UserIcon className="w-8 h-8" />
                        </div>
                      )}
                      <div className="space-y-1">
                        <h4 className="text-lg font-extrabold">{memberProfile.fullName}</h4>
                        <div className="flex justify-center lg:justify-start">
                          {getMemberStatusBadge(memberProfile.status)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-white/5 text-sm text-left">
                      <div className="flex justify-between">
                        <span className="text-secondary-text">Current Plan</span>
                        <span className="font-semibold text-accent">{memberProfile.membershipPlan}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-text">User Email</span>
                        <span className="font-semibold text-white/90">{user?.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-text">Contact No</span>
                        <span className="font-mono text-white/90">{memberProfile.phone}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-3">
                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto text-white/40">
                      <UserIcon className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-secondary-text">No member details found.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Payments list */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/10 pb-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <FileText className="w-5 h-5 text-accent" /> Payment History
                    </h3>
                    <p className="text-xs text-secondary-text mt-0.5">
                      Recent transactions logged to activate/renew your plan.
                    </p>
                  </div>

                  {memberProfile && (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-accent/15 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Submit New Payment
                    </button>
                  )}
                </div>

                {/* Table details */}
                {isLoadingPayments ? (
                  <div className="space-y-3">
                    <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
                    <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
                    <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-12 space-y-3 border border-dashed border-white/10 rounded-2xl">
                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto text-white/40">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-secondary-text">No transaction history found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-xs text-secondary-text uppercase tracking-wider">
                          <th className="pb-3 pr-4">Transaction ID</th>
                          <th className="pb-3 px-4">Amount</th>
                          <th className="pb-3 px-4">Method</th>
                          <th className="pb-3 px-4">Status</th>
                          <th className="pb-3 pl-4">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {payments.map((pmt) => (
                          <tr key={pmt.id} className="text-white/80 hover:text-white transition-colors">
                            <td className="py-3.5 pr-4 font-mono text-xs">{pmt.transactionId}</td>
                            <td className="py-3.5 px-4 font-semibold text-white">${pmt.amount}</td>
                            <td className="py-3.5 px-4 text-xs font-medium">{pmt.method}</td>
                            <td className="py-3.5 px-4">{getPaymentStatusBadge(pmt.status)}</td>
                            <td className="py-3.5 pl-4 text-xs text-secondary-text">
                              {new Date(pmt.createdAt).toLocaleDateString(undefined, {
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
            </div>
          </div>
        </div>
      </div>

      {/* Submit New Payment Modal */}
      {isModalOpen && memberProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative animate-fade-in text-white">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-bold mb-1 flex items-center gap-2 border-b border-white/10 pb-3">
              <DollarSign className="w-5 h-5 text-accent" /> Log New Payment
            </h3>

            <p className="text-xs text-secondary-text mb-5 leading-relaxed">
              Verify you have manually transferred the subscription amount for the plan:{" "}
              <b className="text-accent font-semibold">{currentPlan} (${requiredAmount})</b>.
            </p>

            <form onSubmit={handleSubmit(onPaymentSubmit)} className="space-y-4">
              {/* Payment Method Selector */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/80">Select Method</label>
                <select
                  className="w-full bg-white/5 border border-white/10 focus:border-accent rounded-xl py-3 px-4 text-white text-sm outline-none transition-all"
                  {...register("method")}
                >
                  <option value="BKASH" className="bg-neutral-900">bKash</option>
                  <option value="NAGAD" className="bg-neutral-900">Nagad</option>
                  <option value="BANK_TRANSFER" className="bg-neutral-900">Bank Transfer</option>
                </select>
              </div>

              {/* Transaction ID Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/80">Transaction ID (TxnID)</label>
                <input
                  type="text"
                  placeholder="TRX485938495"
                  className="w-full bg-white/5 border border-white/10 focus:border-accent rounded-xl py-3 px-4 text-white text-sm outline-none transition-all"
                  {...register("transactionId")}
                />
                {errors.transactionId && (
                  <p className="text-xs text-accent mt-1">{errors.transactionId.message}</p>
                )}
              </div>

              {/* Amount - Pre-filled & Read-only */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/80">Amount (USD)</label>
                <input
                  type="number"
                  disabled
                  className="w-full bg-white/5 border border-white/10 opacity-60 rounded-xl py-3 px-4 text-white text-sm outline-none cursor-not-allowed"
                  value={requiredAmount}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmittingPayment}
                  className="flex-1 border border-white/15 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-semibold text-sm cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="flex-1 bg-accent hover:bg-accent-hover text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-accent/20 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingPayment ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Submit Details"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
