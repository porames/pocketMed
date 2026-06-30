import { useState, ChangeEvent } from "react";
import { CircleCheck, AlertTriangle, Clock, Brain, ShieldAlert, CheckCircle2, CircleX } from "lucide-react";

/* ---------------------------------------------------------- */
/* TextInput                                                   */
/* ---------------------------------------------------------- */

interface TextInputProps {
    label?: string;
    value: string | number;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    error?: string;
    type?: string;
}

function TextInput({
    label,
    value,
    onChange,
    placeholder,
    error,
    type = "text",
}: TextInputProps) {
    return (
        <div className="flex flex-col gap-1.5 mb-4">
            {label && (
                <label className="text-sm font-medium text-slate-600">{label}</label>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full px-3.5 py-2.5 border rounded-lg text-sm text-slate-900 placeholder-slate-400 bg-slate-50
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 focus:bg-white
          ${error ? "border-red-400" : "border-slate-200"}`}
            />
            {error && (
                <span className="text-xs text-red-500 font-medium">{error}</span>
            )}
        </div>
    );
}

/* ---------------------------------------------------------- */
/* Shared bits                                                  */
/* ---------------------------------------------------------- */

function YesNoToggle({
    value,
    onChange,
}: {
    value: boolean | "";
    onChange: (v: boolean) => void;
}) {
    return (
        <div className="inline-flex rounded-lg overflow-hidden border border-slate-200 shadow-sm mt-2">
            {[true, false].map((v) => {
                const active = value === v;
                return (
                    <button
                        key={String(v)}
                        onClick={() => onChange(v)}
                        className={`px-5 py-1.5 text-sm font-semibold transition-colors duration-150
              ${active
                                ? v
                                    ? "bg-teal-600 text-white"
                                    : "bg-slate-700 text-white"
                                : "bg-white text-slate-500 hover:bg-slate-50"
                            }
              ${v ? "" : "border-l border-slate-200"}`}
                    >
                        {v ? "Yes" : "No"}
                    </button>
                );
            })}
        </div>
    );
}

function QuestionBlock({
    icon,
    title,
    children,
}: {
    icon?: React.ReactNode;
    title: string;
    children?: React.ReactNode;
}) {
    return (
        <div className="mt-5 pt-5 border-t border-slate-100">
            <p className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
                {icon}
                {title}
            </p>
            {children}
        </div>
    );
}

/* ---------------------------------------------------------- */
/* ManagementSection                                            */
/* ---------------------------------------------------------- */

export default function ManagementSection({ nihssScore }: { nihssScore: number }) {
    const [lastSeen, setLastSeen] = useState<number | "">("");
    const [isDisabling, setIsDisabling] = useState<boolean | "">("");
    const [isHemorrhage, setIsHemorrhage] = useState<boolean | "">("");
    const [isContraindicated, setIsContraindicated] = useState<boolean | "">("");

    const eligible =
        isContraindicated === false &&
        isHemorrhage === false &&
        lastSeen !== "" &&
        lastSeen !== undefined &&
        Number(lastSeen) <= 4.5 &&
        (isDisabling === true || nihssScore > 5);

    return (
        <div className="rounded-2xl p-5 mt-4 bg-white border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                    <Clock size={16} className="text-teal-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Management</h3>
            </div>

            <TextInput
                label="Time since last well seen (hr)"
                value={lastSeen ?? ""}
                type="number"
                onChange={(e) => setLastSeen(Number(e.target.value))}
                placeholder="Last well seen (hr)"
            />

            {lastSeen !== "" && lastSeen <= 4.5 && (
                <>
                    <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-2.5">
                        <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                        <p className="text-sm text-amber-900 font-medium leading-snug">
                            Perform CT brain non-contrast to rule out hemorrhagic stroke
                        </p>
                    </div>

                    <QuestionBlock
                        icon={<Brain size={15} className="text-slate-500" />}
                        title="Is there intracranial hemorrhage?"
                    >
                        <YesNoToggle value={isHemorrhage} onChange={setIsHemorrhage} />
                    </QuestionBlock>

                    <QuestionBlock
                        icon={<ShieldAlert size={15} className="text-slate-500" />}
                        title="Does the patient have disabling stroke symptoms?"
                    >
                        <ul className="mt-2 space-y-1.5">
                            {[
                                "Complete hemianopia",
                                "Severe aphasia",
                                "Visual or sensory extinction",
                                "Weakness limit sustained effort against gravity",
                            ].map((item) => (
                                <li
                                    key={item}
                                    className="flex items-center gap-2 text-sm text-slate-600 pl-1"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                                    {item}
                                </li>
                            ))}
                            <li className="flex items-center gap-2 text-sm pl-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                                <span className="inline-flex items-center gap-1.5 text-slate-600">
                                    NIHSS &gt; 5
                                    {nihssScore > 5 && (
                                        <CircleCheck size={15} className="text-teal-600" />
                                    )}
                                </span>
                            </li>
                        </ul>
                        <YesNoToggle value={isDisabling} onChange={setIsDisabling} />
                    </QuestionBlock>

                    <QuestionBlock
                        icon={<AlertTriangle size={15} className="text-slate-500" />}
                        title="Any contraindications for fibrinolysis?"
                    >
                        <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
                            {[
                                "Ischemic stroke in 3 months",
                                "Severe head trauma in 3 months",
                                "Intracranial, spinal surgery in 3 moths",
                                "Current or past intracranial hemorrhage",
                                "Intra-axial intracranial neoplasm",
                                "GI malignancy, hemorrhage in 21 days",
                                "Symptoms of SAH",
                                "Persistent BP elevation BP \u2265 185/110",
                                "Active internal bleeding",
                                "Suspected infective endocarditis or aortic disssection",
                                "Platelet count < 100,000/mm3* (\u0E44\u0E21\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E23\u0E2D\u0E1C\u0E25\u0E16\u0E49\u0E32\u0E44\u0E21\u0E48\u0E2A\u0E07\u0E2A\u0E31\u0E22\u0E21\u0E35 coagulopathy)",
                                "Current anticoagulant use with an INR > 1.7 or PT > 15 seconds or aPTT > 40 seconds*",
                                "Therapeutic doses of low molecular weight heparin received within 24 hours (eg, to treat VTE and ACS); this exclusion does not apply to prophylactic doses (eg, to prevent VTE)",
                                "Current use of a direct thrombin inhibitor or direct factor Xa inhibitor with evidence of anticoagulant effect by laboratory tests",
                            ].map((item) => (
                                <li key={item} className="flex items-start gap-2 pl-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                        <YesNoToggle value={isContraindicated} onChange={setIsContraindicated} />
                    </QuestionBlock>

                    {eligible && (
                        <div className="mt-5 rounded-xl bg-teal-50 border border-teal-200 px-4 py-3 flex items-center gap-2.5">
                            <CheckCircle2 size={18} className="text-teal-600 shrink-0" />
                            <p className="text-sm font-semibold text-teal-900">
                                Patient is eligible for fibrinolysis
                            </p>
                        </div>
                    )}
                    {(eligible === false && isHemorrhage !== "" && isDisabling !== "" && isContraindicated !== "") && (
                        <div className="mt-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex items-center gap-2.5">
                            <CircleX size={18} className="text-red-600 shrink-0" />
                            <p className="text-sm font-semibold text-red-900">
                                Patient is not eligible for fibrinolysis
                            </p>
                        </div>
                    )
                    }
                </>
            )}
            {lastSeen !== "" && lastSeen > 4.5 &&
                <div className="mt-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex items-center gap-2.5">
                    <CircleX size={18} className="text-red-600 shrink-0" />
                    <p className="text-sm font-semibold text-red-900">
                        Patient is not eligible for fibrinolysis
                    </p>
                </div>
            }
            {lastSeen !== "" && lastSeen <= 24 &&
                <div className="mt-5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-2.5">
                    <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-amber-900 font-medium leading-snug">
                        Patient might be eligible for <b>mechanical thrombectomy</b>. Perform a vascular study (<b>CTA or MRA</b>) to evaluate large vessel occlusion.
                    </p>
                </div>
            }
        </div>
    );
}