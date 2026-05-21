"use client";

import { useState } from "react";

const bmiData = [
  { bmi: "Below 18.5", status: "Underweight", color: "text-blue-400" },
  { bmi: "18.5 - 24.9", status: "Healthy", color: "text-green-400" },
  { bmi: "25.0 - 29.9", status: "Overweight", color: "text-yellow-400" },
  { bmi: "30.0 and Above", status: "Obese", color: "text-red-400" },
];

export default function BMICalculator() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [activity, setActivity] = useState("");
  const [result, setResult] = useState<{ bmi: number; status: string; color: string } | null>(null);

  const calculateBMI = () => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) return;
    const bmi = w / (h * h);
    let status = "", color = "";
    if (bmi < 18.5) { status = "Underweight"; color = "text-blue-400"; }
    else if (bmi < 25) { status = "Healthy"; color = "text-green-400"; }
    else if (bmi < 30) { status = "Overweight"; color = "text-yellow-400"; }
    else { status = "Obese"; color = "text-red-400"; }
    setResult({ bmi: Math.round(bmi * 10) / 10, status, color });
  };

  const inputCls = "bg-input-bg text-white placeholder-[#AFAFAF] px-4 py-4 rounded-lg border border-transparent focus:border-accent focus:outline-none transition-colors duration-300";
  const selectCls = "bg-input-bg text-[#AFAFAF] px-4 py-4 rounded-lg border border-transparent focus:border-accent focus:outline-none transition-colors duration-300 appearance-none cursor-pointer";

  return (
    <section id="bmi">
      <div className="text-center max-w-2xl mx-auto px-6 mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">BMI Calculator</h2>
        <p className="text-secondary-text text-sm sm:text-base leading-relaxed">We believe fitness should be accessible to everyone, everywhere, regardless of income or access to a gym.</p>
      </div>
      <div className="bg-card-bg py-12 sm:py-16">
        <div className="max-w-[90%] mx-auto flex flex-col lg:flex-row gap-10 lg:gap-16">
          <div className="flex-1">
            <h3 className="text-2xl sm:text-3xl font-bold mb-8">BMI Calculator Chart</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-3 px-5 border border-white/10 font-semibold">BMI</th>
                  <th className="text-left py-3 px-5 border border-white/10 font-semibold">Weight Status</th>
                </tr>
              </thead>
              <tbody>
                {bmiData.map((row) => (
                  <tr key={row.bmi} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-5 border border-white/10 text-secondary-text">{row.bmi}</td>
                    <td className={`py-3 px-5 border border-white/10 ${row.color} font-medium`}>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl sm:text-3xl font-bold mb-3">Calculate your BMI</h3>
            <p className="text-secondary-text text-sm mb-6">We believe fitness should be accessible to everyone, regardless of income or access to a gym.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input id="bmi-height" type="number" placeholder="Height/cm" value={height} onChange={(e) => setHeight(e.target.value)} className={inputCls} />
              <input id="bmi-weight" type="number" placeholder="Weight/kg" value={weight} onChange={(e) => setWeight(e.target.value)} className={inputCls} />
              <input id="bmi-age" type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} className={inputCls} />
              <select id="bmi-gender" value={gender} onChange={(e) => setGender(e.target.value)} className={selectCls}>
                <option value="">Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <select id="bmi-activity" value={activity} onChange={(e) => setActivity(e.target.value)} className={`sm:col-span-2 ${selectCls}`}>
                <option value="">Select an activity factor</option>
                <option value="weight-loss">Weight Loss</option>
                <option value="weight-lifter">Weight Lifter</option>
              </select>
            </div>
            <button id="calculate-bmi-btn" onClick={calculateBMI} className="mt-6 px-12 py-4 bg-accent text-white font-semibold text-lg rounded-full hover:bg-accent-hover hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-accent/30">Calculate</button>
            {result && (
              <div className="mt-6 glass rounded-xl p-5 animate-fade-in">
                <p className="text-secondary-text text-sm mb-1">Your BMI is</p>
                <p className={`text-4xl font-black ${result.color}`}>{result.bmi}</p>
                <p className={`text-lg font-semibold mt-1 ${result.color}`}>{result.status}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
