'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
    { href: '/', label: 'Tìm sân' },
    { href: '/bookings', label: 'Đặt lịch' },
    { href: '/history', label: 'Lịch sử' },
];

export function HomeNavbar() {
    const pathname = usePathname();

    return (
        <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="text-lg font-extrabold text-[#0F6E56] tracking-tight">
                    Courtify
                </Link>

                {/* Nav links */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={[
                                'text-sm font-medium transition-colors',
                                pathname === link.href
                                    ? 'text-[#0F6E56] border-b-2 border-[#0F6E56] pb-0.5'
                                    : 'text-gray-600 hover:text-[#0F6E56]',
                            ].join(' ')}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Login */}
                <Link
                    href="/login"
                    className="text-sm font-semibold px-4 py-2 rounded-lg border-2 border-[#0F6E56] text-[#0F6E56] hover:bg-[#0F6E56] hover:text-white transition-colors"
                >
                    Đăng nhập
                </Link>
            </div>
        </header>
    );
}
