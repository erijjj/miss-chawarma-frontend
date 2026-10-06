import React from "react";
import { useTranslation } from "react-i18next";
import LogoMC from "../assets/images/logoBlancMC.png";
import { Instagram } from "lucide-react";
import { Link } from "react-router-dom";

const SOCIAL_LINKS = [
  {
    name: "Instagram",
    icon: Instagram,
    href: "https://www.instagram.com/miss.chawarma/",
  },
];

const CONTACT_INFO = {
  address: ["128 Rue Oberkampf", "Paris 11e"],
  phone: "+33 1 42 52 60 48",
};

const HOURS = [
  { days: "Lun - Mer", time: "11h30 – 00h00" },
  { days: "Jeu - Dim", time: "11h30 – 02h00" },
];

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const QUICK_LINKS = [
    { name: t("footer.linkHome"), href: "#home" },
    { name: t("footer.linkStory"), href: "#about" },
    { name: t("footer.linkMenu"), href: "/menu" },
    { name: t("footer.linkChef"), href: "#chefs" },
    { name: t("footer.linkContact"), href: "#contact" },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer
      style={{ background: "#0f2a1a" }}
      className="border-t border-white/10 mt-0"
    >
      <div className="container-width py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo + description */}
          <div className="space-y-4">
            <img src={LogoMC} width={120} height={120} />
            <p className="text-sm leading-relaxed" style={{ color: "#a0a0a0" }}>
              {t("footer.description1")}
              <br />
              {t("footer.description2")}
            </p>
            <div className="flex space-x-3">
              {SOCIAL_LINKS.map(({ name, icon: Icon, href }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{ background: "#1f6b2d", color: "white" }}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
              {/* TikTok */}

              <a
                href="https://www.tiktok.com/@miss.chawarma"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ background: "#1f6b2d", color: "white" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Liens rapides */}
          <div className="space-y-4">
            <h4 className="text-lg font-playfair" style={{ color: "#fff8d8" }}>
              {t("footer.quickLinks")}
            </h4>
            <ul className="space-y-2">
              {QUICK_LINKS.map(({ name, href }) => (
                <li key={href}>
                  {href.startsWith("/") ? (
                    <Link
                      to={href}
                      className="text-sm transition-colors duration-200 text-left"
                      style={{ color: "#a0a0a0" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#5cb85c")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#a0a0a0")
                      }
                    >
                      {name}
                    </Link>
                  ) : (
                    <button
                      onClick={() => scrollToSection(href)}
                      className="text-sm transition-colors duration-200 text-left"
                      style={{ color: "#a0a0a0" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#5cb85c")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#a0a0a0")
                      }
                    >
                      {name}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}

          <div className="space-y-4">
            <h4 className="text-lg font-playfair" style={{ color: "#a0a0a0" }}>
              {t("footer.contact")}
            </h4>
            <br />
            <a
              href="tel:+33142526048"
              className=" text-sm hover:opacity-80 transition-opacity"
              style={{ color: "#a0a0a0" }}
            >
              {CONTACT_INFO.phone}
            </a>
            <br />
            <div className="space-y-2 text-sm" style={{ color: "#a0a0a0" }}>
              {CONTACT_INFO.address.map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}

              <a
                href="https://maps.google.com/?q=128+Rue+Oberkampf+Paris+11"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs italic hover:opacity-80 transition-opacity"
                style={{ color: "#c47d0e" }}
              >
                {t("footer.viewOnMaps")}
              </a>
            </div>
          </div>

          {/* Horaires */}
          <div className="space-y-4">
            <h4 className="text-lg font-playfair" style={{ color: "#fff8d8" }}>
              {t("footer.hours")}
            </h4>
            <div className="space-y-2 text-sm" style={{ color: "#a0a0a0" }}>
              {HOURS.map(({ days, time }) => (
                <div key={days} className="flex justify-between gap-4">
                  <span>{days} :</span>
                  <span style={{ color: "#5cb85c" }}>{time}</span>
                </div>
              ))}
              <p className="text-xs mt-2" style={{ color: "#a0a0a0" }}>
                {t("footer.openDaily")}
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        {/* Copyright */}
        <div
          className="mt-10 pt-6 text-center text-xs"
          style={{ borderTop: "1px solid #333", color: "#666" }}
        >
          © {currentYear} Miss Chawarma · By Maison MEZZÉ ·{" "}
          {t("footer.copyright")}
          {" · "}
          <Link
            to="/mentions-legales"
            className="hover:opacity-80 transition-opacity"
            style={{ color: "#888" }}
          >
            {t("footer.legalNotice", "Mentions légales")}
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
