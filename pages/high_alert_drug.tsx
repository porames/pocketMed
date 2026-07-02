import React, { useState, useMemo } from "react";
import { ChevronLeft, Check, Activity } from "lucide-react";
import NumberInput from "./components/numberInput";

const CONCENTRATIONS = [
    { value: 4 / 100, short: "4:100" },
    { value: 4 / 250, short: "4:250" },
    { value: 1 / 100, short: "1:100" },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
    return (
        <p
            className="text-[11px] font-bold uppercase tracking-[0.08em] mb-1"
            style={{ color: "var(--teal, #0E7490)" }}
        >
            {children}
        </p>
    );
}

export default function HAD() {
    const [conc, setConc] = useState<number>(CONCENTRATIONS[0].value);
    const [rate, setRate] = useState<number | undefined>(4);
    const [weight, setWeight] = useState<number | undefined>(60);

    // Same calculation as before — untouched.
    const result = useMemo(() => {
        const w = Number(weight);
        const r = Number(rate);
        if (!w || !r || w <= 0 || r <= 0) return null;
        return ((conc * r) / (w * 60)) * 1000;
    }, [conc, rate, weight]);

    return (
        <div className="min-h-screen w-full flex justify-center" style={{ background: "var(--paper, #F5F6F8)" }}>
            <div className="w-full max-w-2xl px-4 pb-16 pt-6">
                {/* Back */}
                <button
                    onClick={() => (window.location.href = "/")}
                    className="flex items-center gap-1 text-sm font-medium mb-6 transition-opacity hover:opacity-70"
                    style={{ color: "#5C7080" }}
                >
                    <ChevronLeft size={16} /> Home
                </button>

                {/* Heading */}
                <div className="mb-6">
                    <Eyebrow>Porames PocketMed</Eyebrow>
                    <div className="flex items-center gap-2">
                        <h1
                            className="text-[26px] font-extrabold leading-tight"
                            style={{ color: "var(--ink, #101828)", letterSpacing: "-0.02em" }}
                        >
                            High Alert Drug Reference
                        </h1>
                        <span
                            className="text-[10px] font-bold uppercase rounded-md px-1.5 py-0.5"
                            style={{ color: "var(--red, #DC2626)", background: "#FEE2E2", letterSpacing: "0.05em" }}
                        >
                            Beta
                        </span>
                    </div>
                    <p className="text-[13px] mt-1.5 leading-snug" style={{ color: "#667085" }}>
                        Confirm every value against your institution&apos;s protocol before administering.
                    </p>
                </div>

                <div
                    className="rounded-2xl p-5 bg-white mb-4"
                    style={{ border: "1px solid var(--line, #E4E7EC)" }}
                >
                    <h3 className="text-[13px] font-bold mb-3" style={{ color: "var(--ink, #101828)" }}>
                        Patient &amp; IV rate
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <NumberInput
                            flexDirection="col"
                            label="Patient weight (kg)"
                            value={Number(weight)}
                            onChange={setWeight}
                            placeholder="kg"
                        />
                        <NumberInput
                            flexDirection="col"
                            label="IV rate (mL/hr)"
                            value={Number(rate)}
                            onChange={setRate}
                            placeholder="mL/hr"
                        />
                    </div>
                </div>

                {/* Concentration */}
                <div
                    className="rounded-2xl p-5 bg-white mb-4"
                    style={{ border: "1px solid var(--line, #E4E7EC)" }}
                >
                    <h3 className="text-[13px] font-bold mb-3" style={{ color: "var(--ink, #101828)" }}>
                        Concentration
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                        {CONCENTRATIONS.map((opt) => {
                            const selected = conc === opt.value;
                            return (
                                <button
                                    key={opt.short}
                                    type="button"
                                    onClick={() => setConc(opt.value)}
                                    aria-pressed={selected}
                                    className="relative rounded-xl px-2.5 py-2.5 text-left transition-all focus:outline-none focus-visible:ring-2"
                                    style={{
                                        border: selected
                                            ? "1.5px solid var(--teal, #0E7490)"
                                            : "1.5px solid var(--line, #E4E7EC)",
                                        background: selected ? "#ECFEFF" : "white",
                                    }}
                                >
                                    {selected && (
                                        <span
                                            className="absolute top-2 right-2"
                                            style={{ color: "var(--teal, #0E7490)" }}
                                        >
                                            <Check size={13} strokeWidth={3} />
                                        </span>
                                    )}
                                    <div className="font-bold text-[15px]" style={{ color: "var(--ink, #101828)" }}>
                                        {opt.short}
                                    </div>
                                    <div className="text-[11px] mt-0.5" style={{ color: "#667085" }}>
                                        {(opt.value * 1000).toFixed(1)} mcg/mL
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Calculated rate — monitor-style readout */}
                <div className="rounded-2xl p-6" style={{ background: "var(--panel-dark, #0B1220)" }}>
                    <div className="flex items-center gap-2 mb-3">
                        <Activity size={14} style={{ color: "var(--panel-accent, #2DD4BF)" }} />
                        <span
                            className="text-[11px] font-bold uppercase tracking-[0.08em]"
                            style={{ color: "#8B98A9" }}
                        >
                            Calculated infusion rate
                        </span>
                    </div>
                    {result === null ? (
                        <div className="text-[14px]" style={{ color: "#8B98A9" }}>
                            Enter weight and rate to calculate.
                        </div>
                    ) : (
                        <div className="flex items-baseline gap-2">
                            <span
                                className="font-mono text-[40px] font-bold tabular-nums"
                                style={{ color: "var(--panel-accent, #2DD4BF)" }}
                            >
                                {result.toFixed(2)}
                            </span>
                            <span className="text-[13px] font-semibold" style={{ color: "#8B98A9" }}>
                                mcg / kg / min
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}