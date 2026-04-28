import { ShoppingBag, Menu as MenuIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

const NAV = [
    { label: "Menu", href: "#menu" },
    { label: "About", href: "#about" },
    { label: "Order Info", href: "#order-info" },
];

export default function Navbar() {
    const { totalCount, setOpen, pulse } = useCart();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [bump, setBump] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        if (pulse > 0) {
            setBump(true);
            const t = setTimeout(() => setBump(false), 420);
            return () => clearTimeout(t);
        }
    }, [pulse]);

    return (
        <header
            data-testid="site-navbar"
            className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
                scrolled
                    ? "bg-[#0D0D0D]/85 backdrop-blur-xl border-b border-[#2a2a2a]"
                    : "bg-transparent"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link
                    to="/"
                    data-testid="brand-logo"
                    className="flex items-center gap-2 group"
                >
                    <span className="font-anton text-2xl sm:text-3xl uppercase tracking-tight">
                        <span className="text-[#FF6B35]">Hot</span>
                        <span className="text-[#F5F5F0]">&amp;</span>
                        <span className="text-[#FFD700]">Tasty</span>
                    </span>
                    <span className="hidden md:inline text-[10px] font-mono uppercase tracking-[0.3em] text-[#A1A1AA] mt-1">
                        Ghaziabad
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    {NAV.map((n) => (
                        <a
                            key={n.href}
                            href={n.href}
                            data-testid={`nav-${n.label.toLowerCase().replace(/\s+/g, "-")}`}
                            className="text-sm font-medium uppercase tracking-wider text-[#F5F5F0]/80 hover:text-[#FF6B35] transition-colors"
                        >
                            {n.label}
                        </a>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        data-testid="cart-drawer-trigger"
                        className={`relative p-2.5 rounded-full hover:bg-[#1A1A1A] transition-colors ${
                            bump ? "cart-pop" : ""
                        }`}
                        aria-label="Open cart"
                    >
                        <ShoppingBag size={22} className="text-[#F5F5F0]" />
                        {totalCount > 0 && (
                            <span
                                data-testid="cart-count-badge"
                                className="absolute -top-0.5 -right-0.5 bg-[#FF6B35] text-[#0D0D0D] font-bold rounded-full text-[11px] min-w-5 h-5 px-1 flex items-center justify-center"
                            >
                                {totalCount}
                            </span>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => setMobileOpen((m) => !m)}
                        data-testid="mobile-menu-toggle"
                        className="md:hidden p-2 rounded-full hover:bg-[#1A1A1A]"
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X size={22} /> : <MenuIcon size={22} />}
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <div
                    data-testid="mobile-nav"
                    className="md:hidden border-t border-[#2a2a2a] bg-[#0D0D0D]/95 backdrop-blur-xl"
                >
                    <div className="px-4 py-4 flex flex-col gap-3">
                        {NAV.map((n) => (
                            <a
                                key={n.href}
                                href={n.href}
                                onClick={() => setMobileOpen(false)}
                                className="text-sm font-medium uppercase tracking-wider text-[#F5F5F0]/80 hover:text-[#FF6B35]"
                            >
                                {n.label}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
}
