"use client";

import React, { useState } from 'react';

const RED_FLAGS = [
    'Red 40', 'Yellow 5', 'Yellow 6', 'Blue 1', 'Blue 2',
    'Titanium Dioxide', 'Carrageenan', 'BHA', 'BHT',
    'Potassium Bromate', 'Propyl Paraben', 'Sodium Nitrite',
    'Aspartame', 'High Fructose Corn Syrup', 'Rapeseed Oil',
    'Palm Oil', 'MSG', 'Monosodium Glutamate', 'E635'
];

export default function RiskCalculator() {
    const [input, setInput] = useState('');
    const [result, setResult] = useState<{ score: number; flagged: string[] } | null>(null);

    const checkRisk = () => {
        const ingredients = input.split(',').map(i => i.trim().toLowerCase());
        const flagged = RED_FLAGS.filter(flag =>
            ingredients.some(ing => ing.includes(flag.toLowerCase()))
        );

        // Simple logic: 100 base, -20 per flagged ingredient
        const score = Math.max(0, 100 - (flagged.length * 25));
        setResult({ score, flagged });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter ingredients (e.g. Red 40, Sugar, BHA)"
                    className="flex-1 px-6 py-4 rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button
                    onClick={checkRisk}
                    className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-500/20"
                >
                    Check Risk
                </button>
            </div>

            {result && (
                <div className="animate-fade-up p-6 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center gap-8">
                    <div className="text-center">
                        <div className={`text-5xl font-black ${result.score > 70 ? 'text-emerald-500' : result.score > 40 ? 'text-orange-500' : 'text-red-500'}`}>
                            {result.score}
                        </div>
                        <div className="text-xs uppercase tracking-wider text-gray-400 font-bold mt-1">Health Score</div>
                    </div>
                    <div className="h-12 w-px bg-gray-100" />
                    <div className="flex-1">
                        {result.flagged.length > 0 ? (
                            <div>
                                <p className="font-bold text-red-500 mb-2">Red Flags Found:</p>
                                <div className="flex flex-wrap gap-2">
                                    {result.flagged.map((f, i) => (
                                        <span key={i} className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-medium border border-red-100">
                                            {f}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-emerald-600 font-bold">No common red flags detected! ✨</p>
                        )}
                    </div>
                </div>
            )}
            <p className="text-xs text-gray-400 italic">
                *Disclaimer: This is a simplified check for common harmful additives.
                For a full analysis, download the PureScan app.
            </p>
        </div>
    );
}
