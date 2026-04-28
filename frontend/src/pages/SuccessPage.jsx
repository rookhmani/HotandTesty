import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { checkPayment } from "../lib/api";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { useCart } from "../context/CartContext";

const MAX_ATTEMPTS = 6;
const POLL_MS = 2500;

export default function SuccessPage() {
    const [params] = useSearchParams();
    const sessionId = params.get("session_id");
    const [status, setStatus] = useState("polling");
    const [data, setData] = useState(null);
    const { clearCart } = useCart();

    useEffect(() => {
        if (!sessionId) {
            setStatus("error");
            return;
        }
        let cancelled = false;
        let attempts = 0;
        const poll = async () => {
            try {
                const res = await checkPayment(sessionId);
                if (cancelled) return;
                setData(res);
                if (res.payment_status === "paid") {
                    setStatus("paid");
                    clearCart();
                    return;
                }
                if (res.status === "expired") {
                    setStatus("expired");
                    return;
                }
                attempts += 1;
                if (attempts >= MAX_ATTEMPTS) {
                    setStatus("timeout");
                    return;
                }
                setTimeout(poll, POLL_MS);
            } catch {
                if (!cancelled) setStatus("error");
            }
        };
        poll();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId]);

    return (
        <div
            data-testid="success-page"
            className="min-h-screen bg-[#0D0D0D] text-[#F5F5F0] flex items-center justify-center px-4"
        >
            <div className="max-w-md w-full bg-[#1A1A1A] border border-[#2a2a2a] rounded-3xl p-8 text-center">
                {status === "polling" && (
                    <>
                        <Loader2
                            className="mx-auto animate-spin text-[#FF6B35]"
                            size={42}
                        />
                        <h1 className="mt-4 font-anton text-3xl uppercase">
                            Confirming Payment…
                        </h1>
                        <p className="mt-2 text-sm text-[#A1A1AA]">
                            Hang tight, we're verifying with Stripe.
                        </p>
                    </>
                )}
                {status === "paid" && (
                    <>
                        <CheckCircle2 className="mx-auto text-[#FFD700]" size={48} />
                        <h1 className="mt-4 font-anton text-3xl uppercase">
                            Order Confirmed!
                        </h1>
                        <p className="mt-2 text-sm text-[#A1A1AA]">
                            Paid <span className="text-[#FFD700]">₹{data?.amount}</span>.
                            We've started cooking.
                        </p>
                        <Link
                            to="/"
                            className="btn-primary inline-flex mt-6"
                            data-testid="success-back-home"
                        >
                            Back to Home
                        </Link>
                    </>
                )}
                {(status === "timeout" || status === "expired" || status === "error") && (
                    <>
                        <AlertTriangle className="mx-auto text-[#FF6B35]" size={42} />
                        <h1 className="mt-4 font-anton text-3xl uppercase">
                            {status === "expired" ? "Session Expired" : "Couldn't Verify"}
                        </h1>
                        <p className="mt-2 text-sm text-[#A1A1AA]">
                            {status === "timeout"
                                ? "Payment is still processing. Check your email or call us."
                                : "Please try again or contact us at 084483 27336."}
                        </p>
                        <Link to="/" className="btn-outline inline-flex mt-6">
                            Back to Home
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
