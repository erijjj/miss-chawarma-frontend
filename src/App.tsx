import { useEffect, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Index from "./pages/Index";

const MentionsLegales = lazy(() => import("./pages/MentionsLegales"));
const Menu = lazy(() => import("./pages/Menu"));
const NotFound = lazy(() => import("./pages/NotFound"));
const BookTable = lazy(() => import("./pages/BookTable"));
const BookEvent = lazy(() => import("./pages/BookEvent"));
const Checkout = lazy(() => import("./pages/Checkout"));
const ManageReservation = lazy(() => import("@/pages/ManageReservation"));

import AOS from "aos";
import "aos/dist/aos.css";

import Chatbot from "./components/Chatbot";
import ScrollToTop from "./components/ScrollToTop";
import CartDrawer from "./components/CartDrawer";
import About from "./components/About";
import CookieConsent from "./components/CookieConsent";
import MobileOrderDock from "./components/MobileOrderDock";

import { CartProvider } from "./context/CartContext";

const queryClient = new QueryClient();

/** Routes où la barre panier mobile ne doit pas s'afficher :
 *  les pages de réservation sont un tunnel séparé de la commande en ligne. */
const DOCK_HIDDEN_ROUTES = ["/book-a-table", "/book-event"];

const OrderDockGate = () => {
  const { pathname } = useLocation();

  const hidden = DOCK_HIDDEN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (hidden) return null;

  return <MobileOrderDock />;
};

const App = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
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

            <Suspense fallback={<div className="min-h-screen" />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/book-a-table" element={<BookTable />} />
                <Route path="/book-event" element={<BookEvent />} />
                <Route path="/commander" element={<Checkout />} />
                <Route
                  path="/manage-reservation"
                  element={<ManageReservation />}
                />
                <Route path="/mentions-legales" element={<MentionsLegales />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>

            {/* Mobile only:
                - empty cart -> Commander en ligne
                - cart filled -> Voir mon panier + total
                - compact after scroll
                - hidden during checkout / reservation management
                - hidden on booking pages (voir OrderDockGate) */}
            <OrderDockGate />

            <CartDrawer />
            <Chatbot />
            <CookieConsent />
          </BrowserRouter>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;