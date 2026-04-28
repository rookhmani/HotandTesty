import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Loader2, Phone, Home } from "lucide-react";
import { getOrder } from "../lib/api";

export default function OrderSuccessPage() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        getOrder(orderId)
            .then((d) => mounted && setOrder(d))
            .catch(() => mounted && setOrder(null))
            .finally(() => mounted && setLoading(false));
        return () => {
            mounted = false;
        };
    }, [orderId]);

    return (
        <div
            data-testid="order-success-page"
            className="min-h-screen bg-[#0D0D0D] text-[#F5F5F0] flex items-center justify-center px-4 py-10"
        >
            <div className="max-w-lg w-full bg-[#1A1A1A] border border-[#2a2a2a] rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden">
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#22C55E]/15 rounded-full blur-3xl" />
                <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#FFD700]/10 rounded-full blur-3xl" />

                <div className="relative">
                    <div className="success-check-wrap mx-auto">
                        <CheckCircle2
                            size={80}
                            className="text-[#22C55E] success-check"
                            strokeWidth={2}
                        />
                    </div>
                    <h1 className="mt-5 font-anton text-4xl sm:text-5xl uppercase tracking-tight">
                        Payment <span className="text-[#22C55E]">Received!</span>
                    </h1>
                    <p className="mt-3 text-[#F5F5F0]/80">
                        Thank you for your order. We will confirm via call shortly.
                    </p>

                    {loading ? (
                        <div className="mt-6 text-[#A1A1AA] flex items-center justify-center gap-2">
                            <Loader2 size={16} className="animate-spin" /> Loading order…
                        </div>
                    ) : order ? (
                        <div
                            data-testid="order-summary"
                            className="mt-6 text-left bg-[#0D0D0D] border border-[#2a2a2a] rounded-2xl p-5"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">
                                        Order
                                    </div>
                                    <div className="font-anton text-lg uppercase">
                                        #{order.id.slice(0, 8)}
                                    </div>
                                </div>
                                <span
                                    className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                                        order.payment_status === "paid"
                                            ? "bg-[#22C55E]/15 text-[#22C55E]"
                                            : "bg-[#FFD700]/15 text-[#FFD700]"
                                    }`}
                                >
                                    {order.payment_status === "paid"
                                        ? "Paid"
                                        : order.payment_method === "cod"
                                          ? "COD"
                                          : "Pending"}
                                </span>
                            </div>
                            <ul className="mt-3 divide-y divide-[#2a2a2a]/50">
                                {order.items.map((it) => (
                                    <li
                                        key={`${it.item_id}-${it.variant}`}
                                        className="py-2 flex items-center justify-between text-sm"
                                    >
                                        <span className="truncate pr-3">
                                            {it.name}
                                            <span className="text-[#A1A1AA] text-xs ml-1.5">
                                                ({it.variant}) × {it.quantity}
                                            </span>
                                        </span>
                                        <span className="font-bold">
                                            ₹{it.unit_price * it.quantity}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-3 pt-3 border-t border-[#2a2a2a] space-y-1 text-sm">
                                <Row
                                    label="Subtotal"
                                    value={`₹${order.subtotal}`}
                                    muted
                                />
                                <Row
                                    label="Delivery"
                                    value={
                                        order.delivery_fee === 0
                                            ? "FREE"
                                            : `₹${order.delivery_fee}`
                                    }
                                    muted
                                />
                                <div className="flex items-center justify-between pt-2">
                                    <span className="font-anton text-xl uppercase">
                                        Total
                                    </span>
                                    <span className="font-anton text-2xl text-[#FFD700]">
                                        ₹{order.total}
                                    </span>
                                </div>
                            </div>
                            {order.utr && (
                                <div className="mt-3 pt-3 border-t border-[#2a2a2a]">
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">
                                        UTR / Txn ID
                                    </span>
                                    <div className="font-mono text-sm">{order.utr}</div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="mt-6 text-[#A1A1AA] text-sm">
                            Order details unavailable.
                        </p>
                    )}

                    <a
                        href="tel:08448327336"
                        data-testid="success-call-cta"
                        className="mt-5 inline-flex items-center justify-center gap-2 w-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] font-semibold text-sm px-4 py-3 rounded-full hover:bg-[#FFD700]/20 transition-colors"
                    >
                        <Phone size={14} /> For confirmation call: 084483 27336
                    </a>

                    <Link
                        to="/"
                        data-testid="success-back-home"
                        className="btn-primary inline-flex items-center justify-center gap-2 w-full mt-3"
                    >
                        <Home size={16} /> Back to Home
                    </Link>
                </div>
            </div>

            <style>{`
        .success-check-wrap {
          width: 92px; height: 92px; border-radius: 999px;
          background: rgba(34,197,94,0.12);
          display: flex; align-items: center; justify-content: center;
          animation: ringPop 0.6s cubic-bezier(.2,.8,.2,1) both;
        }
        .success-check {
          animation: checkPop 0.55s cubic-bezier(.2,.8,.2,1) 0.15s both;
        }
        @keyframes ringPop {
          0% { transform: scale(0.4); opacity: 0; }
          70% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes checkPop {
          0% { transform: scale(0.2); opacity: 0; }
          70% { transform: scale(1.18); opacity: 1; }
          100% { transform: scale(1); }
        }
      `}</style>
        </div>
    );
}

function Row({ label, value, muted }) {
    return (
        <div
            className={`flex items-center justify-between ${muted ? "text-[#F5F5F0]/70" : ""}`}
        >
            <span>{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}
