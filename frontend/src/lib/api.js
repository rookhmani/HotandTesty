import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
    baseURL: API,
    headers: { "Content-Type": "application/json" },
});

export const fetchMenu = async (category) => {
    const params = category && category !== "all" ? { category } : {};
    const { data } = await api.get("/menu", { params });
    return data;
};

export const createOrder = async (payload) => {
    const { data } = await api.post("/orders", payload);
    return data;
};

export const initStripe = async (orderId) => {
    const { data } = await api.post("/checkout/session", {
        order_id: orderId,
        origin_url: window.location.origin,
    });
    return data;
};

export const checkPayment = async (sessionId) => {
    const { data } = await api.get(`/checkout/status/${sessionId}`);
    return data;
};

export const adminLogin = async (password) => {
    const { data } = await api.post("/admin/login", { password });
    return data;
};

export const listOrders = async () => {
    const { data } = await api.get("/orders");
    return data;
};

export const updateOrderStatus = async (orderId, order_status) => {
    const { data } = await api.put(`/orders/${orderId}/status`, { order_status });
    return data;
};

export const createMenuItem = async (payload) => {
    const { data } = await api.post("/menu", payload);
    return data;
};

export const updateMenuItem = async (id, payload) => {
    const { data } = await api.put(`/menu/${id}`, payload);
    return data;
};

export const deleteMenuItem = async (id) => {
    const { data } = await api.delete(`/menu/${id}`);
    return data;
};
