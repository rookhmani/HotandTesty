import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "../components/ui/dialog";
import { useCart } from "../context/CartContext";
import { createOrder, initStripe } from "../lib/api";
import { Loader2, CreditCard, Wallet } from "lucide-react";
import { toast } from "sonner";

export default function CheckoutDialog({ open, onOpenChange }) {
    const { items, subtotal, clearCart, setOpen: setCartOpen } = useCart();
    const [form, setForm] = useState({
        customer_name: "",
        phone: "",
        address: "",
        notes: "",
    });
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [loading, setLoading] = useState(false);

    const deliveryFee = subtotal === 0 ? 0 : subtotal >= 300 ? 0 : 30;
    const total = subtotal + deliveryFee;

    const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!form.customer_name || !form.phone || !form.address) {
            toast.error("Please fill in all required fields");
            return;
        }
        if (form.phone.replace(/\D/g, "").length < 10) {
            toast.error("Enter a valid 10-digit phone number");
            return;
        }
        setLoading(true);
        try {
            const orderPayload = {
                customer_name: form.customer_name,
                phone: form.phone,
                address: form.address,
                notes: form.notes,
                payment_method: paymentMethod,
                items: items.map((i) => ({
                    item_id: i.item_id,
                    name: i.name,
                    variant: i.variant,
                    unit_price: i.unit_price,
                    quantity: i.quantity,
                })),
            };
            const order = await createOrder(orderPayload);
            if (paymentMethod === "online") {
                const session = await initStripe(order.id);
                if (session?.url) {
                    window.location.href = session.url;
                    return;
                }
                throw new Error("Stripe session failed");
            } else {
                toast.success("Order placed!", {
                    description: `Order #${order.id.slice(0, 8)} · We'll call you to confirm.`,
                });
                clearCart();
                onOpenChange(false);
                setCartOpen(false);
            }
        } catch (err) {
            toast.error("Something went wrong", {
                description: err?.response?.data?.detail || err.message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                data-testid="checkout-dialog"
                className="bg-[#1A1A1A] border border-[#2a2a2a] text-[#F5F5F0] sm:max-w-lg max-h-[90vh] overflow-y-auto"
            >
                <DialogHeader>
                    <DialogTitle className="font-anton text-2xl uppercase tracking-tight">
                        Checkout
                    </DialogTitle>
                    <DialogDescription className="text-[#A1A1AA]">
                        Enter your details and pick a payment method.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-4 mt-2">
                    <Field
                        label="Full Name"
                        testId="checkout-name"
                        value={form.customer_name}
                        onChange={onChange("customer_name")}
                        required
                    />
                    <Field
                        label="Phone"
                        type="tel"
                        testId="checkout-phone"
                        value={form.phone}
                        onChange={onChange("phone")}
                        required
                    />
                    <Field
                        label="Delivery Address"
                        testId="checkout-address"
                        value={form.address}
                        onChange={onChange("address")}
                        required
                        textarea
                    />
                    <Field
                        label="Notes (optional)"
                        testId="checkout-notes"
                        value={form.notes}
                        onChange={onChange("notes")}
                        textarea
                    />

                    <div>
                        <div className="text-xs font-mono uppercase tracking-widest text-[#A1A1AA] mb-2">
                            Payment Method
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <PaymentTile
                                active={paymentMethod === "cod"}
                                onClick={() => setPaymentMethod("cod")}
                                icon={Wallet}
                                title="Cash on Delivery"
                                subtitle="Pay when it arrives"
                                testId="payment-cod"
                            />
                            <PaymentTile
                                active={paymentMethod === "online"}
                                onClick={() => setPaymentMethod("online")}
                                icon={CreditCard}
                                title="Pay Online"
                                subtitle="Card / UPI via Stripe"
                                testId="payment-online"
                            />
                        </div>
                    </div>

                    <div className="bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl p-4 space-y-1.5 text-sm">
                        <Row label="Subtotal" value={`₹${subtotal}`} />
                        <Row
                            label="Delivery"
                            value={deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                        />
                        <div className="flex items-center justify-between pt-2 border-t border-[#2a2a2a] mt-2">
                            <span className="font-anton text-xl uppercase">Total</span>
                            <span className="font-anton text-2xl text-[#FFD700]">
                                ₹{total}
                            </span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || items.length === 0}
                        data-testid="checkout-submit"
                        className="btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Processing…
                            </>
                        ) : paymentMethod === "online" ? (
                            <>Pay ₹{total} & Order</>
                        ) : (
                            <>Place Order · ₹{total}</>
                        )}
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function Field({ label, value, onChange, required, type = "text", textarea, testId }) {
    return (
        <label className="block">
            <span className="text-xs font-mono uppercase tracking-widest text-[#A1A1AA]">
                {label}
                {required && <span className="text-[#FF6B35]"> *</span>}
            </span>
            {textarea ? (
                <textarea
                    value={value}
                    onChange={onChange}
                    required={required}
                    rows={2}
                    data-testid={testId}
                    className="mt-1 w-full bg-[#0D0D0D] border border-[#2a2a2a] focus:border-[#FF6B35] outline-none rounded-lg px-3 py-2.5 text-sm text-[#F5F5F0] placeholder:text-[#A1A1AA]/70"
                />
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    required={required}
                    data-testid={testId}
                    className="mt-1 w-full bg-[#0D0D0D] border border-[#2a2a2a] focus:border-[#FF6B35] outline-none rounded-lg px-3 py-2.5 text-sm text-[#F5F5F0]"
                />
            )}
        </label>
    );
}

function PaymentTile({ active, onClick, icon: Icon, title, subtitle, testId }) {
    return (
        <button
            type="button"
            onClick={onClick}
            data-testid={testId}
            className={`text-left p-4 rounded-xl border transition-all ${
                active
                    ? "border-[#FF6B35] bg-[#FF6B35]/10"
                    : "border-[#2a2a2a] hover:border-[#FF6B35]/60 bg-[#0D0D0D]"
            }`}
        >
            <Icon
                size={18}
                className={active ? "text-[#FF6B35]" : "text-[#F5F5F0]"}
            />
            <div className="mt-2 font-bold text-sm">{title}</div>
            <div className="text-[11px] text-[#A1A1AA]">{subtitle}</div>
        </button>
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
