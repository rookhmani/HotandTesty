import { ArrowRight, Flame, Star } from "lucide-react";

const HERO_IMG =
    "https://static.prod-images.emergentagent.com/jobs/ce18adc2-211b-4885-b808-4ca6e5f62cc2/images/66235363709eca9c9ed18aac25e736ba6c8aa0558cd863e9958beabd05ba5170.png";

export default function Hero() {
    const scrollTo = (id) => {
        const el = document.querySelector(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <section
            data-testid="hero-section"
            className="relative min-h-[100vh] hero-bg grain overflow-hidden flex items-center"
        >
            {/* Hero image */}
            <div className="absolute inset-0">
                <img
                    src={HERO_IMG}
                    alt="Hot and tasty fast food"
                    className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/50 to-[#0D0D0D]/30" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D]/95 via-[#0D0D0D]/40 to-transparent" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#FFD700]/40 bg-[#1A1A1A]/60 backdrop-blur-sm mb-6">
                        <Flame size={14} className="text-[#FF6B35]" />
                        <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#FFD700]">
                            Ghaziabad's Hottest Kitchen
                        </span>
                    </div>

                    <h1 className="font-anton text-5xl sm:text-6xl lg:text-8xl uppercase leading-[0.9] tracking-tight glow-text">
                        <span className="block text-[#F5F5F0]">Hot.</span>
                        <span className="block text-[#FF6B35]">Fresh.</span>
                        <span className="block text-[#FFD700]">Delivered.</span>
                    </h1>

                    <p className="mt-6 text-base sm:text-lg text-[#F5F5F0]/80 max-w-md leading-relaxed">
                        Fast food made with{" "}
                        <span className="text-[#FFD700] font-semibold">real flavours</span>
                        . Order now from Ghaziabad — momos, rolls, chowmein & more.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-4">
                        <button
                            type="button"
                            onClick={() => scrollTo("#menu")}
                            data-testid="hero-order-now"
                            className="btn-primary inline-flex items-center gap-2"
                        >
                            Order Now <ArrowRight size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollTo("#menu")}
                            data-testid="hero-view-menu"
                            className="btn-outline"
                        >
                            View Menu
                        </button>
                    </div>

                    <div className="mt-10 flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="flex">
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <Star
                                        key={i}
                                        size={16}
                                        className="text-[#FFD700] fill-[#FFD700]"
                                    />
                                ))}
                            </div>
                            <span className="text-[#F5F5F0]/80">5.0 · 10 Reviews</span>
                        </div>
                        <div className="hidden sm:block w-px h-5 bg-[#2a2a2a]" />
                        <span className="hidden sm:inline text-[#F5F5F0]/60">
                            Open 8 AM – 10 PM
                        </span>
                    </div>
                </div>
            </div>

            {/* Marquee */}
            <div className="absolute bottom-0 inset-x-0 border-t border-b border-[#2a2a2a] bg-[#0D0D0D]/80 backdrop-blur-md py-3 overflow-hidden">
                <div className="whitespace-nowrap flex gap-12 animate-[marquee_28s_linear_infinite]">
                    {Array.from({ length: 2 }).map((_, k) => (
                        <div key={k} className="flex gap-12 items-center">
                            {[
                                "MOMOS",
                                "CHOWMEIN",
                                "ROLLS",
                                "CHILLI POTATO",
                                "FRIED RICE",
                                "MANCHURIAN",
                                "PANEER",
                                "CHICKEN",
                                "DESI WOK",
                            ].map((w, i) => (
                                <span
                                    key={`${k}-${i}`}
                                    className="font-anton text-2xl uppercase text-[#F5F5F0]/30 tracking-widest flex items-center gap-12"
                                >
                                    {w}
                                    <span className="text-[#FF6B35]">★</span>
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
        @keyframes marquee {
          from { transform: translateX(0%); }
          to { transform: translateX(-50%); }
        }
      `}</style>
        </section>
    );
}
