import React, { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Chefs from "@/components/Chefs";
import Contact from "@/components/Contact";

const SECTIONS = [
  { id: "hero", Component: Hero },
  { id: "chefs", Component: Chefs },
  { id: "contact", Component: Contact },
];

const HomePage = () => {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const target = document.querySelector(hash);
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      }, 500);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div
        className="fixed top-0 left-0 right-0 z-40"
        style={{ height: "8px" }}
        onMouseEnter={() => window.dispatchEvent(new CustomEvent("showHeader"))}
      />
      {SECTIONS.map(({ id, Component }) => (
        <section key={id} id={id}>
          <Component />
        </section>
      ))}
      <Footer />
    </div>
  );
};

export default HomePage;