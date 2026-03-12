"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookHeart, FileWarning, ShieldCheck } from 'lucide-react';
import './Onboarding.css';

const SLIDES = [
    {
        title: "What is Payattu?",
        description: "A beautiful cultural tradition of community financial support. Friends and family come together to contribute money for important life events, building a safety net through mutual trust.",
        icon: <BookHeart size={56} color="white" />
    },
    {
        title: "The Old Way is Hard",
        description: "Writing complex return math in physical notebooks leads to lost books, confused calculations, and awkward conversations trying to remember exactly who owes what during the next event.",
        icon: <FileWarning size={56} color="white" />
    },
    {
        title: "PayattuBook, Digitized",
        description: "Your digital ledger. Record payments in seconds, automatically calculate complex balances, and maintain perfect relationships with flawless, secure accounting.",
        icon: <ShieldCheck size={56} color="white" />
    }
];

export default function OnboardingPage() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const router = useRouter();

    const handleNext = () => {
        if (currentSlide < SLIDES.length - 1) {
            setCurrentSlide(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        localStorage.setItem('payattu_onboarding_completed', 'true');
        router.replace('/');
    };

    return (
        <div className="onboarding-page">
            <div className="onboarding-carousel">
                {SLIDES.map((slide, index) => (
                    <div
                        key={index}
                        className="onboarding-slide"
                        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                        <div className="onboarding-icon-container">
                            {slide.icon}
                        </div>
                        <h1 className="onboarding-title">{slide.title}</h1>
                        <p className="onboarding-desc">{slide.description}</p>
                    </div>
                ))}
            </div>

            <div className="onboarding-footer">
                <div className="onboarding-dots">
                    {SLIDES.map((_, idx) => (
                        <div key={idx} className={`dot ${currentSlide === idx ? 'active' : ''}`} />
                    ))}
                </div>

                <button
                    className={`onboarding-btn ${currentSlide === SLIDES.length - 1 ? 'onboarding-btn-primary' : 'onboarding-btn-secondary'}`}
                    onClick={handleNext}
                >
                    {currentSlide === SLIDES.length - 1 ? "Get Started" : "Next"}
                </button>
            </div>
        </div>
    );
}
