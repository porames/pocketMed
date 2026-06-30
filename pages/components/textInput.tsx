import { ChangeEvent } from "react";

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
        <div className="flex flex-col gap-1 mb-3">
            {label && (
                <label className="text-sm font-medium text-gray-700">{label}</label>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${error ? "border-red-500" : "border-gray-300"}`}
            />
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
}

export default TextInput;