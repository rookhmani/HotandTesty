import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    adminLogin,
    listOrders,
    updateOrderStatus,
    fetchMenu,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
} from "../lib/api";
import {
    Loader2,
    LogOut,
    Plus,
    Save,
    Trash2,
    ArrowLeft,
    RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

const STATUSES = [
    "received",
    "preparing",
    "out-for-delivery",
    "delivered",
    "cancelled",
];
const CATEGORIES = [
    "potatoes",
    "rolls",
    "momos",
    "chowmein",
    "rice",
    "main-course",
    "chopsy",
];

export default function AdminPage() {
    const [authed, setAuthed] = useState(
        () => sessionStorage.getItem("admin-authed") === "1",
    );
    const [password, setPassword] = useState("");
    const [tab, setTab] = useState("orders");
    const [loading, setLoading] = useState(false);

    const onLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await adminLogin(password);
            sessionStorage.setItem("admin-authed", "1");
            setAuthed(true);
            toast.success("Welcome, chef!");
        } catch {
            toast.error("Wrong password");
        } finally {
            setLoading(false);
        }
    };

    if (!authed) {
        return (
            <div className="min-h-screen bg-[#0D0D0D] text-[#F5F5F0] flex items-center justify-center px-4">
                <form
                    onSubmit={onLogin}
                    data-testid="admin-login-form"
                    className="w-full max-w-sm bg-[#1A1A1A] border border-[#2a2a2a] rounded-3xl p-8"
                >
                    <Link
                        to="/"
                        className="text-xs uppercase tracking-widest text-[#A1A1AA] hover:text-[#FF6B35] inline-flex items-center gap-1"
                    >
                        <ArrowLeft size={12} /> Home
                    </Link>
                    <h1 className="mt-2 font-anton text-3xl uppercase">Admin Access</h1>
                    <p className="mt-1 text-sm text-[#A1A1AA]">
                        Enter the kitchen passphrase.
                    </p>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        data-testid="admin-password-input"
                        className="mt-5 w-full bg-[#0D0D0D] border border-[#2a2a2a] focus:border-[#FF6B35] outline-none rounded-lg px-3 py-2.5 text-sm"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        data-testid="admin-login-submit"
                        className="btn-primary w-full mt-4 inline-flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                        Enter
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0D0D0D] text-[#F5F5F0]">
            <header className="border-b border-[#2a2a2a] bg-[#0D0D0D]/85 backdrop-blur-xl sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link
                            to="/"
                            className="font-anton text-2xl uppercase tracking-tight text-[#FF6B35]"
                        >
                            Hot&amp;Tasty
                        </Link>
                        <span className="hidden sm:inline text-xs font-mono uppercase tracking-widest text-[#A1A1AA]">
                            Admin Panel
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            sessionStorage.removeItem("admin-authed");
                            setAuthed(false);
                        }}
                        data-testid="admin-logout"
                        className="text-xs uppercase tracking-widest text-[#A1A1AA] hover:text-[#FF6B35] inline-flex items-center gap-1"
                    >
                        <LogOut size={14} /> Logout
                    </button>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2 pb-3">
                    <Tab
                        label="Orders"
                        active={tab === "orders"}
                        onClick={() => setTab("orders")}
                        testId="admin-tab-orders"
                    />
                    <Tab
                        label="Menu"
                        active={tab === "menu"}
                        onClick={() => setTab("menu")}
                        testId="admin-tab-menu"
                    />
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {tab === "orders" ? <OrdersTab /> : <MenuTab />}
            </main>
        </div>
    );
}

function Tab({ label, active, onClick, testId }) {
    return (
        <button
            type="button"
            onClick={onClick}
            data-testid={testId}
            data-active={active}
            className="pill"
        >
            {label}
        </button>
    );
}

function OrdersTab() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const refresh = async () => {
        setLoading(true);
        try {
            const data = await listOrders();
            setOrders(data);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        refresh();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            await updateOrderStatus(id, status);
            toast.success("Order updated");
            refresh();
        } catch {
            toast.error("Failed to update");
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-5">
                <h2 className="font-anton text-3xl uppercase tracking-tight">
                    Orders <span className="text-[#A1A1AA] text-base ml-2">({orders.length})</span>
                </h2>
                <button
                    type="button"
                    onClick={refresh}
                    data-testid="admin-orders-refresh"
                    className="pill inline-flex items-center gap-1"
                >
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>
            {loading ? (
                <div className="py-20 flex items-center justify-center text-[#A1A1AA]">
                    <Loader2 className="animate-spin mr-2" /> Loading orders…
                </div>
            ) : orders.length === 0 ? (
                <div className="py-20 text-center text-[#A1A1AA] uppercase tracking-widest text-sm font-mono">
                    No orders yet.
                </div>
            ) : (
                <div className="space-y-3" data-testid="admin-orders-list">
                    {orders.map((o) => (
                        <div
                            key={o.id}
                            data-testid={`order-row-${o.id}`}
                            className="bg-[#1A1A1A] border border-[#2a2a2a] rounded-2xl p-5"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <div className="font-anton text-xl uppercase">
                                        #{o.id.slice(0, 8)}
                                    </div>
                                    <div className="text-xs text-[#A1A1AA] mt-0.5">
                                        {o.customer_name} · {o.phone} ·{" "}
                                        {new Date(o.created_at).toLocaleString()}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                                            o.payment_status === "paid"
                                                ? "bg-[#22C55E]/15 text-[#22C55E]"
                                                : "bg-[#FFD700]/15 text-[#FFD700]"
                                        }`}
                                    >
                                        {o.payment_status === "paid"
                                            ? "Paid"
                                            : o.payment_method === "cod"
                                              ? "COD"
                                              : "Pending"}
                                    </span>
                                    <span className="font-anton text-2xl text-[#FFD700]">
                                        ₹{o.total}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-3 text-sm text-[#F5F5F0]/80">
                                {o.items.map((i) => (
                                    <span key={`${i.item_id}-${i.variant}`} className="mr-3">
                                        {i.name} ({i.variant}) × {i.quantity}
                                    </span>
                                ))}
                            </div>
                            <div className="mt-3 text-xs text-[#A1A1AA]">{o.address}</div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {STATUSES.map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        data-testid={`status-${o.id}-${s}`}
                                        data-active={o.order_status === s}
                                        onClick={() => updateStatus(o.id, s)}
                                        className="pill text-[10px]"
                                    >
                                        {s.replace(/-/g, " ")}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function MenuTab() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const blank = {
        name: "",
        category: "momos",
        veg: true,
        description: "",
        image: "",
        price_full: 0,
        price_half: null,
        has_variants: false,
        available: true,
    };
    const [draft, setDraft] = useState(blank);

    const refresh = async () => {
        setLoading(true);
        try {
            const data = await fetchMenu();
            setItems(data);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        refresh();
    }, []);

    const onCreate = async (e) => {
        e.preventDefault();
        try {
            await createMenuItem({
                ...draft,
                price_full: Number(draft.price_full),
                price_half: draft.price_half ? Number(draft.price_half) : null,
            });
            toast.success("Item added");
            setDraft(blank);
            refresh();
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Failed");
        }
    };

    const onDelete = async (id) => {
        if (!window.confirm("Delete this item?")) return;
        try {
            await deleteMenuItem(id);
            toast.success("Deleted");
            refresh();
        } catch {
            toast.error("Failed");
        }
    };

    const toggleAvailable = async (item) => {
        try {
            await updateMenuItem(item.id, { available: !item.available });
            refresh();
        } catch {
            toast.error("Failed");
        }
    };

    return (
        <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
                <h2 className="font-anton text-3xl uppercase tracking-tight">
                    Add Item
                </h2>
                <form
                    onSubmit={onCreate}
                    data-testid="admin-add-menu-form"
                    className="mt-5 bg-[#1A1A1A] border border-[#2a2a2a] rounded-2xl p-5 space-y-3"
                >
                    <In
                        label="Name"
                        value={draft.name}
                        onChange={(v) => setDraft({ ...draft, name: v })}
                        testId="new-name"
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <Sel
                            label="Category"
                            value={draft.category}
                            onChange={(v) => setDraft({ ...draft, category: v })}
                            options={CATEGORIES}
                            testId="new-category"
                        />
                        <Sel
                            label="Type"
                            value={draft.veg ? "veg" : "non-veg"}
                            onChange={(v) => setDraft({ ...draft, veg: v === "veg" })}
                            options={["veg", "non-veg"]}
                            testId="new-veg"
                        />
                    </div>
                    <In
                        label="Image URL"
                        value={draft.image}
                        onChange={(v) => setDraft({ ...draft, image: v })}
                        testId="new-image"
                    />
                    <In
                        label="Description"
                        value={draft.description}
                        onChange={(v) => setDraft({ ...draft, description: v })}
                        testId="new-desc"
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <In
                            label="Price Full (₹)"
                            type="number"
                            value={draft.price_full}
                            onChange={(v) => setDraft({ ...draft, price_full: v })}
                            testId="new-price-full"
                        />
                        <In
                            label="Price Half (₹)"
                            type="number"
                            value={draft.price_half ?? ""}
                            onChange={(v) =>
                                setDraft({
                                    ...draft,
                                    price_half: v === "" ? null : v,
                                    has_variants: v !== "" && v != null,
                                })
                            }
                            testId="new-price-half"
                        />
                    </div>
                    <button
                        type="submit"
                        data-testid="new-menu-submit"
                        className="btn-primary w-full inline-flex items-center justify-center gap-2"
                    >
                        <Plus size={16} /> Add Item
                    </button>
                </form>
            </div>

            <div className="lg:col-span-7">
                <div className="flex items-center justify-between">
                    <h2 className="font-anton text-3xl uppercase tracking-tight">
                        Menu <span className="text-base text-[#A1A1AA]">({items.length})</span>
                    </h2>
                    <button
                        type="button"
                        onClick={refresh}
                        className="pill inline-flex items-center gap-1"
                        data-testid="admin-menu-refresh"
                    >
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>
                {loading ? (
                    <div className="py-20 text-center text-[#A1A1AA]">
                        <Loader2 className="animate-spin inline" /> Loading…
                    </div>
                ) : (
                    <div className="mt-5 space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                        {items.map((it) => (
                            <div
                                key={it.id}
                                data-testid={`admin-menu-item-${it.id}`}
                                className="bg-[#1A1A1A] border border-[#2a2a2a] rounded-xl p-3 flex items-center gap-3"
                            >
                                <img
                                    src={it.image}
                                    alt={it.name}
                                    className="w-14 h-14 rounded-lg object-cover bg-[#0D0D0D]"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold truncate">{it.name}</div>
                                    <div className="text-xs text-[#A1A1AA]">
                                        {it.category} · {it.veg ? "Veg" : "Non-Veg"} · ₹
                                        {it.price_half ? `${it.price_half}/` : ""}
                                        {it.price_full}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => toggleAvailable(it)}
                                    className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full ${
                                        it.available
                                            ? "bg-[#22C55E]/15 text-[#22C55E]"
                                            : "bg-[#A1A1AA]/15 text-[#A1A1AA]"
                                    }`}
                                >
                                    {it.available ? "On" : "Off"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDelete(it.id)}
                                    data-testid={`del-${it.id}`}
                                    className="p-2 text-[#A1A1AA] hover:text-[#FF6B35]"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function In({ label, value, onChange, type = "text", testId }) {
    return (
        <label className="block">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">
                {label}
            </span>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                data-testid={testId}
                className="mt-1 w-full bg-[#0D0D0D] border border-[#2a2a2a] focus:border-[#FF6B35] outline-none rounded-lg px-3 py-2 text-sm"
            />
        </label>
    );
}

function Sel({ label, value, onChange, options, testId }) {
    return (
        <label className="block">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">
                {label}
            </span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                data-testid={testId}
                className="mt-1 w-full bg-[#0D0D0D] border border-[#2a2a2a] focus:border-[#FF6B35] outline-none rounded-lg px-3 py-2 text-sm"
            >
                {options.map((o) => (
                    <option key={o} value={o}>
                        {o}
                    </option>
                ))}
            </select>
        </label>
    );
}
