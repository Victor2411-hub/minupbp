import React from "react";
import { X } from "lucide-react";

interface GlassModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function GlassModal({ isOpen, onClose, title, children }: GlassModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/20 bg-white/30 p-6 shadow-xl backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 hover:bg-white/20 transition-colors"
                    >
                        <X className="h-6 w-6 text-gray-700" />
                    </button>
                </div>
                <div className="overflow-y-auto max-h-[70vh]">
                    {children}
                </div>
            </div>
        </div>
    );
}
