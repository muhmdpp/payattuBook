'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Step, CallBackProps } from 'react-joyride';

// Dynamically import Joyride to avoid Next.js SSR hydration mismatch with window/document
const Joyride = dynamic(() => import('react-joyride'), { ssr: false });

export default function Walkthrough() {
    const [run, setRun] = useState(false);

    useEffect(() => {
        // Provide a tiny delay to ensure the DOM elements (like BottomNav) are painted
        const timer = setTimeout(() => {
            const hasSeenOnboarding = localStorage.getItem('payattu_onboarding_completed');
            const hasSeenTour = localStorage.getItem('payattu_tour_completed');

            if (hasSeenOnboarding && !hasSeenTour) {
                setRun(true);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const steps: Step[] = [
        {
            target: 'body',
            content: 'Welcome to your PayattuBook Dashboard! Let me show you around really quickly.',
            placement: 'center',
            disableBeacon: true,
        },
        {
            target: '#tour-action-grid',
            content: 'Use these quick actions to record any money you Give, any money you Receive, or to schedule an upcoming Payattu.',
            disableBeacon: true,
        },
        {
            target: '#tour-nav-members',
            content: 'Head over to the Members tab to manage everyone and view the authentic, digitized Physical Ledger Book view.',
            disableBeacon: true,
        },
        {
            target: '#tour-fab',
            content: 'Use the big purple button to rapidly add old history from physical books into the app.',
            disableBeacon: true,
        }
    ];

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status } = data;
        const finishedStatuses: string[] = ['finished', 'skipped'];
        if (finishedStatuses.includes(status)) {
            localStorage.setItem('payattu_tour_completed', 'true');
            setRun(false);
        }
    };

    if (!run) return null;

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showSkipButton
            showProgress
            callback={handleJoyrideCallback}
            styles={{
                options: {
                    primaryColor: '#5B21B6',
                    zIndex: 10000,
                }
            }}
        />
    );
}
