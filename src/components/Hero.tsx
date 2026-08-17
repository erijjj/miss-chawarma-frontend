import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const MENU_SECTION_ID = "#";
const CONTACT_SECTION_ID = "#";

const Hero = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showMiss, setShowMiss] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowMiss((prev) => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="relative w-full flex items-center justify-center overflow-hidden"
      style={{ height: "100vh", minHeight: "100vh" }}
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/videos/vidback.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60 z-10" />

      <div className="relative z-20 w-full flex flex-col items-center justify-center text-center px-6 sm:px-10 lg:px-16 pt-10 sm:pt-14">
        <h1
          data-aos="fade-up"
          data-aos-delay="100"
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-playfair font-bold text-white mb-10 leading-tight w-full max-w-4xl"
        >
          {t("hero.greeting")}{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #2d8a2d, #5cb85c, #a8d5a2)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              display: "inline-block",
              animation: "slideInRight 0.8s ease forwards",
              fontFamily: "Fraunces, serif",
              letterSpacing: "0.05em",
              fontWeight: 400,
            }}
          >
            {t("hero.brandName")}
          </span>{" "}
        </h1>
        <Button
          variant="outline"
          size="lg"
          className="w-full sm:w-auto min-w-[200px] px-8 py-3 text-lg font-semibold transition-all duration-300 hover:scale-105 text-white hover:text-white"
          style={{
            background: "linear-gradient(135deg, #0b2757, #1d589c, #3fb8c9)",
            borderColor: "transparent",
            fontFamily: "'Fraunces', serif",
            fontWeight: 600,
            letterSpacing: "0.02em",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(135deg, #1a7a8f, #7fd8e8)";
            e.currentTarget.style.borderColor = "transparent";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(135deg, #0b2757, #1d589c, #3fb8c9)";
            e.currentTarget.style.borderColor = "transparent";
          }}
          onClick={() => navigate("/menu")}
        >
          {t("hero.commande")}
        </Button>
        <p
          data-aos="fade-up"
          data-aos-delay="500"
          className="font-playfair  text-base sm:text-lg md:text-xl text-gray-200 mt-8 mb-8 w-full max-w-2xl leading-relaxed"
        >
          {t("hero.subtitleLine1")}
          <br /> {t("hero.subtitleLine2")}
          <br /> {t("hero.subtitleLine3")}
          <br />
          <br />
          <span style={{ color: "#d08916" }} className="font-semibold">
            <a
              href="https://maps.google.com/?q=128+Rue+Oberkampf+Paris+11"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#b7f3c0", textDecoration: "none" }}
              className="font-light tracking-widest text-sm sm:text-base transition-all duration-200"
              onMouseEnter={(e) => {
                const target = e.currentTarget.querySelectorAll(
                  "span",
                )[1] as HTMLElement;
                if (target) {
                  target.style.textDecoration = "underline";
                  target.style.textUnderlineOffset = "3px";
                }
                e.currentTarget.style.color = "#6facf7";
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget.querySelectorAll(
                  "span",
                )[1] as HTMLElement;
                if (target) {
                  target.style.textDecoration = "none";
                }
                e.currentTarget.style.color = "#b7f3c0";
              }}
            >
              <span style={{ textDecoration: "none" }}>📍 </span>
              <span>{t("hero.location")}</span>
            </a>
          </span>
        </p>

        <div
          data-aos="fade-up"
          data-aos-delay="1000"
          className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-sm sm:max-w-none"
        >
          <Button
            size="lg"
            className="w-full sm:w-[280px] h-[52px] flex items-center justify-center whitespace-nowrap px-8 text-lg font-semibold transition-all duration-300 hover:scale-105 border-0 text-white"
            style={{
              background: "linear-gradient(135deg, #055c05, #0c7e0c, #a8d5a2)",
              fontFamily: "'Fraunces', serif",
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
            onClick={() => navigate("/menu")}
          >
            {t("hero.exploreMenu")}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-[280px] h-[52px] flex items-center justify-center whitespace-nowrap px-8 text-lg font-semibold transition-all duration-300 hover:scale-105 text-white hover:text-white"
            style={{
              background: "linear-gradient(135deg, #fbce8b, #bfa435)",
              borderColor: "transparent",
              fontFamily: "'Fraunces', serif",
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg,  #fbce8b, #bfa435)";
              e.currentTarget.style.borderColor = "transparent";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg,  #fbce8b, #bfa435)";
              e.currentTarget.style.borderColor = "transparent";
            }}
            onClick={() => navigate("/book-a-table")}
          >
            {t("hero.tableReservation")}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-[280px] h-[52px] flex items-center justify-center whitespace-nowrap px-8 text-lg font-semibold transition-all duration-300 hover:scale-105 text-white hover:text-white"
            style={{
              background: "linear-gradient(135deg, #a8d5a2, #0c7e0c, #055c05)",
              borderColor: "transparent",
              fontFamily: "'Fraunces', serif",
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, #a8d5a2, #0c7e0c, #055c05)";
              e.currentTarget.style.borderColor = "transparent";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, #a8d5a2, #0c7e0c, #055c05)";
              e.currentTarget.style.borderColor = "transparent";
            }}
            onClick={() => navigate("/book-event")}
          >
            {t("hero.eventReservation")}
          </Button>
        </div>
      </div>

      <div
        className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 cursor-pointer"
        data-aos="fade-up"
        data-aos-delay="1500"
        onClick={() => scrollToSection("#chefs")}
        role="button"
        aria-label={t("hero.scrollDown", "Défiler vers le bas")}
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
