'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Book, FileSearch, BarChart2, Settings } from 'lucide-react';
import './BottomNav.css';

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <div className="bottom-nav-container">
            <nav className="bottom-nav">
                <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`}>
                    <Home size={24} />
                </Link>
                <Link href="/history" className={`nav-item ${pathname === '/history' ? 'active' : ''}`}>
                    <Book size={24} />
                </Link>

                {/* FAB center item */}
                <div className="nav-item-fab-wrapper">
                    <button className="fab-button" aria-label="Quick Action">
                        <FileSearch size={28} color="white" />
                    </button>
                </div>

                <Link href="/analytics" className={`nav-item ${pathname === '/analytics' ? 'active' : ''}`}>
                    <BarChart2 size={24} />
                </Link>
                <Link href="/settings" className={`nav-item ${pathname === '/settings' ? 'active' : ''}`}>
                    <Settings size={24} />
                </Link>
            </nav>
        </div>
    );
}
