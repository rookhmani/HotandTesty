import { Clock, MapPin, Phone } from "lucide-react";
import Reveal from "./Reveal";

const MAP_QUERY = "Adhyatmik Nagar, Ghaziabad, UP 201015";
const MAP_SRC = `https://www.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&output=embed`;

export default function OrderInfo() {
    return (
        <section
            id="order-info"
            data-testid="order-info-section"
            className="relative py-20 sm:py-28 bg-[#0D0D0D] border-t border-[#1A1A1A]"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Reveal>
                    <div className="text-center max-w-2xl mx-auto">
                        <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#FF6B35]">
                            Visit Us
                        </span>
                        <h2 className="mt-2 font-anton text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight">
                            Find <span className="text-[#FFD700]">The Heat</span>
                        </h2>
                        <p className="mt-3 text-[#A1A1AA]">
                            Walk in, drive through, or have it delivered.
                        </p>
                    </div>
                </Reveal>

                <div className="mt-10 grid lg:grid-cols-12 gap-6">
                    <Reveal className="lg:col-span-5 space-y-4">
                        <InfoCard
                            icon={Clock}
                            label="Timings"
                            value="8 AM – 10 PM"
                            sub="Open Mon – Sun"
                            testId="info-timings"
                        />
                        <InfoCard
                            icon={MapPin}
                            label="Location"
                            value="Adhyatmik Nagar"
                            sub="Ghaziabad, UP 201015"
                            testId="info-location"
                        />
                        <InfoCard
                            icon={Phone}
                            label="Call to Order"
                            value="084483 27336"
                            sub="Tap to call"
                            href="tel:08448327336"
                            testId="info-phone"
                        />
                    </Reveal>

                    <Reveal className="lg:col-span-7" delay={120}>
                        <div
                            data-testid="map-container"
                            className="h-[420px] rounded-3xl overflow-hidden border border-[#2a2a2a] bg-[#1A1A1A]"
                        >
                            <iframe
                                title="Hot And Tasty Food Shop Location"
                                src={MAP_SRC}
                                width="100%"
                                height="100%"
                                style={{ border: 0, filter: "invert(0.9) hue-rotate(180deg)" }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

function InfoCard({ icon: Icon, label, value, sub, href, testId }) {
    const Tag = href ? "a" : "div";
    return (
        <Tag
            href={href}
            data-testid={testId}
            className="block bg-[#1A1A1A] border border-[#2a2a2a] hover:border-[#FF6B35] transition-colors rounded-2xl p-6"
        >
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FF6B35]/15 flex items-center justify-center text-[#FF6B35]">
                    <Icon size={22} />
                </div>
                <div>
                    <div className="text-xs font-mono uppercase tracking-[0.25em] text-[#A1A1AA]">
                        {label}
                    </div>
                    <div className="mt-1 font-anton text-2xl uppercase text-[#F5F5F0]">
                        {value}
                    </div>
                    {sub && <div className="text-sm text-[#A1A1AA] mt-0.5">{sub}</div>}
                </div>
            </div>
        </Tag>
    );
}
