'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { X, Share, ArrowDownToLine } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

type PromptState = 'hidden' | 'banner' | 'ios-instructions';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [state, setState] = useState<PromptState>('hidden');
    const [isIOS, setIsIOS] = useState(false);
    const [visible, setVisible] = useState(false); // controls CSS transition

    useEffect(() => {
        const ua = window.navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(ua);
        setIsIOS(ios);

        // Don't show if already running as installed PWA
        const isStandalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as unknown as { standalone?: boolean }).standalone === true;
        if (isStandalone) return;

        if (ios) {
            const t = setTimeout(() => {
                setState('banner');
                setTimeout(() => setVisible(true), 50);
            }, 2500);
            return () => clearTimeout(t);
        }

        // Check if the event was already captured by our inline global script (before React loaded)
        const globalPrompt = (window as unknown as { __pwaInstallPrompt?: BeforeInstallPromptEvent }).__pwaInstallPrompt;
        if (globalPrompt) {
            setDeferredPrompt(globalPrompt);
            setState('banner');
            setTimeout(() => setVisible(true), 50);
        }

        // Also listen for any future events
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setState('banner');
            setTimeout(() => setVisible(true), 50);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);


    const dismiss = useCallback(() => {
        setVisible(false);
        setTimeout(() => setState('hidden'), 300);
    }, []);

    const handleInstall = useCallback(async () => {
        if (isIOS) {
            setState('ios-instructions');
            return;
        }
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') dismiss();
        setDeferredPrompt(null);
    }, [isIOS, deferredPrompt, dismiss]);

    if (state === 'hidden') return null;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={dismiss}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.4)',
                    zIndex: 999,
                    opacity: visible ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                    backdropFilter: 'blur(2px)',
                    WebkitBackdropFilter: 'blur(2px)',
                }}
            />

            {/* Bottom Sheet */}
            <div
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: '50%',
                    transform: visible
                        ? 'translateX(-50%) translateY(0)'
                        : 'translateX(-50%) translateY(100%)',
                    width: '100%',
                    maxWidth: '420px',
                    background: 'white',
                    borderRadius: '20px 20px 0 0',
                    boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
                    overflow: 'hidden',
                }}
            >
                {/* Drag handle */}
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '12px' }}>
                    <div style={{ width: 40, height: 4, borderRadius: 99, background: '#E5E7EB' }} />
                </div>

                {state === 'banner' && (
                    <div style={{ padding: '20px 24px 32px' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={dismiss}
                                style={{ color: '#9CA3AF', padding: 4 }}
                                aria-label="Dismiss"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* App identity */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                            {/* App Icon */}
                            <div style={{
                                width: 64,
                                height: 64,
                                borderRadius: 16,
                                background: 'linear-gradient(135deg, #3B0764, #7C3AED)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                boxShadow: '0 4px 16px rgba(91,33,182,0.35)',
                            }}>
                                <img
                                    src="/icon-192x192.png"
                                    alt="PayattuBook"
                                    style={{ width: 48, height: 48, borderRadius: 12 }}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            </div>
                            <div>
                                <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827', lineHeight: 1.2 }}>
                                    PayattuBook
                                </p>
                                <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: 3 }}>
                                    Add to your Home Screen
                                </p>
                            </div>
                        </div>

                        {/* Feature pills */}
                        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                            {['Works Offline', 'Fast & Native', 'No App Store'].map(f => (
                                <span key={f} style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    color: '#5B21B6',
                                    background: '#EDE9FE',
                                    borderRadius: 99,
                                    padding: '4px 10px',
                                }}>
                                    ✦ {f}
                                </span>
                            ))}
                        </div>

                        {/* CTA */}
                        <button
                            onClick={handleInstall}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: 'linear-gradient(135deg, #3B0764, #7C3AED)',
                                color: 'white',
                                borderRadius: 14,
                                fontWeight: 700,
                                fontSize: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                boxShadow: '0 4px 20px rgba(91,33,182,0.4)',
                                cursor: 'pointer',
                                border: 'none',
                                letterSpacing: '0.01em',
                            }}
                        >
                            <ArrowDownToLine size={20} />
                            {isIOS ? 'How to Install' : 'Install App'}
                        </button>

                        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#9CA3AF', marginTop: 12 }}>
                            Free · No storage needed · Instant
                        </p>
                    </div>
                )}

                {state === 'ios-instructions' && (
                    <div style={{ padding: '20px 24px 36px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <p style={{ fontWeight: 700, fontSize: '1.05rem', color: '#111827' }}>
                                Add to Home Screen
                            </p>
                            <button onClick={dismiss} style={{ color: '#9CA3AF' }} aria-label="Close">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Steps */}
                        {[
                            { icon: <Share size={22} color="#5B21B6" />, label: 'Tap the Share button', sub: 'Bottom of your Safari browser' },
                            { icon: <span style={{ fontSize: '1.3rem' }}>+</span>, label: 'Tap "Add to Home Screen"', sub: 'Scroll down in the share menu' },
                            { icon: <span style={{ fontSize: '1.3rem' }}>✓</span>, label: 'Tap "Add" to confirm', sub: 'The app icon will appear instantly' },
                        ].map((step, i) => (
                            <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'flex-start' }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12,
                                    background: '#F5F3FF',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#5B21B6', fontWeight: 700, fontSize: '1.1rem',
                                    flexShrink: 0,
                                }}>
                                    {step.icon}
                                </div>
                                <div>
                                    <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>{step.label}</p>
                                    <p style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: 2 }}>{step.sub}</p>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={dismiss}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: '#F3F4F6',
                                color: '#374151',
                                borderRadius: 12,
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            Got it!
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
