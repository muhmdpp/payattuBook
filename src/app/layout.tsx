import './globals.css';
import type { Metadata, Viewport } from 'next';
import InstallPrompt from '@/components/InstallPrompt';

export const metadata: Metadata = {
    title: 'Payattu Book',
    description: 'Track your community Payattu contributions',
    manifest: '/manifest.json',
    appleWebApp: {
        title: 'Payattu Book',
        capable: true,
        statusBarStyle: 'black-translucent',
    },
    icons: {
        apple: '/apple-touch-icon.png',
    },
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
            <head>
                {/* Capture the install prompt BEFORE React loads — same pattern as elfilming.com */}
                <script dangerouslySetInnerHTML={{
                    __html: `
                        window.__pwaInstallPrompt = null;
                        window.addEventListener('beforeinstallprompt', function(e) {
                            e.preventDefault();
                            window.__pwaInstallPrompt = e;
                        });
                    `
                }} />
            </head>
            <body>
                <main className="mobile-wrapper">
                    {children}
                </main>
                <InstallPrompt />
            </body>
        </html>
    );
}

