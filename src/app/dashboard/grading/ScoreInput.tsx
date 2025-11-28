import React, { useEffect, useRef, useState } from "react";

interface ScoreInputProps {
    value: number | string;
    max: number;
    onChange: (val: string) => void;
    isPending?: boolean;
}

export default function ScoreInput({ value, max, onChange, isPending }: ScoreInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [localValue, setLocalValue] = useState(value);

    // Sync local value with prop value
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
            e.preventDefault();
            const currentCell = inputRef.current?.closest("td");
            const currentRow = currentCell?.parentElement;

            if (!currentCell || !currentRow) return;

            const cellIndex = Array.from(currentRow.children).indexOf(currentCell);
            const rowIndex = Array.from(currentRow.parentElement?.children || []).indexOf(currentRow);

            let targetInput: HTMLInputElement | null = null;

            if (e.key === "ArrowUp") {
                const prevRow = currentRow.previousElementSibling;
                if (prevRow) {
                    targetInput = prevRow.children[cellIndex]?.querySelector("input");
                }
            } else if (e.key === "ArrowDown") {
                const nextRow = currentRow.nextElementSibling;
                if (nextRow) {
                    targetInput = nextRow.children[cellIndex]?.querySelector("input");
                }
            } else if (e.key === "ArrowLeft") {
                const prevCell = currentCell.previousElementSibling;
                if (prevCell) {
                    targetInput = prevCell.querySelector("input");
                }
            } else if (e.key === "ArrowRight") {
                const nextCell = currentCell.nextElementSibling;
                if (nextCell) {
                    targetInput = nextCell.querySelector("input");
                }
            }

            if (targetInput) {
                targetInput.focus();
                targetInput.select();
            }
        }
    };

    return (
        <div className="relative flex items-center justify-center">
            <input
                ref={inputRef}
                type="number"
                min="0"
                max={max}
                className={`w-16 rounded border p-1 text-center focus:outline-none transition-colors ${isPending
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-gray-200 bg-white/50 focus:border-blue-500"
                    }`}
                value={localValue}
                onChange={(e) => {
                    setLocalValue(e.target.value);
                    onChange(e.target.value);
                }}
                onKeyDown={handleKeyDown}
            />
            {isPending && (
                <div className="absolute -right-2 top-1 h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
            )}
        </div>
    );
}
