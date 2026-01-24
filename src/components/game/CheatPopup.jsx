import React from 'react';

export default function CheatPopup({ onActivate, onCancel }) {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90">
            <div className="bg-black border-4 border-green-500 p-8 font-mono shadow-[0_0_50px_rgba(0,255,0,0.5)]">
                <h2 className="text-3xl font-black text-green-500 tracking-wider mb-6 animate-pulse text-center">
                    ENABLE CHEATS?
                </h2>
                <div className="flex gap-4">
                    <button
                        onClick={onActivate}
                        className="px-8 py-3 bg-green-500/20 border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-black font-bold transition-all"
                    >
                        [ACTIVATE]
                    </button>
                    <button
                        onClick={onCancel}
                        className="px-8 py-3 bg-red-500/20 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-black font-bold transition-all"
                    >
                        [CANCEL]
                    </button>
                </div>
            </div>
        </div>
    );
}