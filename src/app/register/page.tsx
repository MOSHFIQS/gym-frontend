"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { Check, ArrowRight, ArrowLeft, Upload, Image as ImageIcon } from "lucide-react";

// Plan details helper
const PLANS = [
  { id: "MONTHLY", name: "Monthly", price: 50, duration: "Month", desc: "Perfect for short-term goals" },
  { id: "QUARTERLY", name: "Quarterly", price: 135, duration: "3 Months", desc: "Our starter fitness plan" },
  { id: "HALF_YEARLY", name: "Half Yearly", price: 240, duration: "6 Months", desc: "Best balance for commitment" },
  { id: "YEARLY", name: "Yearly", price: 420, duration: "12 Months", desc: "Maximum savings & commitment" },
];

// Zod schemas for validation
const step1Schema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  emergencyContact: z.string().min(10, "Emergency contact must be at least 10 digits"),
});

type Step1Data = z.infer<typeof step1Schema>;

export default function RegisterWizard() {
  const router = useRouter();
  const { refetchUser } = useAuth();
  const [step, setStep] = useState(1);

  // Wizard state
  const [personalInfo, setPersonalInfo] = useState<Step1Data | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>("MONTHLY");
  const [joiningDate, setJoiningDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 Form Handler
  const {
    register: registerStep1,
    handleSubmit: handleSubmitStep1,
    formState: { errors: errorsStep1 },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: personalInfo || {},
  });

  const onStep1Submit = (data: Step1Data) => {
    setPersonalInfo(data);
    setStep(2);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and WebP files are allowed");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFinalSubmit = async () => {
    if (!personalInfo) {
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("fullName", personalInfo.fullName);
    formData.append("phone", personalInfo.phone);
    formData.append("gender", personalInfo.gender);
    formData.append("dateOfBirth", personalInfo.dateOfBirth);
    formData.append("address", personalInfo.address);
    formData.append("emergencyContact", personalInfo.emergencyContact);
    formData.append("membershipPlan", selectedPlan);
    formData.append("joiningDate", joiningDate);

    if (imageFile) {
      formData.append("profileImage", imageFile);
    }

    try {
      const response = await apiClient.post("/members", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data?.success) {
        toast.success("Profile registration submitted successfully!");
        // Re-authenticate / fetch user profile to populate user.member
        await refetchUser();
        router.push("/payment");
      }
    } catch (error: any) {
      toast.error(error.message || "Registration failed. Please verify details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-black text-white pt-28 pb-16 px-4 relative overflow-hidden">
        {/* Decorative glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-3xl mx-auto relative z-10">
          {/* Stepper Header */}
          <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Member Registration
            </h1>
            <p className="text-secondary-text mt-2">
              Complete your profile details to join our membership plans
            </p>

            {/* Stepper bar */}
            <div className="flex items-center justify-center mt-8 gap-4 max-w-md mx-auto">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border transition-all ${
                      step >= s
                        ? "bg-accent border-accent text-white shadow-lg shadow-accent/20"
                        : "border-white/10 text-white/40 bg-white/5"
                    }`}
                  >
                    {step > s ? <Check className="w-5 h-5" /> : s}
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

          {/* Stepper Body */}
          <div className="glass border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl">
            {/* STEP 1: Personal Info */}
            {step === 1 && (
              <form onSubmit={handleSubmitStep1(onStep1Submit)} className="space-y-6">
                <div className="border-b border-white/10 pb-4 mb-6">
                  <h3 className="text-xl font-semibold">Step 1 — Personal Information</h3>
                  <p className="text-sm text-secondary-text">
                    Provide your basic details to set up your membership.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-white/90">Full Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full bg-white/5 border border-white/10 focus:border-accent rounded-xl py-3 px-4 text-white text-sm outline-none transition-all"
                      {...registerStep1("fullName")}
                    />
                    {errorsStep1.fullName && (
                      <p className="text-xs text-accent mt-1">{errorsStep1.fullName.message}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-white/90">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+880123456789"
                      className="w-full bg-white/5 border border-white/10 focus:border-accent rounded-xl py-3 px-4 text-white text-sm outline-none transition-all"
                      {...registerStep1("phone")}
                    />
                    {errorsStep1.phone && (
                      <p className="text-xs text-accent mt-1">{errorsStep1.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-white/90">Gender</label>
                    <select
                      className="w-full bg-white/5 border border-white/10 focus:border-accent rounded-xl py-3 px-4 text-white text-sm outline-none transition-all"
                      {...registerStep1("gender")}
                    >
                      <option value="" className="bg-neutral-900">Select Gender</option>
                      <option value="MALE" className="bg-neutral-900">Male</option>
                      <option value="FEMALE" className="bg-neutral-900">Female</option>
                      <option value="OTHER" className="bg-neutral-900">Other</option>
                    </select>
                    {errorsStep1.gender && (
                      <p className="text-xs text-accent mt-1">{errorsStep1.gender.message}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-white/90">Date of Birth</label>
                    <input
                      type="date"
                      className="w-full bg-white/5 border border-white/10 focus:border-accent rounded-xl py-3 px-4 text-white text-sm outline-none transition-all"
                      {...registerStep1("dateOfBirth")}
                    />
                    {errorsStep1.dateOfBirth && (
                      <p className="text-xs text-accent mt-1">{errorsStep1.dateOfBirth.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-white/90">Address</label>
                  <textarea
                    rows={3}
                    placeholder="Enter your street address details..."
                    className="w-full bg-white/5 border border-white/10 focus:border-accent rounded-xl py-3 px-4 text-white text-sm outline-none transition-all resize-none"
                    {...registerStep1("address")}
                  />
                  {errorsStep1.address && (
                    <p className="text-xs text-accent mt-1">{errorsStep1.address.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-white/90">Emergency Contact Number</label>
                  <input
                    type="text"
                    placeholder="Relationship / Phone number"
                    className="w-full bg-white/5 border border-white/10 focus:border-accent rounded-xl py-3 px-4 text-white text-sm outline-none transition-all"
                    {...registerStep1("emergencyContact")}
                  />
                  {errorsStep1.emergencyContact && (
                    <p className="text-xs text-accent mt-1">{errorsStep1.emergencyContact.message}</p>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-accent/20"
                  >
                    Next Step <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Plan Selection */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-white/10 pb-4 mb-6">
                  <h3 className="text-xl font-semibold">Step 2 — Select Membership Plan</h3>
                  <p className="text-sm text-secondary-text">
                    Select a plan that works best for your schedule and budget.
                  </p>
                </div>

                {/* Plan Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PLANS.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`border rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between ${
                        selectedPlan === plan.id
                          ? "border-accent bg-accent/5 shadow-md shadow-accent/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-bold text-lg">{plan.name}</h4>
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              selectedPlan === plan.id
                                ? "border-accent bg-accent"
                                : "border-white/30"
                            }`}
                          >
                            {selectedPlan === plan.id && (
                              <span className="w-1.5 h-1.5 bg-white rounded-full" />
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-secondary-text mb-4">{plan.desc}</p>
                      </div>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-2xl font-black text-white">${plan.price}</span>
                        <span className="text-xs text-white/50">/ {plan.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Joining date picker */}
                <div className="space-y-1 max-w-sm mt-6">
                  <label className="text-sm font-medium text-white/90">Joining Date</label>
                  <input
                    type="date"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 focus:border-accent rounded-xl py-3 px-4 text-white text-sm outline-none transition-all"
                  />
                </div>

                <div className="flex justify-between pt-6 border-t border-white/10 mt-8">
                  <button
                    onClick={() => setStep(1)}
                    className="border border-white/15 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Previous
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-accent/20"
                  >
                    Next Step <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Profile Image & Submit */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-white/10 pb-4 mb-6">
                  <h3 className="text-xl font-semibold">Step 3 — Profile Image (Optional)</h3>
                  <p className="text-sm text-secondary-text">
                    Upload a profile picture to identify you at our reception desk.
                  </p>
                </div>

                {/* File Upload Field */}
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-accent/40 rounded-3xl p-8 bg-white/5 transition-all text-center">
                  {imagePreview ? (
                    <div className="relative group w-44 h-44 rounded-full overflow-hidden border border-white/10 shadow-lg mb-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                      <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 cursor-pointer transition-opacity">
                        <Upload className="w-6 h-6 text-white" />
                        <span className="text-xs text-white">Change Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-3 cursor-pointer w-full py-6">
                      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Click to upload photo</p>
                        <p className="text-xs text-secondary-text mt-1">
                          JPG, PNG or WebP (max 5MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                  {imageFile && (
                    <p className="text-xs text-accent font-semibold">
                      Selected: {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                {/* Summary of selections */}
                {personalInfo && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm mt-6">
                    <h5 className="font-bold mb-2">Registration Summary:</h5>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-secondary-text">Name:</span> {personalInfo.fullName}</div>
                      <div><span className="text-secondary-text">Plan:</span> {selectedPlan}</div>
                      <div><span className="text-secondary-text">Phone:</span> {personalInfo.phone}</div>
                      <div><span className="text-secondary-text">Date:</span> {joiningDate}</div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-6 border-t border-white/10 mt-8">
                  <button
                    onClick={() => setStep(2)}
                    disabled={isSubmitting}
                    className="border border-white/15 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" /> Previous
                  </button>
                  <button
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting}
                    className="bg-accent hover:bg-accent-hover text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-accent/20 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Complete Registration <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
