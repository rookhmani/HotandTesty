import { useEffect, useMemo, useState } from "react";
import { fetchMenu } from "../lib/api";
import MenuCard from "./MenuCard";
import { Loader2, Search } from "lucide-react";
import Reveal from "./Reveal";

const FILTERS = [
    { key: "all", label: "All" },
    { key: "potatoes", label: "Potatoes" },
    { key: "rolls", label: "Rolls" },
    { key: "momos", label: "Momos" },
    { key: "chowmein", label: "Chowmein" },
    { key: "rice", label: "Rice" },
    { key: "main-course", label: "Main Course" },
    { key: "chopsy", label: "Chopsy" },
];

export default function Menu() {
    const [items, setItems] = useState([]);
    const [active, setActive] = useState("all");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        fetchMenu("all")
            .then((d) => mounted && setItems(d))
            .catch(() => mounted && setItems([]))
            .finally(() => mounted && setLoading(false));
        return () => {
            mounted = false;
        };
    }, []);

    const filtered = useMemo(() => {
        let out = items;
        if (active !== "all") out = out.filter((i) => i.category === active);
        if (search.trim()) {
            const q = search.toLowerCase();
            out = out.filter((i) => i.name.toLowerCase().includes(q));
        }
        return out;
    }, [items, active, search]);

    return (
        <section
            id="menu"
            data-testid="menu-section"
            className="relative py-20 sm:py-28 bg-[#0D0D0D]"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Reveal>
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
                        <div>
                            <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#FF6B35]">
                                The Menu
                            </span>
                            <h2 className="mt-2 font-anton text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight">
                                Pick Your <span className="text-[#FF6B35]">Heat</span>
                            </h2>
                            <p className="mt-3 text-[#A1A1AA] max-w-md">
                                Wok-fired, deep-fried & desi spiced. From street-side momos to
                                Manchurian — straight from our Ghaziabad kitchen.
                            </p>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]"
                            />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search dishes..."
                                data-testid="menu-search-input"
                                className="w-full bg-[#1A1A1A] border border-[#2a2a2a] focus:border-[#FF6B35] outline-none rounded-full pl-9 pr-4 py-2.5 text-sm text-[#F5F5F0] placeholder:text-[#A1A1AA]/70 transition-colors"
                            />
                        </div>
                    </div>
                </Reveal>

                <div
                    data-testid="menu-filters"
                    className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1"
                >
                    {FILTERS.map((f) => (
                        <button
                            key={f.key}
                            type="button"
                            data-testid={`menu-filter-${f.key}`}
                            data-active={active === f.key}
                            onClick={() => setActive(f.key)}
                            className="pill"
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                <div className="mt-8">
                    {loading ? (
                        <div
                            data-testid="menu-loading"
                            className="flex items-center justify-center py-24 text-[#A1A1AA]"
                        >
                            <Loader2 className="animate-spin mr-2" size={20} /> Loading
                            delicious things…
                        </div>
                    ) : filtered.length === 0 ? (
                        <div
                            data-testid="menu-empty"
                            className="py-24 text-center text-[#A1A1AA] font-mono uppercase tracking-widest text-sm"
                        >
                            No dishes match your search.
                        </div>
                    ) : (
                        <div
                            data-testid="menu-grid"
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                        >
                            {filtered.map((it, idx) => (
                                <Reveal key={it.id} delay={Math.min(idx * 40, 280)}>
                                    <MenuCard item={it} />
                                </Reveal>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
