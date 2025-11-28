import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import React from "react";

interface GlassButtonProps extends HTMLMotionProps<"button"> {
    children: React.ReactNode;
    className?: string;
    variant?: "primary" | "secondary" | "danger";
}

export function GlassButton({
    children,
    className,
    variant = "primary",
    ...props
}: GlassButtonProps) {
    const variants = {
        primary: "bg-black/5 hover:bg-black/10 text-gray-900",
        secondary: "bg-white/40 hover:bg-white/60 text-gray-700",
        danger: "bg-red-50 hover:bg-red-100 text-red-600 border-red-200",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
                "glass-button rounded-lg px-4 py-2 font-medium transition-colors",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </motion.button>
    );
}
