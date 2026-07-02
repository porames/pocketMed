
interface NumberInputProps {
    label: string;
    value: number | undefined;
    onChange: (value: number | undefined) => void;
    placeholder?: string;
    unit?: string;
    flexDirection?: string;
}

export default function NumberInput({ label, value, onChange, placeholder, unit, flexDirection }: NumberInputProps) {
    return (
        <div className={`flex ${flexDirection == "row" ? "flex-row" : "flex-col"} gap-1 mb-3`}>
            <label className="w-44 text-sm font-medium" style={{ color: "var(--muted)" }}>{label}</label>
            <div className="flex-1 flex items-center">
                <input
                    type="number"
                    value={value ?? ""}
                    onChange={(e) => {
                        const v = e.target.value;
                        onChange(v === "" ? undefined : Number(v));
                    }}
                    onKeyDown={(e) => { if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault(); }}
                    placeholder={placeholder}
                    className="focus-ring flex-1 rounded-lg px-3 py-2 text-sm bg-white"
                    style={{ border: "1px solid var(--border)" }}
                />
                {unit && <span className="ml-2 text-xs" style={{ color: "var(--muted)" }}>{unit}</span>}
            </div>
        </div>
    );
}