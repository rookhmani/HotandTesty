import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "hat-cart";

export const CartProvider = ({ children }) => {
    const [items, setItems] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });
    const [open, setOpen] = useState(false);
    const [pulse, setPulse] = useState(0);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch {}
    }, [items]);

    const addItem = (menuItem, variant = "full") => {
        const unit_price =
            variant === "half" && menuItem.price_half
                ? menuItem.price_half
                : menuItem.price_full;
        const key = `${menuItem.id}-${variant}`;
        setItems((prev) => {
            const existing = prev.find((i) => i.key === key);
            if (existing) {
                return prev.map((i) =>
                    i.key === key ? { ...i, quantity: i.quantity + 1 } : i,
                );
            }
            return [
                ...prev,
                {
                    key,
                    item_id: menuItem.id,
                    name: menuItem.name,
                    image: menuItem.image,
                    variant,
                    unit_price,
                    quantity: 1,
                },
            ];
        });
        setPulse((p) => p + 1);
    };

    const removeItem = (key) =>
        setItems((prev) => prev.filter((i) => i.key !== key));

    const setQty = (key, qty) => {
        if (qty <= 0) return removeItem(key);
        setItems((prev) =>
            prev.map((i) => (i.key === key ? { ...i, quantity: qty } : i)),
        );
    };

    const clearCart = () => setItems([]);

    const subtotal = useMemo(
        () => items.reduce((s, i) => s + i.unit_price * i.quantity, 0),
        [items],
    );
    const totalCount = useMemo(
        () => items.reduce((s, i) => s + i.quantity, 0),
        [items],
    );

    const value = {
        items,
        open,
        setOpen,
        addItem,
        removeItem,
        setQty,
        clearCart,
        subtotal,
        totalCount,
        pulse,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
};
