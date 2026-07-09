import { useState } from "react";
import { CircleCheck, AlertTriangle, Clock, Brain, ShieldAlert, CheckCircle2, CircleX } from "lucide-react";
import NumberInput from "../numberInput";

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
        <div className="pb-5 border-b border-slate-100 last:border-b-0 last:pb-0">
            <p className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
                {icon}
                {title}
            </p>
            {children}
        </div>
    );
}

/** Reusable bulleted list — replaces the ~7 hand-rolled copies of the same markup. */
function BulletList({
    items,
    className = "",
}: {
    items: (string | React.ReactNode)[];
    className?: string;
}) {
    return (
        <ul className={`space-y-1.5 text-sm text-slate-600 ${className}`}>
            {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 pl-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}

/** Consistent header used to open each major stage of the protocol, echoing the
 *  card-level "Management" header so the hierarchy reads clearly at a glance. */
function StageHeader({
    step,
    title,
}: {
    step?: string;
    title: string;
}) {
    return (
        <div className="flex items-center gap-2 mb-3">
            {step && (
                <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    {step}
                </span>
            )}
            <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
        </div>
    );
}

function Callout({
    tone,
    icon,
    children,
}: {
    tone: "amber" | "teal" | "red";
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    const tones = {
        amber: "bg-amber-50 border-amber-200 text-amber-900",
        teal: "bg-teal-50 border-teal-200 text-teal-900",
        red: "bg-red-50 border-red-200 text-red-900",
    };
    return (
        <div className={`rounded-xl border px-4 py-3 flex items-start gap-2.5 ${tones[tone]}`}>
            {icon}
            <p className="text-sm font-semibold leading-snug">{children}</p>
        </div>
    );
}

/* ---------------------------------------------------------- */
/* ManagementSection                                            */
/* ---------------------------------------------------------- */

export default function ManagementSection({ nihssScore }: { nihssScore: number }) {
    const [lastSeen, setLastSeen] = useState<number | undefined>(undefined);
    const [isDisabling, setIsDisabling] = useState<boolean | "">("");
    const [isHemorrhage, setIsHemorrhage] = useState<boolean | "">("");
    const [isContraindicated, setIsContraindicated] = useState<boolean | "">("");

    const eligible =
        isContraindicated === false &&
        isHemorrhage === false &&
        lastSeen !== undefined &&
        Number(lastSeen) <= 4.5 &&
        (isDisabling === true || nihssScore > 5);

    const showCtPrompt = lastSeen !== undefined;
    const inFibrinolysisWindow = lastSeen !== undefined && lastSeen <= 4.5;
    const outsideFibrinolysisWindow = isHemorrhage === false && lastSeen !== undefined && lastSeen > 4.5;
    const inThrombectomyWindow = isHemorrhage === false && lastSeen !== undefined && lastSeen <= 24;
    const fibrinolysisAnswered =
        eligible === false && isHemorrhage !== "" && isDisabling !== "" && isContraindicated !== "";

    return (
        <div className="rounded-2xl p-5 mt-4 bg-white border border-slate-100 shadow-sm">
            {/* Card header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                    <Clock size={16} className="text-teal-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Management</h3>
            </div>

            {/* Everything below shares one consistent vertical rhythm via space-y-5,
                so stages no longer rely on ad-hoc mt-3 / mt-4 / mt-5 spacing. */}
            <div className="space-y-5">

                {/* Step 1 — onset time */}
                <section>
                    <StageHeader step="1" title="Time since onset" />
                    <NumberInput
                        label="Time since last well seen (hr)"
                        value={Number(lastSeen)}
                        onChange={setLastSeen}
                        placeholder="Time since last well seen (hr)"
                    />
                </section>

                {/* Step 2 — CT + hemorrhage check */}
                {showCtPrompt && (
                    <section className="space-y-4">
                        <StageHeader step="2" title="Rule out hemorrhage" />
                        <Callout tone="amber" icon={<AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />}>
                            Perform CT brain non-contrast to rule out hemorrhagic stroke
                        </Callout>
                        <QuestionBlock
                            icon={<Brain size={15} className="text-slate-500" />}
                            title="Is there intracranial hemorrhage?"
                        >
                            <YesNoToggle value={isHemorrhage} onChange={setIsHemorrhage} />
                        </QuestionBlock>
                    </section>
                )}

                {/* Step 3 — branch on window + hemorrhage status */}
                {inFibrinolysisWindow && (
                    <section className="space-y-4">


                        {/* 3b — no hemorrhage: fibrinolysis eligibility questions */}
                        {isHemorrhage === false && (
                            <div className="space-y-0">
                                <StageHeader step="3" title="Fibrinolysis guide" />
                                <div className="space-y-0">
                                    <QuestionBlock
                                        icon={<ShieldAlert size={15} className="text-slate-500" />}
                                        title="Does the patient have disabling stroke symptoms?"
                                    >
                                        <BulletList
                                            className="mt-2 mb-2"
                                            items={[
                                                "Complete hemianopia",
                                                "Severe aphasia",
                                                "Visual or sensory extinction",
                                                "Weakness limit sustained effort against gravity",
                                                <span className="inline-flex items-center gap-1.5">
                                                    NIHSS &gt; 5
                                                    {nihssScore > 5 && <CircleCheck size={15} className="text-teal-600" />}
                                                </span>,
                                            ]}
                                        />
                                        <YesNoToggle value={isDisabling} onChange={setIsDisabling} />
                                    </QuestionBlock>

                                    <QuestionBlock
                                        icon={<AlertTriangle size={15} className="text-slate-500" />}
                                        title="Any contraindications for fibrinolysis?"
                                    >
                                        <BulletList
                                            className="mt-2 mb-2"
                                            items={[
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
                                            ]}
                                        />
                                        <YesNoToggle value={isContraindicated} onChange={setIsContraindicated} />
                                    </QuestionBlock>
                                </div>
                            </div>
                        )}

                        {/* Fibrinolysis verdicts */}
                        {isHemorrhage === false && eligible && (
                            <Callout tone="teal" icon={<CheckCircle2 size={18} className="text-teal-600 shrink-0" />}>
                                Patient is eligible for fibrinolysis
                            </Callout>
                        )}
                        {fibrinolysisAnswered && (
                            <Callout tone="red" icon={<CircleX size={18} className="text-red-600 shrink-0" />}>
                                Patient is not eligible for fibrinolysis
                            </Callout>
                        )}
                    </section>
                )}
                {isHemorrhage === true && (
                    <div className="space-y-3">
                        <StageHeader step="3" title="Hemorrhagic stroke guide" />

                        <div className="rounded-lg border border-slate-200 p-3">
                            <div className="font-semibold text-sm text-slate-800">Neurosurgical consultation</div>
                            <p className="text-sm text-slate-500 mt-0.5">Indications for emergency surgery include</p>
                            <BulletList
                                className="mt-2"
                                items={[
                                    "Cerebellar hematoma diameter >3 cm or causing brainstem compression",
                                    "Intraventricular hemorrhage with hydrocephalus associated with acute neurologic deterioration",
                                    "Supratentorial hematoma associated with acute neurologic deterioration and life-threatening brain compression or hydrocephalus",
                                ]}
                            />
                        </div>

                        <div className="rounded-lg border border-slate-200 p-3">
                            <div className="font-semibold text-sm text-slate-800">Manage BP</div>
                            <div className="mt-2 space-y-2">
                                {[
                                    {
                                        drug: "Nicardipine",
                                        dose: "20 mg in NSS up to 200 mL IV",
                                        detail: "Start 50 mL/hr (5 mg/hr). Titrate by 25 mL/hr q10min. Target SBP 130–150 mmHg.",
                                        max: "Max 15 mg/h",
                                    },
                                    {
                                        drug: "Labetalol",
                                        dose: "20 mg IV over 2 min",
                                        detail: "May repeat q10min, increasing dose (20, 40, 80 mg) as needed.",
                                        max: "Max cumulative dose 300 mg",
                                    },
                                ].map((med) => (
                                    <div key={med.drug} className="rounded-md border border-slate-200 px-3 py-2">
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-bold text-sm text-slate-800">{med.drug}</span>
                                            <span className="text-sm text-slate-700">{med.dose}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">{med.detail}</p>
                                        <p className="text-xs text-red-700 font-medium mt-1">{med.max}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-lg border border-slate-200 p-3">
                            <div className="font-semibold text-sm text-slate-800">Manage ICP</div>
                            <BulletList
                                className="mt-2"
                                items={[
                                    "Elevate bed 30°",
                                    "Maintain neutral head positioning",
                                    "Use isotonic solutions for volume resuscitation and maintenance fluids; keep serum sodium >135 mEq/L",
                                    "Check GCS and pupils q1hr",
                                ]}
                            />
                            <div className="mt-2 rounded-md border border-slate-200 px-3 py-2">
                                <p className="text-xs font-medium text-slate-700 mb-1">
                                    Hyperosmolar therapy, if signs of increased ICP
                                </p>
                                <BulletList
                                    items={[
                                        "20% mannitol 1 g/kg IV bolus",
                                        "or Hypertonic saline 23.4%: 15–30 mL IV bolus",
                                    ]}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Outside the fibrinolysis window entirely */}
                {outsideFibrinolysisWindow && (
                    <Callout tone="red" icon={<CircleX size={18} className="text-red-600 shrink-0" />}>
                        Patient is not eligible for fibrinolysis
                    </Callout>
                )}

                {/* Step 4 — thrombectomy */}
                {inThrombectomyWindow && (
                    <section className="space-y-3">
                        <StageHeader step="4" title="Mechanical thrombectomy guide" />
                        <Callout tone="amber" icon={<AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />}>
                            <span className="font-medium">
                                Patient might be eligible for <b>mechanical thrombectomy</b>. Perform a vascular study (<b>CTA or MRA</b>) to evaluate large vessel occlusion.
                            </span>
                        </Callout>

                        {lastSeen <= 6 ? (
                            <div>
                                <p className="font-semibold text-sm text-slate-800 mb-2">Early window mechanical thrombectomy</p>
                                <BulletList
                                    items={[
                                        "CTA shows internal carotid artery or M1 MCA occlusion",
                                        <span className="font-bold text-teal-600">Within 6 hours of last well seen</span>,
                                        <span className={`font-bold ${nihssScore < 6 ? "text-red-600" : "text-teal-600"}`}>NIHSS ≥ 6</span>,
                                        "ASPECTS 3–10",
                                        "Pre-stroke mRS 0–1",
                                    ]}
                                />
                            </div>
                        ) : (
                            <div>
                                <p className="font-semibold text-sm text-slate-800 mb-2">Extended window mechanical thrombectomy</p>
                                <BulletList
                                    items={[
                                        "CTA shows internal carotid artery or M1 MCA occlusion",
                                        <span className="font-bold text-teal-600">6-24 hours since last well seen</span>,
                                        <span className={`font-bold ${nihssScore < 6 ? "text-red-600" : "text-teal-600"}`}>NIHSS ≥ 6</span>,
                                        "ASPECTS ≥ 6",
                                        "Pre-stroke mRS 0–1",
                                        "Advanced neuroimaging (CT perfusion / MRI) is no longer required according to the latest AHA / ASA recommendation",
                                    ]}
                                />
                            </div>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
}