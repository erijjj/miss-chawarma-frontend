import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MenuSection from "@/components/MenuSection";
const Menu = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* Zone hover pour faire réapparaître le header */}
      <div
        className="fixed top-0 left-0 right-0 z-40"
        style={{ height: "8px" }}
        onMouseEnter={() => window.dispatchEvent(new CustomEvent("showHeader"))}
      />
      <div className="pt-0">
        <MenuSection />
      </div>
      <Footer />
    </div>
  );
};

export default Menu;