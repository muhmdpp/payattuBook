'use client';

import React from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineFallback() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gray-50 dark:bg-gray-900">
            <WifiOff className="w-16 h-16 mb-4 text-gray-400" />
            <h1 className="text-2xl font-bold mb-2">You are offline</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
                Please check your internet connection to continue using Payattu Book.
            </p>
            <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium shadow hover:bg-purple-700 transition"
            >
                Retry
            </button>
        </div>
    );
}
