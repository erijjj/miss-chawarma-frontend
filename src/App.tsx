import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import MenuSection from "./components/MenuSection";
import NotFound from "./pages/NotFound";
import AOS from "aos";
import "aos/dist/aos.css";
import BookTable from "./pages/BookTable";
import BookEvent from "./pages/BookEvent";
import Checkout from "./pages/Checkout";
import Chatbot from "./components/Chatbot";
import ScrollToTop from "./components/ScrollToTop";
import { CartProvider } from "./context/CartContext";
import CartDrawer from "./components/CartDrawer";
import About from "./components/About";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    AOS.init({
      duration: 800, // animation duration
      once: true, // animate only once
      offset: 100, // trigger point
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
             <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/book-a-table" element={<BookTable />} />
              <Route path="/book-event" element={<BookEvent />} />
              <Route path="/commander" element={<Checkout />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />

            </Routes>
            <CartDrawer />
            <Chatbot />
          </BrowserRouter>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
