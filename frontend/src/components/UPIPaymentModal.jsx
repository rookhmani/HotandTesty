import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "../components/ui/dialog";
import { Copy, Check, Loader2, QrCode } from "lucide-react";
import { fetchSettings, submitUTR } from "../lib/api";
import { toast } from "sonner";

export default function UPIPaymentModal({ open, onOpenChange, order, onPaid }) {
    const [settings, setSettings] = useState(null);
    const [utr, setUtr] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (open) {
            fetchSettings()
                .then(setSettings)
                .catch(() => setSettings(null));
            setUtr("");
            setCopied(false);
        }
    }, [open]);

    const onCopy = async () => {
        if (!settings?.upi_id) return;
        try {
            await navigator.clipboard.writeText(settings.upi_id);
            setCopied(true);
            toast.success("UPI ID copied");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Couldn't copy — please copy manually");
        }
    };

    const onPaid_ = async () => {
        const trimmed = utr.trim();
        if (trimmed.length < 6) {
            toast.error("Enter a valid UPI Transaction ID / UTR (at least 6 chars)");
            return;
        }
        setLoading(true);
        try {
            const updated = await submitUTR(order.id, trimmed);
            toast.success("Payment recorded!");
            onPaid?.(updated);
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Failed to record payment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                data-testid="upi-payment-modal"
                className="bg-[#1A1A1A] border border-[#2a2a2a] text-[#F5F5F0] sm:max-w-md max-h-[92vh] overflow-y-auto"
            >
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-[#FF6B35]/15 text-[#FF6B35] flex items-center justify-center">
                            <QrCode size={18} />
                        </span>
                        <DialogTitle className="font-anton text-2xl uppercase tracking-tight">
                            Scan &amp; Pay
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-[#A1A1AA]">
                        Pay using Google Pay, PhonePe, or Paytm.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                    <div className="bg-white rounded-2xl p-3 mx-auto w-full max-w-[280px]">
                        {settings?.upi_qr_image ? (
                            <img
                                src={settings.upi_qr_image}
                                alt="UPI QR Code"
                                data-testid="upi-qr-image"
                                className="w-full h-auto"
                            />
                        ) : (
                            <div className="aspect-square flex items-center justify-center text-[#0D0D0D]/60">
                                <Loader2 className="animate-spin" />
                            </div>
                        )}
                    </div>

                    <div className="bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl p-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <div className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">
                                UPI ID
                            </div>
                            <div
                                data-testid="upi-id-display"
                                className="font-mono text-sm font-bold truncate"
                            >
                                {settings?.upi_id || "—"}
                            </div>
                            {settings?.upi_name && (
                                <div className="text-[11px] text-[#A1A1AA] truncate">
                                    {settings.upi_name}
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={onCopy}
                            data-testid="upi-copy-btn"
                            className="inline-flex items-center gap-1.5 bg-[#FF6B35] text-[#0D0D0D] font-bold text-xs px-3 py-2 rounded-full hover:bg-[#E85D2A] active:scale-95 transition-all"
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? "Copied" : "Copy"}
                        </button>
                    </div>

                    <div className="text-center bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-xl py-2.5">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#FFD700]/80">
                            Amount to pay
                        </span>
                        <div className="font-anton text-3xl text-[#FFD700]">
                            ₹{order?.total ?? 0}
                        </div>
                    </div>

                    <label className="block">
                        <span className="text-xs font-mono uppercase tracking-widest text-[#A1A1AA]">
                            UPI Transaction ID / UTR Number{" "}
                            <span className="text-[#FF6B35]">*</span>
                        </span>
                        <input
                            type="text"
                            value={utr}
                            onChange={(e) => setUtr(e.target.value)}
                            placeholder="e.g. 4XXXXXXXXXXX"
                            data-testid="upi-utr-input"
                            className="mt-1 w-full bg-[#0D0D0D] border border-[#2a2a2a] focus:border-[#FF6B35] outline-none rounded-lg px-3 py-2.5 text-sm font-mono"
                        />
                        <span className="text-[11px] text-[#A1A1AA] mt-1 block">
                            You'll find this in your UPI app's payment confirmation.
                        </span>
                    </label>

                    <button
                        type="button"
                        onClick={onPaid_}
                        disabled={loading}
                        data-testid="upi-have-paid-btn"
                        className="btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Recording…
                            </>
                        ) : (
                            <>I Have Paid <Check size={18} strokeWidth={3} /></>
                        )}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
