import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Menu from "../components/Menu";
import About from "../components/About";
import OrderInfo from "../components/OrderInfo";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";

export default function HomePage() {
    return (
        <div data-testid="home-page" className="bg-[#0D0D0D] text-[#F5F5F0] min-h-screen">
            <Navbar />
            <main>
                <Hero />
                <Menu />
                <About />
                <OrderInfo />
            </main>
            <Footer />
            <CartDrawer />
        </div>
    );
}
