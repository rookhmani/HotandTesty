import { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "../components/ui/sheet";
import { useCart } from "../context/CartContext";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import CheckoutDialog from "./CheckoutDialog";

export default function CartDrawer() {
    const { open, setOpen, items, setQty, removeItem, subtotal, totalCount } =
        useCart();
    const [checkoutOpen, setCheckoutOpen] = useState(false);

    const deliveryFee = subtotal === 0 ? 0 : subtotal >= 300 ? 0 : 30;
    const total = subtotal + deliveryFee;

    return (
        <>
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent
                    side="right"
                    data-testid="cart-drawer"
                    className="bg-[#1A1A1A] text-[#F5F5F0] border-l border-[#2a2a2a] w-full sm:max-w-md p-0 flex flex-col"
                >
                    <SheetHeader className="p-6 border-b border-[#2a2a2a] text-left">
                        <SheetTitle className="font-anton text-2xl uppercase tracking-tight text-[#F5F5F0] flex items-center gap-2">
                            <ShoppingBag size={20} className="text-[#FF6B35]" />
                            Your Cart
                            {totalCount > 0 && (
                                <span className="text-sm font-mono text-[#A1A1AA] ml-1">
                                    ({totalCount})
                                </span>
                            )}
                        </SheetTitle>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        {items.length === 0 ? (
                            <div
                                data-testid="cart-empty"
                                className="h-full flex flex-col items-center justify-center text-center py-16"
                            >
                                <div className="w-20 h-20 rounded-full bg-[#0D0D0D] border border-[#2a2a2a] flex items-center justify-center text-[#A1A1AA]">
                                    <ShoppingBag size={28} />
                                </div>
                                <p className="mt-4 font-anton text-2xl uppercase">
                                    Cart is Empty
                                </p>
                                <p className="text-sm text-[#A1A1AA] mt-1">
                                    Add some heat from the menu!
                                </p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-[#2a2a2a]/60">
                                {items.map((it) => (
                                    <li
                                        key={it.key}
                                        data-testid={`cart-item-${it.item_id}-${it.variant}`}
                                        className="py-4 flex gap-3"
                                    >
                                        <img
                                            src={it.image}
                                            alt={it.name}
                                            className="w-16 h-16 rounded-lg object-cover bg-[#0D0D0D]"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="font-bold text-sm truncate">
                                                        {it.name}
                                                    </p>
                                                    <p className="text-[11px] uppercase tracking-wider text-[#A1A1AA]">
                                                        {it.variant} · ₹{it.unit_price}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(it.key)}
                                                    data-testid={`remove-${it.item_id}-${it.variant}`}
                                                    className="p-1 text-[#A1A1AA] hover:text-[#FF6B35]"
                                                    aria-label="Remove"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <div className="mt-2 flex items-center justify-between">
                                                <div className="inline-flex items-center bg-[#0D0D0D] border border-[#2a2a2a] rounded-full">
                                                    <button
                                                        type="button"
                                                        data-testid={`qty-dec-${it.item_id}-${it.variant}`}
                                                        onClick={() => setQty(it.key, it.quantity - 1)}
                                                        className="p-1.5 hover:text-[#FF6B35]"
                                                        aria-label="Decrease"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="px-2 text-sm font-bold min-w-6 text-center">
                                                        {it.quantity}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        data-testid={`qty-inc-${it.item_id}-${it.variant}`}
                                                        onClick={() => setQty(it.key, it.quantity + 1)}
                                                        className="p-1.5 hover:text-[#FF6B35]"
                                                        aria-label="Increase"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                <span className="font-anton text-lg text-[#FFD700]">
                                                    ₹{it.unit_price * it.quantity}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {items.length > 0 && (
                        <div className="border-t border-[#2a2a2a] p-6 bg-[#0D0D0D]/40">
                            <div className="space-y-1.5 text-sm">
                                <Row label="Subtotal" value={`₹${subtotal}`} />
                                <Row
                                    label="Delivery Fee"
                                    value={
                                        deliveryFee === 0 ? (
                                            <span className="text-[#FFD700]">FREE</span>
                                        ) : (
                                            `₹${deliveryFee}`
                                        )
                                    }
                                />
                                {subtotal < 300 && (
                                    <p className="text-[11px] text-[#A1A1AA] pt-1">
                                        Add ₹{300 - subtotal} more for free delivery
                                    </p>
                                )}
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <span className="font-anton text-2xl uppercase">Total</span>
                                <span
                                    data-testid="cart-total"
                                    className="font-anton text-3xl text-[#FFD700]"
                                >
                                    ₹{total}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setCheckoutOpen(true)}
                                data-testid="cart-checkout-btn"
                                className="btn-primary w-full mt-5 inline-flex items-center justify-center"
                            >
                                Proceed to Checkout
                            </button>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                data-testid="cart-close-btn"
                                className="w-full mt-2 text-xs uppercase tracking-widest text-[#A1A1AA] hover:text-[#F5F5F0] py-2 inline-flex items-center justify-center gap-1"
                            >
                                <X size={12} /> Continue Shopping
                            </button>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            <CheckoutDialog open={checkoutOpen} onOpenChange={setCheckoutOpen} />
        </>
    );
}

function Row({ label, value }) {
    return (
        <div className="flex items-center justify-between text-[#F5F5F0]/80">
            <span>{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}
