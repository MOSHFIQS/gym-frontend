"use client";

import { useEffect, useRef, useState } from "react";

interface ResultData {
  bmi: number;
  bmr: number;
  tdee: number;
  water: number;
  protein: number;
  carbs: number;
  fat: number;
  status: string;
  color: string;
}

function AnimatedNumber({
  value,
  decimals = 0,
}: {
  value: number;
  decimals?: number;
}) {
  const [display, setDisplay] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    let start: number | null = null;
    const duration = 700;
    const from = display;

    const animate = (time: number) => {
      if (start === null) start = time;

      const progress = Math.min((time - start) / duration, 1);

      const eased = 1 - Math.pow(1 - progress, 4);

      setDisplay(from + (value - from) * eased);

      if (progress < 1) {
        frame.current = requestAnimationFrame(animate);
      }
    };

    frame.current = requestAnimationFrame(animate);

    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [value]);

  return <>{display.toFixed(decimals)}</>;
}

function Slider({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-zinc-400 text-sm font-medium">{label}</p>

        <div className="text-white font-bold text-lg">
          {value}
          <span className="text-zinc-500 text-sm ml-1">{unit}</span>
        </div>
      </div>

      <div className="relative h-2 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className="absolute h-full rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-orange-300"
          style={{ width: `${percentage}%` }}
        />

        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange(Number(e.target.value))
          }
          className="absolute inset-0 opacity-0 w-full cursor-pointer"
        />
      </div>
    </div>
  );
}

export default function BMICalculator() {
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);
  const [age, setAge] = useState(22);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [activity, setActivity] = useState(1.55);

  const [result, setResult] = useState<ResultData | null>(null);

  const calculateBMI = () => {
    const heightM = height / 100;

    const bmi = weight / (heightM * heightM);

    let status = "Healthy";
    let color = "#22c55e";

    if (bmi < 18.5) {
      status = "Underweight";
      color = "#3b82f6";
    } else if (bmi < 25) {
      status = "Healthy";
      color = "#22c55e";
    } else if (bmi < 30) {
      status = "Overweight";
      color = "#f59e0b";
    } else {
      status = "Obese";
      color = "#ef4444";
    }

    const bmr =
      gender === "male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    const tdee = bmr * activity;

    const protein = weight * 1.8;
    const fat = (tdee * 0.25) / 9;
    const carbs = (tdee - protein * 4 - fat * 9) / 4;

    setResult({
      bmi,
      bmr,
      tdee,
      water: weight * 0.033,
      protein,
      carbs,
      fat,
      status,
      color,
    });
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0">
        <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-orange-500/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-250px] right-[-200px] w-[500px] h-[500px] bg-orange-400/10 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-14">
        {/* Header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/20 bg-orange-500/5 mb-6">
            <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-orange-400 text-xs font-semibold tracking-[0.2em] uppercase">
              Smart Health
            </span>
          </div>

          <h1 className="text-6xl font-black tracking-tight leading-none">
            BMI
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
              {" "}
              Calculator
            </span>
          </h1>

          <p className="mt-6 text-zinc-400 max-w-2xl text-lg leading-relaxed">
            Advanced body mass index calculator with metabolic analysis,
            calorie tracking and macro recommendations.
          </p>
        </div>

        <div className="grid lg:grid-cols-[420px_1fr] gap-8">
          {/* LEFT PANEL */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-7 shadow-2xl shadow-black/30">
            <div className="space-y-8">
              <Slider
                label="Weight"
                value={weight}
                min={30}
                max={150}
                unit="kg"
                onChange={setWeight}
              />

              <Slider
                label="Height"
                value={height}
                min={120}
                max={220}
                unit="cm"
                onChange={setHeight}
              />

              <Slider
                label="Age"
                value={age}
                min={10}
                max={80}
                unit="yrs"
                onChange={setAge}
              />

              {/* Gender */}
              <div>
                <p className="text-zinc-400 text-sm font-medium mb-3">
                  Gender
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {["male", "female"].map((g) => (
                    <button
                      key={g}
                      onClick={() =>
                        setGender(g as "male" | "female")
                      }
                      className={`rounded-2xl py-4 font-semibold transition-all duration-300 border ${
                        gender === g
                          ? "bg-orange-500 text-black border-orange-500 shadow-lg shadow-orange-500/30"
                          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity */}
              <div>
  <p className="text-zinc-400 text-sm font-medium mb-3">
    Activity Level
  </p>

  <div className="relative">
    <select
      value={activity}
      onChange={(e) => setActivity(Number(e.target.value))}
      className="
        w-full
        appearance-none
        rounded-2xl
        border
        border-white/10
        bg-zinc-900/80
        backdrop-blur-xl
        px-5
        py-4
        pr-14
        text-white
        text-[15px]
        font-medium
        outline-none
        transition-all
        duration-300
        hover:border-orange-500/40
        focus:border-orange-500
        focus:ring-4
        focus:ring-orange-500/10
        shadow-lg
        shadow-black/20
      "
    >
      <option value={1.2} className="bg-zinc-900 text-white">
        Sedentary • Little or no exercise
      </option>

      <option value={1.375} className="bg-zinc-900 text-white">
        Light Exercise • 1–3 days/week
      </option>

      <option value={1.55} className="bg-zinc-900 text-white">
        Moderate Exercise • 3–5 days/week
      </option>

      <option value={1.725} className="bg-zinc-900 text-white">
        Heavy Exercise • 6–7 days/week
      </option>

      <option value={1.9} className="bg-zinc-900 text-white">
        Athlete • Intense training
      </option>
    </select>

    {/* Custom Arrow */}
    <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center">
      <svg
        className="w-5 h-5 text-zinc-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  </div>
</div>

              <button
                onClick={calculateBMI}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-400 text-black font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-2xl shadow-orange-500/30"
              >
                Calculate BMI
              </button>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="space-y-8">
            {/* Main Result */}
            <div className="rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-10 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-orange-500/10 blur-[120px] rounded-full" />

              {result ? (
                <>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
                    <div>
                      <p className="text-zinc-500 uppercase tracking-[0.25em] text-xs font-semibold mb-4">
                        Your BMI Score
                      </p>

                      <div
                        className="text-8xl font-black leading-none"
                        style={{ color: result.color }}
                      >
                        <AnimatedNumber
                          value={result.bmi}
                          decimals={1}
                        />
                      </div>

                      <p
                        className="mt-4 text-xl font-semibold"
                        style={{ color: result.color }}
                      >
                        {result.status}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full lg:max-w-md">
                      {[
                        {
                          label: "BMR",
                          value: `${result.bmr.toFixed(0)} kcal`,
                        },
                        {
                          label: "Calories",
                          value: `${result.tdee.toFixed(0)} kcal`,
                        },
                        {
                          label: "Water",
                          value: `${result.water.toFixed(1)} L`,
                        },
                        {
                          label: "Protein",
                          value: `${result.protein.toFixed(0)} g`,
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-2xl border border-white/10 bg-black/30 p-5"
                        >
                          <p className="text-zinc-500 text-sm mb-2">
                            {item.label}
                          </p>

                          <p className="text-2xl font-bold">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center py-32">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full border border-white/10 mx-auto mb-6 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-orange-500/30 animate-pulse" />
                    </div>

                    <h3 className="text-2xl font-bold mb-2">
                      No Results Yet
                    </h3>

                    <p className="text-zinc-500">
                      Enter your information to calculate BMI
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Macros */}
            {result && (
              <div className="rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold">
                    Daily Macros
                  </h2>

                  <div className="text-zinc-500 text-sm">
                    Based on TDEE
                  </div>
                </div>

                <div className="space-y-5">
                  {[
                    {
                      label: "Protein",
                      value: result.protein,
                      color: "bg-orange-500",
                    },
                    {
                      label: "Carbs",
                      value: result.carbs,
                      color: "bg-blue-500",
                    },
                    {
                      label: "Fat",
                      value: result.fat,
                      color: "bg-purple-500",
                    },
                  ].map((macro) => (
                    <div key={macro.label}>
                      <div className="flex justify-between mb-2">
                        <p className="font-medium">
                          {macro.label}
                        </p>

                        <p className="text-zinc-400">
                          {macro.value.toFixed(0)} g
                        </p>
                      </div>

                      <div className="h-3 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${macro.color}`}
                          style={{
                            width: `${Math.min(
                              macro.value / 2,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}