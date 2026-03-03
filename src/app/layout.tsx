import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
    title: 'Payattu Book',
    description: 'Mobile-first application for managing Payattu',
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
    themeColor: '#3B0764',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <main className="mobile-wrapper">
                    {children}
                </main>
            </body>
        </html>
    );
}
