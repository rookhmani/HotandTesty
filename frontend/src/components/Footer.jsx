import { Instagram, Facebook, Twitter, Flame } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer
            data-testid="site-footer"
            className="relative bg-[#0D0D0D] border-t border-[#1A1A1A]"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid md:grid-cols-3 gap-10">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-anton text-3xl uppercase tracking-tight">
                            <span className="text-[#FF6B35]">Hot</span>
                            <span className="text-[#F5F5F0]">&amp;</span>
                            <span className="text-[#FFD700]">Tasty</span>
                        </span>
                    </div>
                    <p className="mt-3 text-sm text-[#A1A1AA] max-w-xs">
                        Fast food made with real flavours. Wok-fired in Ghaziabad,
                        delivered hot to your door.
                    </p>
                    <div className="mt-5 flex items-center gap-3">
                        <SocialLink href="#" label="Instagram">
                            <Instagram size={18} />
                        </SocialLink>
                        <SocialLink href="#" label="Facebook">
                            <Facebook size={18} />
                        </SocialLink>
                        <SocialLink href="#" label="Twitter">
                            <Twitter size={18} />
                        </SocialLink>
                    </div>
                </div>

                <div>
                    <div className="text-xs font-mono uppercase tracking-[0.3em] text-[#A1A1AA]">
                        Explore
                    </div>
                    <ul className="mt-4 space-y-2 text-sm">
                        <li>
                            <a href="#menu" className="hover:text-[#FF6B35] transition-colors">
                                Menu
                            </a>
                        </li>
                        <li>
                            <a
                                href="#about"
                                className="hover:text-[#FF6B35] transition-colors"
                            >
                                About
                            </a>
                        </li>
                        <li>
                            <a
                                href="#order-info"
                                className="hover:text-[#FF6B35] transition-colors"
                            >
                                Order Info
                            </a>
                        </li>
                        <li>
                            <Link
                                to="/admin"
                                className="hover:text-[#FF6B35] transition-colors"
                                data-testid="footer-admin-link"
                            >
                                Admin
                            </Link>
                        </li>
                    </ul>
                </div>

                <div>
                    <div className="text-xs font-mono uppercase tracking-[0.3em] text-[#A1A1AA]">
                        Reach Us
                    </div>
                    <ul className="mt-4 space-y-2 text-sm text-[#F5F5F0]/80">
                        <li>Adhyatmik Nagar, Ghaziabad, UP 201015</li>
                        <li>
                            <a href="tel:08448327336" className="hover:text-[#FF6B35]">
                                084483 27336
                            </a>
                        </li>
                        <li>Open 8 AM – 10 PM (Mon–Sun)</li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-[#1A1A1A]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#A1A1AA]">
                    <span>© 2025 Hot And Tasty Food Shop. All rights reserved.</span>
                    <span className="inline-flex items-center gap-1.5">
                        Made with{" "}
                        <Flame size={12} className="text-[#FF6B35]" /> in Ghaziabad
                    </span>
                </div>
            </div>
        </footer>
    );
}

function SocialLink({ href, label, children }) {
    return (
        <a
            href={href}
            aria-label={label}
            className="w-9 h-9 rounded-full border border-[#2a2a2a] flex items-center justify-center text-[#F5F5F0]/80 hover:text-[#FF6B35] hover:border-[#FF6B35] transition-all"
        >
            {children}
        </a>
    );
}
