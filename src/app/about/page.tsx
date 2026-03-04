"use client";

import Link from 'next/link';
import { ChevronLeft, Instagram, Linkedin, Code2, Heart, ExternalLink } from 'lucide-react';
import './About.css';

export default function AboutDeveloperPage() {
    return (
        <div className="page-container">
            <main className="about-main">

                {/* Hero Banner */}
                <div className="about-hero">
                    <Link href="/settings" className="about-back">
                        <ChevronLeft size={22} color="white" />
                    </Link>

                    <div className="about-avatar-ring">
                        <div className="about-avatar" />
                    </div>

                    <h1 className="about-name">Muhammad PP</h1>
                    <p className="about-tagline">Full-Stack Developer · Kerala, India</p>

                    {/* Social links */}
                    <div className="about-socials">
                        <a
                            href="https://www.instagram.com/muhmdpp"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-pill instagram"
                        >
                            <Instagram size={15} />
                            @muhmdpp
                        </a>
                        <a
                            href="https://www.linkedin.com/in/muhammadpp"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-pill linkedin"
                        >
                            <Linkedin size={15} />
                            muhammadpp
                        </a>
                    </div>
                </div>

                {/* Cards */}
                <div className="about-content">

                    <div className="about-card">
                        <div className="about-card-icon" style={{ background: '#EDE9FE' }}>
                            <Code2 size={20} color="#6D28D9" />
                        </div>
                        <div>
                            <h3 className="about-card-title">About PayattuBook</h3>
                            <p className="about-card-body">
                                PayattuBook is a personal digital ledger for tracking community Payattu contributions —
                                built with Next.js, Supabase, and a lot of care for the community that relies on it.
                            </p>
                        </div>
                    </div>

                    <div className="about-card">
                        <div className="about-card-icon" style={{ background: '#FEE2E2' }}>
                            <Heart size={20} color="#DC2626" />
                        </div>
                        <div>
                            <h3 className="about-card-title">Made with Love</h3>
                            <p className="about-card-body">
                                Designed and developed to preserve a traditional community trust system in a
                                clean, modern mobile experience.
                            </p>
                        </div>
                    </div>

                    {/* Links list */}
                    <div className="about-links-section">
                        <h3 className="about-links-title">Connect</h3>
                        <a
                            href="https://www.instagram.com/muhmdpp"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="about-link-row"
                        >
                            <span className="about-link-icon instagram-bg"><Instagram size={16} color="white" /></span>
                            <span>Instagram</span>
                            <ExternalLink size={14} color="#9CA3AF" style={{ marginLeft: 'auto' }} />
                        </a>
                        <div className="about-divider" />
                        <a
                            href="https://www.linkedin.com/in/muhammadpp"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="about-link-row"
                        >
                            <span className="about-link-icon linkedin-bg"><Linkedin size={16} color="white" /></span>
                            <span>LinkedIn</span>
                            <ExternalLink size={14} color="#9CA3AF" style={{ marginLeft: 'auto' }} />
                        </a>
                    </div>

                    <p className="about-version">PayattuBook v1.0.0 · © 2025 Muhammad PP</p>
                </div>

            </main>
        </div>
    );
}
