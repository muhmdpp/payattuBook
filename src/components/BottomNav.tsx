'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, BarChart2, Settings, Database } from 'lucide-react';
import './BottomNav.css';

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <div className="bottom-nav-container">
            <nav className="bottom-nav">
                <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`}>
                    <Home size={24} />
                    <span className="nav-label">Home</span>
                </Link>
                <Link href="/members" className={`nav-item ${pathname === '/members' ? 'active' : ''}`}>
                    <Users size={24} />
                    <span className="nav-label">Members</span>
                </Link>

                {/* FAB center item */}
                <Link href="/seed" className="nav-item-fab-wrapper">
                    <button className="fab-button" aria-label="Quick Add">
                        <Database size={28} color="white" />
                    </button>
                </Link>

                <Link href="/analytics" className={`nav-item ${pathname === '/analytics' ? 'active' : ''}`}>
                    <BarChart2 size={24} />
                    <span className="nav-label">Analytics</span>
                </Link>
                <Link href="/settings" className={`nav-item ${pathname === '/settings' ? 'active' : ''}`}>
                    <Settings size={24} />
                    <span className="nav-label">Settings</span>
                </Link>
            </nav>
        </div>
    );
}
