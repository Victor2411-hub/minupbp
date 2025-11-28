import React, { useEffect, useRef, useState } from "react";

interface ScoreInputProps {
    value: number | string;
    max: number;
    onChange: (val: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    isPending?: boolean;
    presence?: { userId: string };
    autoFocus?: boolean;
}

export default function ScoreInput({ value, max, onChange, onFocus, onBlur, isPending, presence, autoFocus }: ScoreInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [localValue, setLocalValue] = useState(value);
    const [isFocused, setIsFocused] = useState(false);

    // Restore focus if autoFocus is true (on mount or update)
    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
            // Optional: Select text? Or keep cursor at end?
            // For now, just focus.
        }
    }, [autoFocus]);

    // Sync local value with prop value ONLY if not focused
    useEffect(() => {
        if (!isFocused) {
            setLocalValue(value);
        }
    }, [value, isFocused]);

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

    const isLocked = !!presence;

    return (
        <div className="relative flex items-center justify-center group">
            <input
                ref={inputRef}
                type="number"
                min="0"
                max={max}
                disabled={isLocked}
                onFocus={() => {
                    setIsFocused(true);
                    onFocus?.();
                }}
                onBlur={() => {
                    setIsFocused(false);
                    onBlur?.();
                }}
                className={`w-16 rounded border p-1 text-center focus:outline-none transition-all duration-300 ${isPending
                    ? "border-yellow-400 bg-yellow-50"
                    : isLocked
                        ? "border-purple-500 bg-purple-50 ring-2 ring-purple-200"
                        : "border-gray-200 bg-white/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
            {isLocked && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] px-1.5 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    Editando...
                </div>
            )}
        </div>
    );
}
