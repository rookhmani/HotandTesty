import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";

export default function CancelPage() {
    return (
        <div
            data-testid="cancel-page"
            className="min-h-screen bg-[#0D0D0D] text-[#F5F5F0] flex items-center justify-center px-4"
        >
            <div className="max-w-md w-full bg-[#1A1A1A] border border-[#2a2a2a] rounded-3xl p-8 text-center">
                <XCircle className="mx-auto text-[#FF6B35]" size={48} />
                <h1 className="mt-4 font-anton text-3xl uppercase">Payment Cancelled</h1>
                <p className="mt-2 text-sm text-[#A1A1AA]">
                    No worries — your cart is still waiting.
                </p>
                <Link to="/" className="btn-primary inline-flex mt-6">
                    Back to Menu
                </Link>
            </div>
        </div>
    );
}
