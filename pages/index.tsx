import React from "react";
import Link from 'next/link';

/* ---------------------------------------------------------
   Fonts + tokens
--------------------------------------------------------- */
function Tokens() {
    return (
        <style>{`
      .mono { font-family: 'IBM Plex Mono', monospace; font-weight: 600; }

    `}</style>
    );
}

interface CategoryTileProps {
    href: string;
    title: string;
    gradient: string;
    disabled?: boolean;
}

function CategoryTile({ href, title, gradient, disabled }: CategoryTileProps) {
    const content = (
        <button
            disabled={disabled}
            className="tile rounded-xl py-5 px-4 flex items-center justify-start text-left w-full disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: gradient, border: 'none', height: '100%' }}
        >
            <span className="text-base font-bold text-white">{title}</span>
        </button>
    );

    if (disabled) return content;

    return (
        <Link href={href} className="block">
            {content}
        </Link>
    );
}

function Eyebrow({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "teal" }) {
    const colors: Record<"muted" | "teal", string> = {
        muted: "var(--muted)",
        teal: "var(--teal)",
    };
    return (
        <p
            className="text-xs font-semibold tracking-wide uppercase mb-1"
            style={{ color: colors[tone], letterSpacing: "0.06em" }}
        >
            {children}
        </p>
    );
}

export default function Home() {
    return (
        <div className="elyte-root min-h-screen w-full flex justify-center p-6">
            <Tokens />
            <div className="w-full max-w-md">
                <div>
                    <Eyebrow tone="teal">Porames PocketMed</Eyebrow>
                    <h1 className="text-2xl font-semibold mb-1">
                        Emergency Room Pocket References{" "}
                        <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 inset-ring inset-ring-red-600/10">
                            BETA
                        </span>
                    </h1>
                    <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
                        References for your ER decisions
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        <CategoryTile
                            href="/elyte"
                            title="Electrolytes"
                            gradient="linear-gradient(135deg, #2F9E68, #15734A)"
                        />
                        <CategoryTile
                            href="/stroke"
                            title="Stroke"
                            gradient="linear-gradient(135deg, #D8453A, #8E2A22)"
                        />
                        <CategoryTile
                            href="/high_alert_drug"
                            title="High Alert Drug"
                            gradient="linear-gradient(135deg, #E63946, #F4A300)"
                        />
                        <CategoryTile
                            href="/acute_coronary_syndrome"
                            title="Acute Coronary Syndrome"
                            gradient="linear-gradient(135deg, #FF6B6B, #C1121F)"
                            disabled={true}
                        />
                        <CategoryTile
                            href="/traumatic_brain_injury"
                            title="Traumatic Brain Injury"
                            gradient="linear-gradient(135deg, #5B4B8A, #2E1F47)"
                            disabled={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}