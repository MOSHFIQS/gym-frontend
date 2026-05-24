"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { CreditCard, Check, Copy, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

// Mapping plan to prices
const PLAN_PRICES: Record<string, number> = {
  MONTHLY: 50,
  QUARTERLY: 135,
  HALF_YEARLY: 240,
  YEARLY: 420,
};

interface GatewayDetails {
  method: "BKASH" | "NAGAD" | "BANK_TRANSFER";
  merchantNumber?: string;
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  instructions: string;
}

interface PaymentDetailsAPIResponse {
  bkash: GatewayDetails;
  nagad: GatewayDetails;
  bankTransfer: GatewayDetails;
}

const paymentSchema = z.object({
  transactionId: z.string().min(4, "Transaction ID must be at least 4 characters"),
  amount: z.number().positive("Amount must be a positive number"),
  method: z.enum(["BKASH", "NAGAD", "BANK_TRANSFER"]),
  memberId: z.string().uuid(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function PaymentFlow() {
  const router = useRouter();
  const { user, refetchUser } = useAuth();

  // Stepper state
  const [step, setStep] = useState(1);
  const [gateways, setGateways] = useState<PaymentDetailsAPIResponse | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<"BKASH" | "NAGAD" | "BANK_TRANSFER">("BKASH");
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [copiedText, setCopiedText] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch gateway parameters on mount
  useEffect(() => {
    const fetchGatewayDetails = async () => {
      try {
        const res = await apiClient.get("/payments/details");
        if (res.data?.success && res.data?.data) {
          setGateways(res.data.data);
        }
      } catch (err) {
        toast.error("Failed to load payment gateway information");
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchGatewayDetails();
  }, []);

  // Redirect client if they do not have a member profile
  useEffect(() => {
    if (user && !user.member) {
      toast.error("Please complete your member registration first.");
      router.replace("/register");
    }
  }, [user, router]);

  const memberProfile = user?.member;
  const currentPlan = memberProfile?.membershipPlan || "MONTHLY";
  const requiredAmount = PLAN_PRICES[currentPlan] || 50;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: requiredAmount,
      method: selectedMethod,
      memberId: memberProfile?.id || "",
    },
  });

  // Sync react-hook-form state on updates
  useEffect(() => {
    if (memberProfile) {
      setValue("memberId", memberProfile.id);
    }
    setValue("amount", requiredAmount);
    setValue("method", selectedMethod);
  }, [memberProfile, requiredAmount, selectedMethod, setValue]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    toast.success("Account detail copied!");
    setTimeout(() => setCopiedText(false), 2000);
  };

  const onSubmit = async (values: PaymentFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.post("/payments", values);
      if (response.data?.success) {
        toast.success("Payment submitted! Awaiting admin verification.");
        await refetchUser();
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit transaction details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingDetails || !memberProfile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center space-y-4">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-secondary-text text-sm">Initializing payment session...</span>
      </div>
    );
  }

  // Get active gateway parameters
  const currentGateway = gateways
    ? selectedMethod === "BKASH"
      ? gateways.bkash
      : selectedMethod === "NAGAD"
      ? gateways.nagad
      : gateways.bankTransfer
    : null;

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-black text-white pt-28 pb-16 px-4 relative overflow-hidden">
        {/* Glow aesthetics */}
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-2xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Complete Membership Dues</h1>
            <p className="text-secondary-text mt-2">
              Send the subscription amount based on your selected plan: <span className="text-accent font-semibold">{currentPlan} (${requiredAmount})</span>
            </p>

            {/* Stepper indicators */}
            <div className="flex items-center justify-center mt-8 gap-4 max-w-sm mx-auto">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border transition-all ${
                      step >= s
                        ? "bg-accent border-accent text-white shadow-lg shadow-accent/20"
                        : "border-white/10 text-white/40 bg-white/5"
                    }`}
                  >
                    {step > s ? <Check className="w-4 h-4" /> : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 transition-all ${
                        step > s ? "bg-accent" : "bg-white/10"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="glass border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
            {/* Step 1: Select Payment Gateway */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg font-bold">Step 1 — Choose Gateway</h3>
                  <p className="text-xs text-secondary-text">Select your preferred payment channel.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(["BKASH", "NAGAD", "BANK_TRANSFER"] as const).map((method) => (
                    <div
                      key={method}
                      onClick={() => setSelectedMethod(method)}
                      className={`border rounded-2xl p-5 cursor-pointer text-center transition-all flex flex-col items-center justify-center gap-3 ${
                        selectedMethod === method
                          ? "border-accent bg-accent/5 shadow-md"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          selectedMethod === method ? "bg-accent text-white" : "bg-white/5 border border-white/10 text-white/60"
                        }`}
                      >
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <span className="font-bold text-sm">
                        {method === "BANK_TRANSFER" ? "Bank Transfer" : method === "BKASH" ? "bKash" : "Nagad"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-accent/20"
                  >
                    Proceed <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Account Instructions */}
            {step === 2 && currentGateway && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg font-bold">Step 2 — Transfer Instructions</h3>
                  <p className="text-xs text-secondary-text">Send the amount using the info below.</p>
                </div>

                {/* Gateway Detail Cards */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-xs text-secondary-text">Method</span>
                    <span className="text-sm font-bold text-accent">{selectedMethod}</span>
                  </div>

                  {selectedMethod === "BANK_TRANSFER" ? (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-xs text-secondary-text">Bank Name</span>
                        <span className="font-medium">{currentGateway.bankName || "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-xs text-secondary-text">Account No</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">{currentGateway.accountNumber || "N/A"}</span>
                          <button
                            onClick={() => handleCopy(currentGateway.accountNumber || "")}
                            className="text-white/40 hover:text-white transition-colors cursor-pointer"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-xs text-secondary-text">Routing Number</span>
                        <span className="font-mono">{currentGateway.routingNumber || "N/A"}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-xs text-secondary-text">Merchant Number</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{currentGateway.merchantNumber || "N/A"}</span>
                        <button
                          onClick={() => handleCopy(currentGateway.merchantNumber || "")}
                          className="text-white/40 hover:text-white transition-colors cursor-pointer"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm pt-2">
                    <span className="text-xs text-secondary-text">Due Amount</span>
                    <span className="text-lg font-black text-white">${requiredAmount}</span>
                  </div>
                </div>

                <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl text-sm">
                  <p className="font-bold text-white mb-1">Manual Action Required:</p>
                  <p className="text-xs text-white/80 leading-relaxed">
                    <b>Send the money manually</b> through your mobile app or banking portal using the details listed above. Once the transaction completes, note down the <b>Transaction ID</b> and proceed to submit the form below.
                  </p>
                </div>

                <div className="flex justify-between pt-4 border-t border-white/10 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="border border-white/15 bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-accent/20"
                  >
                    Enter Transaction <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Form Submission */}
            {step === 3 && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-fade-in">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg font-bold">Step 3 — Submit Verification details</h3>
                  <p className="text-xs text-secondary-text">Enter transaction ID for confirmation.</p>
                </div>

                <div className="space-y-4">
                  {/* Read only details */}
                  <div className="grid grid-cols-2 gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs">
                    <div>
                      <span className="text-secondary-text block">Selected Method</span>
                      <span className="font-semibold text-sm">{selectedMethod}</span>
                    </div>
                    <div>
                      <span className="text-secondary-text block">Submitting Amount</span>
                      <span className="font-semibold text-sm">${requiredAmount}</span>
                    </div>
                  </div>

                  {/* Transaction ID */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-white/90">Transaction ID (TxnID)</label>
                    <input
                      type="text"
                      placeholder="e.g. TRX846394627"
                      className="w-full bg-white/5 border border-white/10 focus:border-accent rounded-xl py-3 px-4 text-white text-sm outline-none transition-all"
                      {...register("transactionId")}
                    />
                    {errors.transactionId && (
                      <p className="text-xs text-accent mt-1">{errors.transactionId.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-6 border-t border-white/10 mt-8">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={isSubmitting}
                    className="border border-white/15 bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-accent hover:bg-accent-hover text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-accent/20 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Submit Transaction <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
