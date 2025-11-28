import { cn } from "@/lib/utils";
import React from "react";

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
    ({ className, ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={cn(
                    "glass-input w-full rounded-lg px-4 py-2",
                    className
                )}
                {...props}
            />
        );
    }
);
GlassInput.displayName = "GlassInput";
