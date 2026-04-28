import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { CartProvider } from "./context/CartContext";
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import SuccessPage from "./pages/SuccessPage";
import CancelPage from "./pages/CancelPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";

function App() {
    return (
        <div className="App">
            <CartProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/admin" element={<AdminPage />} />
                        <Route path="/order/:orderId" element={<OrderSuccessPage />} />
                        <Route path="/success" element={<SuccessPage />} />
                        <Route path="/cancel" element={<CancelPage />} />
                    </Routes>
                </BrowserRouter>
                <Toaster
                    theme="dark"
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: "#1A1A1A",
                            border: "1px solid #2a2a2a",
                            color: "#F5F5F0",
                        },
                    }}
                />
            </CartProvider>
        </div>
    );
}

export default App;
