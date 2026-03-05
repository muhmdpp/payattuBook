'use client';

import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

// Define the beforeinstallprompt event interface
interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);

    useEffect(() => {
        // Check if user is on iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIOSDevice);

        // Check if app is already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as unknown as { standalone?: boolean }).standalone === true;

        if (isStandalone) {
            return; // Don't show if already installed
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Update UI notify the user they can install the PWA
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // If it's iOS and not standalone, show custom iOS prompt after a short delay
        if (isIOSDevice && !isStandalone) {
            const timer = setTimeout(() => {
                setShowPrompt(true);
            }, 3000);
            return () => clearTimeout(timer);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (isIOS) {
            setShowIOSInstructions(true);
            return;
        }

        if (!deferredPrompt) {
            return;
        }

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setShowPrompt(false);
        }

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
    };

    if (!showPrompt) return null;

    if (showIOSInstructions) {
        return (
            <div className="fixed bottom-4 left-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 animate-in slide-in-from-bottom-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">Install Payattu Book</h3>
                    <button onClick={() => setShowPrompt(false)} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    To install this app on your iPhone or iPad:
                </p>
                <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                    <li>Tap the <strong>Share</strong> button at the bottom of your browser.</li>
                    <li>Scroll down and tap <strong>Add to Home Screen</strong> <span className="inline-block p-1 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">+</span></li>
                </ol>
                <button
                    onClick={() => setShowIOSInstructions(false)}
                    className="w-full py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium"
                >
                    Got it
                </button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 flex items-center justify-between animate-in slide-in-from-bottom-5">
            <div className="flex flex-col mr-4">
                <span className="font-medium">Install Payattu Book</span>
                <span className="text-xs text-gray-500">Access offline and from your home screen</span>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setShowPrompt(false)}
                    className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                    <X size={20} />
                </button>
                <button
                    onClick={handleInstallClick}
                    className="flex items-center gap-1 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium text-sm shadow hover:bg-purple-700 transition"
                >
                    <Download size={16} />
                    Install
                </button>
            </div>
        </div>
    );
}
