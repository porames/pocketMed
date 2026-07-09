import { ReactNode } from "react"
export default function RadioBlock({ formName, textLabel, id, checked, onChange }: { formName: string; textLabel: ReactNode; id: string; checked: boolean; onChange: (id: string) => void }) {
    return (
        <label className="relative cursor-pointer">
            <input
                type="radio" name={formName} value={id} className="peer sr-only" checked={checked}
                onChange={() => onChange(id)}
            />
            <div className="rounded-xl border-2 border-gray-200 p-4 text-center
                peer-checked:border-teal-600 peer-checked:bg-teal-50
                peer-focus-visible:ring-2 peer-focus-visible:ring-teal-400
                transition">
                <p className="font-medium text-gray-900 text-sm">{textLabel}</p>
            </div>
        </label>
    )
}