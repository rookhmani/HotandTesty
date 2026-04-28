import { Plus } from "lucide-react";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";

export default function MenuCard({ item }) {
    const { addItem } = useCart();
    const [variant, setVariant] = useState("full");

    const price =
        variant === "half" && item.price_half ? item.price_half : item.price_full;

    const onAdd = () => {
        addItem(item, item.has_variants ? variant : "full");
        toast.success(`${item.name} added to cart`, {
            description: `₹${price} · ${item.has_variants ? variant.toUpperCase() : "Regular"}`,
        });
    };

    return (
        <article
            data-testid={`menu-card-${item.id}`}
            className="menu-card group"
        >
            <div className="img-wrap relative">
                <img src={item.image} alt={item.name} loading="lazy" />
                <div className="absolute top-3 left-3">
                    <span className={item.veg ? "tag-veg" : "tag-nonveg"}>
                        {item.veg ? "Veg" : "Non-Veg"}
                    </span>
                </div>
            </div>
            <div className="p-4 sm:p-5 flex-1 flex flex-col">
                <h3 className="font-anton text-lg sm:text-xl uppercase tracking-tight text-[#F5F5F0]">
                    {item.name}
                </h3>
                {item.description && (
                    <p className="mt-1 text-xs sm:text-sm text-[#A1A1AA] line-clamp-2">
                        {item.description}
                    </p>
                )}

                {item.has_variants && item.price_half ? (
                    <div className="mt-3 inline-flex rounded-full border border-[#2a2a2a] p-0.5 self-start">
                        <button
                            type="button"
                            data-testid={`variant-half-${item.id}`}
                            onClick={() => setVariant("half")}
                            className={`px-3 py-1 text-[11px] font-bold uppercase rounded-full tracking-wider transition-colors ${
                                variant === "half"
                                    ? "bg-[#FF6B35] text-[#0D0D0D]"
                                    : "text-[#A1A1AA] hover:text-[#F5F5F0]"
                            }`}
                        >
                            Half ₹{item.price_half}
                        </button>
                        <button
                            type="button"
                            data-testid={`variant-full-${item.id}`}
                            onClick={() => setVariant("full")}
                            className={`px-3 py-1 text-[11px] font-bold uppercase rounded-full tracking-wider transition-colors ${
                                variant === "full"
                                    ? "bg-[#FF6B35] text-[#0D0D0D]"
                                    : "text-[#A1A1AA] hover:text-[#F5F5F0]"
                            }`}
                        >
                            Full ₹{item.price_full}
                        </button>
                    </div>
                ) : null}

                <div className="mt-auto pt-4 flex items-center justify-between">
                    <span
                        data-testid={`price-${item.id}`}
                        className="font-anton text-2xl text-[#FFD700] tracking-tight"
                    >
                        ₹{price}
                    </span>
                    <button
                        type="button"
                        onClick={onAdd}
                        data-testid={`add-to-cart-${item.id}`}
                        className="inline-flex items-center gap-1.5 bg-[#FF6B35] hover:bg-[#E85D2A] text-[#0D0D0D] font-bold text-sm px-4 py-2 rounded-full transition-all active:scale-95"
                    >
                        <Plus size={16} strokeWidth={3} /> Add
                    </button>
                </div>
            </div>
        </article>
    );
}
