'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { LogOut, CalendarDays, History } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navLinks = [
    { href: '/', label: 'Tìm sân' },
    { href: '/my-bookings', label: 'Sân đã đặt' },
    { href: '/history', label: 'Lịch sử' },
];

function UserMenu() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const displayName = user?.name || user?.email || '';
    const initials = displayName.charAt(0).toUpperCase();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50 transition-colors outline-none cursor-pointer">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-[#0F6E56] flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {initials}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {displayName}
                </span>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52">
                <div className="px-2 py-1.5 border-b border-gray-100 mb-1">
                    <p className="text-xs text-gray-500">Đăng nhập với</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => router.push('/my-bookings')}
                >
                    <CalendarDays className="w-4 h-4" />
                    Sân đã đặt
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => router.push('/history')}
                >
                    <History className="w-4 h-4" />
                    Lịch sử
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 cursor-pointer flex items-center gap-2"
                    onClick={() => logout().then(() => router.push('/login'))}
                >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function HomeNavbar() {
    const pathname = usePathname();
    const { user, isLoading } = useAuth();

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

                {/* Right side */}
                {isLoading ? (
                    <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
                ) : user ? (
                    <UserMenu />
                ) : (
                    <Link
                        href="/login"
                        className="text-sm font-semibold px-4 py-2 rounded-lg border-2 border-[#0F6E56] text-[#0F6E56] hover:bg-[#0F6E56] hover:text-white transition-colors"
                    >
                        Đăng nhập
                    </Link>
                )}
            </div>
        </header>
    );
}
