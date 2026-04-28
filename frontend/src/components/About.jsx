import { Star, UtensilsCrossed, Bike, Car } from "lucide-react";
import Reveal from "./Reveal";

const SERVICES = [
    { icon: UtensilsCrossed, label: "Dine-in" },
    { icon: Car, label: "Drive-through" },
    { icon: Bike, label: "Delivery" },
];

export default function About() {
    return (
        <section
            id="about"
            data-testid="about-section"
            className="relative py-20 sm:py-28 bg-[#0D0D0D] border-t border-[#1A1A1A]"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-10 items-center">
                <Reveal className="lg:col-span-5">
                    <div className="relative bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#2a2a2a] rounded-3xl p-8 sm:p-10 overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#FF6B35]/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-12 -left-10 w-56 h-56 bg-[#FFD700]/5 rounded-full blur-3xl" />
                        <div className="relative">
                            <div className="flex items-center gap-2">
                                <div className="flex">
                                    {[0, 1, 2, 3, 4].map((i) => (
                                        <Star
                                            key={i}
                                            size={22}
                                            className="text-[#FFD700] fill-[#FFD700]"
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="mt-3 flex items-baseline gap-3">
                                <span className="font-anton text-7xl text-[#FFD700] leading-none">
                                    5.0
                                </span>
                                <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#A1A1AA]">
                                    / 5.0
                                </span>
                            </div>
                            <p className="mt-2 text-[#F5F5F0]/80 font-medium">
                                Based on{" "}
                                <span className="text-[#FF6B35] font-bold">10 Reviews</span>{" "}
                                from happy customers
                            </p>
                            <div className="mt-6 grid grid-cols-2 gap-4 pt-6 border-t border-[#2a2a2a]">
                                <div>
                                    <div className="text-xs font-mono uppercase tracking-widest text-[#A1A1AA]">
                                        Avg / Person
                                    </div>
                                    <div className="font-anton text-3xl text-[#F5F5F0] mt-1">
                                        ₹200–400
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-mono uppercase tracking-widest text-[#A1A1AA]">
                                        Open
                                    </div>
                                    <div className="font-anton text-3xl text-[#F5F5F0] mt-1">
                                        8AM–10PM
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Reveal>

                <Reveal className="lg:col-span-7" delay={120}>
                    <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#FF6B35]">
                        Our Story
                    </span>
                    <h2 className="mt-2 font-anton text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight">
                        Born From The <span className="text-[#FF6B35]">Sizzle</span>
                    </h2>
                    <p className="mt-4 text-[#F5F5F0]/80 leading-relaxed">
                        Hot And Tasty Food Shop is a neighbourhood favourite in
                        <span className="text-[#FFD700]"> Adhyatmik Nagar, Ghaziabad</span>
                        . We serve street-style Indo-Chinese and desi snacks made fresh on
                        the wok — no shortcuts, just heat, masala, and love. Whether you
                        crave juicy momos, fiery chilli potato, or a family-size chowmein
                        platter, we've got your hunger covered.
                    </p>
                    <p className="mt-3 text-[#F5F5F0]/70 leading-relaxed">
                        Eat in. Drive through. Or get it delivered piping hot, right to
                        your door.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        {SERVICES.map(({ icon: Icon, label }) => (
                            <div
                                key={label}
                                data-testid={`service-${label.toLowerCase()}`}
                                className="inline-flex items-center gap-2 bg-[#1A1A1A] border border-[#2a2a2a] hover:border-[#FF6B35] transition-colors rounded-full px-4 py-2.5"
                            >
                                <Icon size={16} className="text-[#FF6B35]" />
                                <span className="text-sm font-semibold uppercase tracking-wide">
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
