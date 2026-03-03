import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import './Header.css';

interface HeaderProps {
    title: string;
    showBack?: boolean;
}

export default function Header({ title, showBack = true }: HeaderProps) {
    return (
        <header className="page-header">
            <div className="header-left">
                {showBack && (
                    <Link href="/" className="back-button" aria-label="Go back">
                        <ArrowLeft size={24} />
                    </Link>
                )}
            </div>
            <h1 className="header-title">{title}</h1>
            <div className="header-right"></div>
        </header>
    );
}
