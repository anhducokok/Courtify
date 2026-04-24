import Link from 'next/link';

const LINKS = {
  'Courtify': [
    { label: 'Về chúng tôi', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Tuyển dụng', href: '/careers' },
  ],
  'Dịch vụ': [
    { label: 'Tìm sân', href: '/' },
    { label: 'Đặt lịch', href: '/bookings' },
    { label: 'Lịch sử đặt sân', href: '/history' },
  ],
  'Hỗ trợ': [
    { label: 'Trung tâm trợ giúp', href: '/help' },
    { label: 'Liên hệ', href: '/contact' },
    { label: 'Chính sách bảo mật', href: '/privacy' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#0F6E56] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <p className="text-2xl font-extrabold tracking-tight">Courtify</p>
            <p className="mt-2 text-sm text-[#a7f3d0] leading-relaxed">
              Nền tảng đặt sân cầu lông <br /> nhanh chóng · 24/7
            </p>
            <div className="flex gap-3 mt-4">
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
              </a>
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path fill="#0F6E56" d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round" /></svg>
              </a>
              {/* Zalo */}
              <a
                href="https://zalo.me"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Zalo"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <span className="text-[10px] font-bold text-white">ZL</span>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([heading, links]) => (
            <div key={heading}>
              <p className="text-sm font-semibold text-[#84cc16] uppercase tracking-wide mb-3">
                {heading}
              </p>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#a7f3d0] hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#a7f3d0]">
          <p>© {new Date().getFullYear()} Courtify. All rights reserved.</p>
          <p>Made with ♥ in Việt Nam</p>
        </div>
      </div>
    </footer>
  );
}
