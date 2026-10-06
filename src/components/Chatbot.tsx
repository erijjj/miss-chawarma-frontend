import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const API_URL = "https://chatbot-api-o6bw.onrender.com";

const SYSTEM_PROMPT = `Tu es LaMiss, l'assistante virtuelle chaleureuse et experte de Miss Chawarma, un restaurant libanais authentique situé au 128 Rue Oberkampf, Paris 11e. Tu parles comme un excellent serveur libanais : accueillant, gourmand, enthousiaste, et tu donnes envie de commander.

== IDENTITÉ DU RESTAURANT ==
Nom : Miss Chawarma
Adresse : 128 Rue Oberkampf, 75011 Paris (Métro : Oberkampf ou Parmentier)
Téléphone : +33 1 42 52 60 48
Téléphone événements : +33 7 82 73 77 77
Email : via le formulaire de contact sur le site
Site web : misschawarma.fr
Instagram : @misschawarma

== HORAIRES ==
Lundi – Mercredi : 11h30 – 00h00
Jeudi – Dimanche : 11h30 – 02h00
Ouvert 7j/7

== RÉSERVATIONS ==
- Réserver une table : via le site → section "Réserver une table" ou appeler le +33 1 42 52 60 48
- Organiser un événement privé (max 42 personnes) : via le site → section "Organiser un événement" ou appeler le +33 7 82 73 77 77
- Types d'événements : anniversaire, séminaire, team building, repas d'affaires, baby shower, soirée privée

== MENU COMPLET ==

--- MEZZÉS CHAUDS (8,90€) ---
• Hallou'me : fromage de chèvre, thym, tomates et huile d'olive. Allergènes : Lait
• Batata harra : pommes de terre sautées à l'ail et coriandre
• Makanek fait maison : saucisse de bœuf et mélasse de grenade
• Soujouk fait maison : saucisse de bœuf épicée
• Sawda poulet : foie de volaille sauté à l'ail, coriandre, mélasse de grenade et citron
• Hommous avec Chawarma : purée de pois chiche, viande hachée, pignons de pin, paprika. Allergènes : Sésame, Fruits à coque

--- MEZZÉS FROIDS (7,50€) ---
• Hommous : purée de pois chiche, tahina, citron, huile d'olive. Allergènes : Sésame
• Baba Ghanouj / Mouttabbal : aubergine à la crème de sésame. Allergènes : Sésame
• Labné à la libanaise : fromage blanc, thym, menthe, huile d'olive. Allergènes : Lait
• Moussaka : aubergine grillée, pois chiche, sauce tomate
• Mojadara : lentilles et riz aux oignons caramélisés
• Loubia b Zeyt : haricots verts mijotés à la tomate et huile d'olive
• Warak Enab : feuilles de vigne farcies au riz, tomates et persil

--- MEZZÉS À PARTAGER ---
• 2 personnes : 45€ — 7 mezzés assortis
• 3 personnes : 63€ — 10 mezzés assortis
• 4 personnes : 80€ — 12 mezzés assortis
• 5 personnes : 95€ — 14 mezzés assortis
• 6 personnes : 106€ — 16 mezzés assortis

--- SALADES (7,20€) ---
• Mrs. Fattoush : salade verte, tomates, concombres, radis, poivrons, citron
• Miss Tabboulé : persil, blé concassé, menthe, tomates, oignons, citron

--- BEIGNETS (8,90€ / 4 pièces — 15,90€ / 8 pièces) ---
• Falafel : boulettes de fèves et pois chiche
• Sambousek fromage : fromage feta, graines de nigelle, persil. Allergènes : Lait
• Sambousek viande : viande hachée et oignons
• Rikakat : feuilleté au fromage feta et herbes. Allergènes : Lait
• Sfiha Baalbakye : tartelette de viande aux épices
• Sfiha aubergine : aubergine, tomates, pois chiches
• Fatayer : chaussons aux épinards citronnés
• Kebbé : viande hachée, blé concassé, pignons de pin. Allergènes : Noix

--- PLATS FORMULES MAISON ---
• Mr. Tarbouch : 20€ — makanek et soujouk maison, 3 mezzés, 3 beignets, batata harra
• Miss Chawarma : 23€ — duo de chawarma, 3 assortiments du chef, 3 beignets, batata harra
• Maison Mezze : 25€ — 3 mezzés, 3 beignets, batata harra, chich taouk, sandwich chawarma
• Mezze Royal : 27€ — 4 mezzés, 3 beignets, batata harra, chich taouk, kafta, soujouk, makanek + boisson

--- PLATS CHAWARMA ---
• Chawarma Poulet : 16,90€ — poulet mariné rôti à la broche + 3 assortiments
• Chawarma Bœuf : 18,90€ — bœuf mariné + 3 assortiments

--- GRILLADES AU FEU DE BOIS ---
• Chichtaouk : 16,90€ — 2 brochettes poulet mariné au citron + 3 assortiments
• Kafta : 16,90€ — 2 brochettes bœuf haché, persil, oignons + 3 assortiments
• Miss Lahmé : 20,90€ — 2 brochettes agneau mariné + 3 assortiments
• Mix'Ta Grill : 22,90€ — chichtaouk + kafta + lahmé + 3 assortiments

--- PLATS DÉCOUVERTES ---
• Mrs. Végé'dream : 14,90€ — hommous, taboulé, moutabal, fatayer, sfiha aubergine, falafel
• Mrs. Falafel : 14,90€ — 4 falafels, hommous, taboulé, crème de sésame
• Foie volaille : 14,90€ — foie de volaille + 3 assortiments

--- BURGERS ---
• Hamburger libanais au feu de bois : 14,90€ — steak haché, tomates, oignons grillés, coleslaw, cornichons + 2 assortiments + frites

--- SANDWICHES CLASSIQUES (8,90€) ---
• Chawarma poulet : poulet mariné, cornichons, sauce à l'ail, frites
• Chawarma Bœuf : bœuf mariné, persil, oignons, tomates, tahina, cornichons, batata harra
• Chich taouk : poulet mariné, cornichons, salade de choux, sauce à l'ail, frites
• Kafta : viande hachée, persil, oignons, tomates, crème de sésame
• Fahita : poulet mariné, sauce tomate, poivron, champignon, oignons, cornichons
• Poulet crispy : poulet au curry, sauce à l'ail, tomates, salade, cornichons, frites
• Sojok fait maison : saucisses libanaises, sauce à l'ail, batata harra, tomates
• Makanek fait maison : saucisses libanaises, mélasse de grenade, sauce à l'ail
• Kebbé : bœuf haché, blé, crème de sésame, oignons, tomates

--- SANDWICHES VÉGÉTARIENS (8,90€) ---
• Falafel : beignets pois chiche, tomates, salade, tahina, hommous
• Batata/Frites : frites, tomates, salade, ketchup, coleslaw, sauce à l'ail
• Labné : fromage blanc, tomates, menthe, huile d'olive, chips de zaatar
• Moutabal / Baba Ghanouj : aubergines, crème de sésame, batata harra, tomates
• Makali : chou-fleur grillé, aubergine grillée, batata harra, tomates, salade
• Halloumi : fromage halloumi, zaatar, tomates, taboulé, salade
• Miss Végé : moutabal, taboulé, feuilles de vigne

--- SANDWICHES COMBOS ---
• Tarbouch : 12,90€ — 1 sandwich + 2 beignets + boisson
• Mez'Mix : 13,90€ — sandwich + 2 mezzés froids + boisson
• Miss : 13,90€ — sandwich + 2 baklawas ou mouhalabiyé + boisson
• Mez'Max : 16,90€ — 2 sandwiches + boisson
• Mrs.bowl : 11,90€ — riz libanais ou batata harra + chawarma/taouk/falafel + 2 beignets + boisson

--- DESSERTS ---
• Baklawa Cajou : 2€ — feuilleté au miel et noix de cajou
• Baklawa pistache : 2,50€ — feuilleté au miel et pistache
• Mouhalabiyé : 4,90€ — flan libanais, fleur d'oranger, pistaches
• Maacarons libanais : 3,90€
• Namoura : 3,90€ — gâteau semoule libanais
• Knefeh : 7,90€ — cheveux d'ange, fromage, pistaches, sirop
• Sfouf : 3,90€ — gâteau semoule et curcuma
• Café ou Thé gourmand : 7,90€ — café/thé + 2 pâtisseries

--- BOISSONS ---
• Citronnade maison : 3,50€
• Jus fruits rouges maison : 4€
• Sodas : 2,50€ (Coca, Ice Tea, Fanta, Oasis, Orangina, Sprite, Schweppes, 7up Mojito)
• Eau : 2€
• Ayran : 2,50€ (lait fermenté salé)
• Miss Tea : 2€ (thé maison menthe, cannelle, thym, fleur d'oranger)
• Café by Nespresso : 2,50€

== ALLERGÈNES ==
- Sésame : hommous, baba ghanouj, plusieurs sandwiches
- Lactose : hallou'me, labné, sambousek fromage, rikakat, mouhalabiyé, ayran
- Fruits à coque : kebbé, baklawas, mouhalabiyé, knefeh
- Gluten : la plupart des sandwiches et beignets
Tu dois TOUJOURS mentionner les allergènes si le client a une intolérance.

== RECOMMANDATIONS PAR PROFIL ==
- Première visite : Chawarma poulet sandwich ou Miss Chawarma (plat), Citronnade maison, Baklawa pistache
- Végétarien : Mrs. Végé'dream, Falafel, Halloumi, Makali, Moutabal, Hommous, Tabboulé
- Amateur de grillades : Mix'Ta Grill, Kafta, Chichtaouk, Miss Lahmé
- Groupe / partage : Mezzés 2-6 personnes, Mezze Royal
- Pressé : Sandwiches combos Tarbouch ou Mrs.bowl
- Gourmet : Mezze Royal, Mix'Ta Grill, Knefeh en dessert
- Famille : Mezzés à partager, sandwiches variés, falafels pour les enfants
- Touriste découverte Liban : Miss Chawarma (plat), Warak Enab, Citronnade, Mouhalabiyé

== RÈGLES DE COMPORTEMENT ==
- Réponds TOUJOURS en français
- Sois chaleureuse, enthousiaste et donne envie de commander
- Si quelqu'un demande à réserver, guide-le vers le site ou le téléphone
- Si quelqu'un a des allergènes, adapte tes recommandations
- Propose toujours un accompagnement ou un dessert (upselling naturel)
- Ne réponds qu'aux questions liées à Miss Chawarma
- Si la question ne concerne pas Miss Chawarma, réponds gentiment que tu es spécialisée pour ce restaurant
- Garde tes réponses concises et agréables, maximum 3-4 phrases sauf si on te demande plus de détails
- Tu peux utiliser quelques emojis pour rendre la conversation vivante 🌿🍋
- Réponds TOUJOURS dans la langue de l'utilisateur
- Si le site est en anglais, réponds en anglais
- Si le site est en français, réponds en français
`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

/** Actions rapides toujours visibles — ne dépendent jamais de ce que
 *  l'IA a écrit. Le filet de sécurité qui garantit que le client trouve
 *  toujours son chemin vers réserver / commander / voir le menu. */
const QUICK_ACTIONS = [
  { path: "/menu", emoji: "📋", labelFr: "Menu", labelEn: "Menu" },
  { path: "/book-a-table", emoji: "🍽️", labelFr: "Réserver", labelEn: "Book" },
  { path: "/book-event", emoji: "🎉", labelFr: "Événement", labelEn: "Event" },
];

const TypewriterText = ({
  text,
  speed = 18,
}: {
  text: string;
  speed?: number;
}) => {
  const [displayed, setDisplayed] = React.useState("");

  useEffect(() => {
    let i = 0;
    setDisplayed("");

    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));

      if (i >= text.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <>
      <ReactMarkdown>{displayed}</ReactMarkdown>
      {displayed.length < text.length && (
        <span
          style={{
            display: "inline-block",
            width: "2px",
            height: "1em",
            background: "#1f6b2d",
            marginLeft: "2px",
            animation: "blink 1s infinite",
            verticalAlign: "middle",
          }}
        />
      )}
    </>
  );
};

const Chatbot = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const videoSrc =
    i18n.resolvedLanguage === "en"
      ? "/videos/lamissenglishVersion.mp4"
      : "/videos/chatbot.mp4";

  const audioSrc =
    i18n.resolvedLanguage === "en"
      ? "/videos/audioEnVersion.mp3"
      : "/videos/missAudio.mp4";

  const QUICK_SUGGESTIONS = t("chatbot.suggestions", {
    returnObjects: true,
  }) as string[];

  const [isOpen, setIsOpen] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [isLauncherHovered, setIsLauncherHovered] = useState(false);

  const getWelcomeMessage = (lang: string) => {
    if (lang === "en") {
      return "Marhaba! 🌿 I'm LaMiss, your guide at Miss Chawarma. I can help you with our menu, opening hours, reservations, or anything about the restaurant. How can I help you?";
    }

    return "Marhaba ! 🌿 Je suis LaMiss, votre guide chez Miss Chawarma. Je peux vous conseiller sur notre menu, nos horaires, les réservations ou tout ce qui concerne le restaurant. Comment puis-je vous aider ?";
  };

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: getWelcomeMessage(i18n.language) },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setMessages([
      { role: "assistant", content: getWelcomeMessage(i18n.language) },
    ]);
  }, [i18n.language]);

  useEffect(() => {
    // Pas besoin de forcer le défilement pour le seul message d'accueil —
    // ça coupait son début dès l'ouverture du chat. On ne défile qu'une
    // fois qu'une vraie conversation a commencé.
    if (isOpen && messages.length > 1) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 100);
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const handleFocus = () => {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 300);
    };

    const inputEl = inputRef.current;
    inputEl?.addEventListener("focus", handleFocus);

    return () => inputEl?.removeEventListener("focus", handleFocus);
  }, []);

  const playGreeting = () => {
    setIsTalking(true);

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const handleAvatarClick = () => {
    if (!isOpen) {
      playGreeting();
      setIsOpen(true);
      setIsLauncherHovered(false);
    } else {
      closeChat();
    }
  };

  const closeChat = () => {
    audioRef.current?.pause();
    setIsTalking(false);
    setIsLauncherHovered(false);
    setIsOpen(false);
  };

  /** Un clic sur une action rapide ou un lien intelligent dans un message :
   *  on navigue, et on referme le chat pour que le client voie tout de
   *  suite la page — pas besoin de fermer manuellement en plus. */
  const goToPage = (path: string) => {
    navigate(path);
    closeChat();
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setShowSuggestions(false);

    const userMessage: Message = {
      role: "user",
      content: text,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
          lang: i18n.resolvedLanguage,
          systemPrompt: SYSTEM_PROMPT,
        }),
      });

      const data = await res.json();

      const reply =
        data.reply || "Désolée, je n'ai pas pu répondre. Réessayez !";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: t("chatbot.errorMsg"),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .chatbot-launcher {
            bottom: calc(
              1.25rem + var(--mc-order-dock-offset, 0px)
            ) !important;
            transition:
              bottom .42s cubic-bezier(.2,.8,.2,1),
              transform .25s ease !important;
          }
        }
      `}</style>

      {/* Launcher LaMiss : reste visible pendant l'ouverture du chat */}
      <div
        className="chatbot-launcher fixed bottom-5 right-4 z-[60] sm:bottom-6 sm:right-6"
        onMouseEnter={() => {
          if (!isOpen) setIsLauncherHovered(true);
        }}
        onMouseLeave={() => setIsLauncherHovered(false)}
      >
          {!isOpen && (
            <div
              className={`chatbot-hover-card ${
                isLauncherHovered ? "chatbot-hover-card-visible" : ""
              }`}
            >
            <div className="flex items-start gap-3">
              <span
                className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{
                  color: "#c47d0e",
                  background: "rgba(196,125,14,0.10)",
                }}
              >
                👋
              </span>

              <div className="min-w-0">
                <p
                  className="font-playfair text-xl"
                  style={{ color: "#123f1d" }}
                >
                  {i18n.resolvedLanguage === "en" ? "Hello!" : "Bonjour !"}
                </p>

                <p className="mt-1 text-sm font-semibold text-neutral-700">
                  {i18n.resolvedLanguage === "en"
                    ? "I'm LaMiss click to chat"
                    : "Je suis LaMiss cliquez pour discuter"}
                </p>
              </div>
            </div>

              <span className="chatbot-hover-arrow" />
            </div>
          )}

          <div
            className="chatbot-avatar-wrap"
            style={{
              width: "82px",
              height: "82px",
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={handleAvatarClick}
              aria-label={
                isOpen
                  ? i18n.resolvedLanguage === "en"
                    ? "Close chat"
                    : "Fermer le chat"
                  : i18n.resolvedLanguage === "en"
                    ? "Open chat"
                    : "Ouvrir le chat"
              }
              className={`chatbot-avatar-button ${
                isOpen ? "chatbot-avatar-button-open" : ""
              }`}
            >
              {isTalking ? (
                <video
                  key={videoSrc}
                  autoPlay
                  muted
                  playsInline
                  onEnded={() => setIsTalking(false)}
                  className="h-full w-full rounded-full object-cover object-top"
                >
                  <source src={videoSrc} type="video/mp4" />
                </video>
              ) : (
                <img
                  src="/images/lamiss.jpeg"
                  alt="LaMiss - Assistante Miss Chawarma"
                  className="h-full w-full rounded-full object-cover object-top"
                />
              )}
            </button>

            <div className="chatbot-online-dot" />

            <div className="chatbot-avatar-ring" />
          </div>
        </div>

      <audio key={audioSrc} ref={audioRef} src={audioSrc} preload="auto" />

      {isOpen && (
        <div
          className="
            fixed inset-0 z-50 flex h-[100dvh] w-full flex-col
            overflow-hidden rounded-none shadow-2xl
            sm:inset-auto sm:bottom-[118px] sm:right-6
            sm:h-[560px] sm:max-h-[calc(100vh-142px)]
            sm:w-[380px] sm:rounded-3xl
          "
          style={{
            background: "#f7f0e488",
            border: "1px solid #e0d9cc",
          }}
        >
          <div
            className="flex flex-shrink-0 items-center gap-3 px-5 py-4"
            style={{
              background: "linear-gradient(135deg, #1f6b2d, #2d8a3e)",
            }}
          >
            <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full">
              <img
                src="/images/lamiss.jpeg"
                alt="LaMiss - Assistante Miss Chawarma"
                className="h-full w-full object-cover object-top"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-white">LaMiss</p>
              <p
                className="text-xs"
                style={{
                  color: "rgba(255,255,255,0.75)",
                }}
              >
                {t("chatbot.subtitle")}
              </p>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-300" />
                <span
                  className="hidden text-xs sm:inline"
                  style={{
                    color: "rgba(255,255,255,0.75)",
                  }}
                >
                  {t("chatbot.online")}
                </span>
              </div>

              <button
                type="button"
                onClick={closeChat}
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{
                  background: "rgba(255,255,255,0.2)",
                }}
                aria-label={
                  i18n.resolvedLanguage === "en"
                    ? "Close chat"
                    : "Fermer le chat"
                }
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Barre d'actions rapides — toujours là, ne dépend jamais de l'IA */}
          <div className="chatbot-quick-actions">
            {QUICK_ACTIONS.map(({ path, emoji, labelFr, labelEn }) => (
              <button
                key={path}
                type="button"
                onClick={() => goToPage(path)}
                className="chatbot-quick-action-btn"
              >
                <span aria-hidden="true">{emoji}</span>
                {i18n.resolvedLanguage === "en" ? labelEn : labelFr}
              </button>
            ))}
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                  style={{
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg, #1f6b2d, #2d8a3e)"
                        : "#fff",
                    color: msg.role === "user" ? "#fff8d8" : "#222121",
                    borderBottomRightRadius:
                      msg.role === "user" ? "4px" : "16px",
                    borderBottomLeftRadius:
                      msg.role === "assistant" ? "4px" : "16px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  }}
                >
                  {msg.content
                    .split(/(\[IMAGE:[^\]]+\]|\[LINK:[^:]+:[^\]]+\])/)
                    .map((part, j) => {
                      const imageMatch = part.match(/^\[IMAGE:([^\]]+)\]$/);
                      const linkMatch = part.match(/^\[LINK:([^:]+):([^\]]+)\]$/);

                      if (imageMatch) {
                        return (
                          <img
                            key={j}
                            src={imageMatch[1]}
                            alt="plat"
                            className="mt-2 w-full rounded-xl object-cover"
                            style={{
                              maxHeight: "200px",
                            }}
                          />
                        );
                      }

                      if (linkMatch) {
                        const [, path, label] = linkMatch;
                        return (
                          <button
                            key={j}
                            type="button"
                            onClick={() => goToPage(path)}
                            className="chatbot-smart-link"
                          >
                            <span>{label}</span>
                            <span aria-hidden="true">→</span>
                          </button>
                        );
                      }

                      if (!part) return null;

                      return msg.role === "assistant" &&
                        i === messages.length - 1 &&
                        !isLoading ? (
                        <TypewriterText key={j} text={part} />
                      ) : (
                        <ReactMarkdown key={j}>{part}</ReactMarkdown>
                      );
                    })}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div
                  className="flex items-center gap-1 rounded-2xl px-4 py-3"
                  style={{
                    background: "#fff",
                    borderBottomLeftRadius: "4px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-2 w-2 rounded-full"
                      style={{
                        background: "#9ca89b",
                        animation: `bounce 1.2s ease-in-out ${
                          i * 0.2
                        }s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {showSuggestions && messages.length === 1 && (
              <div className="mt-2 space-y-2">
                <p
                  className="text-center text-xs"
                  style={{
                    color: "#072c03",
                  }}
                >
                  {t("chatbot.frequentQuestions")}
                </p>

                {QUICK_SUGGESTIONS.map((suggestion, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => sendMessage(suggestion)}
                    className="w-full rounded-xl px-3 py-2 text-left text-xs transition-all hover:scale-[1.01]"
                    style={{
                      background: "#fff",
                      border: "1px solid #e0d9cc",
                      color: "#555",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div
            className="px-4 py-3"
            style={{
              borderTop: "1px solid #e0d9cc",
            }}
          >
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("chatbot.inputPlaceholder")}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="sentences"
                spellCheck={false}
                className="flex-1 rounded-2xl px-4 py-2.5 outline-none"
                style={{
                  background: "#fff",
                  border: "1px solid #e0d9cc",
                  color: "#333",
                  fontFamily: "inherit",
                  fontSize: "16px",
                }}
              />

              <button
                type="button"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all hover:scale-105"
                style={{
                  background:
                    input.trim() && !isLoading
                      ? "linear-gradient(135deg, #1f6b2d, #2d8a3e)"
                      : "#e0d9cc",
                  boxShadow:
                    input.trim() && !isLoading
                      ? "0 2px 8px rgba(31,107,45,0.3)"
                      : "none",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={input.trim() && !isLoading ? "white" : "#9ca89b"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>

            <p
              className="mt-2 text-center text-xs"
              style={{
                color: "#03330a",
              }}
            >
              {t("chatbot.poweredBy")}
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% {
            transform: translateY(0);
          }

          30% {
            transform: translateY(-6px);
          }
        }

        @keyframes blink {
          0%, 50% {
            opacity: 1;
          }

          51%, 100% {
            opacity: 0;
          }
        }

        .chatbot-launcher {
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
        }

        .chatbot-avatar-wrap {
          animation: chatbotAvatarFloat 4.2s ease-in-out infinite;
        }

        .chatbot-avatar-button {
          position: relative;
          z-index: 3;
          display: block;
          width: 82px;
          height: 82px;
          overflow: hidden;
          padding: 0;
          cursor: pointer;
          border: 3px solid #1f6b2d;
          border-radius: 999px;
          background: transparent;
          box-shadow:
            0 12px 30px rgba(31,107,45,0.27),
            0 4px 12px rgba(31,107,45,0.16);
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }

        .chatbot-avatar-button img,
        .chatbot-avatar-button video {
          width: 100%;
          height: 100%;
          display: block;
          border-radius: 999px;
          object-fit: cover;
          object-position: center top;
        }

        .chatbot-avatar-button-open {
          box-shadow:
            0 0 0 5px rgba(247,240,228,0.90),
            0 14px 34px rgba(31,107,45,0.34);
        }

        .chatbot-avatar-button:hover {
          transform: scale(1.055);
          box-shadow:
            0 16px 34px rgba(31,107,45,0.32),
            0 6px 14px rgba(31,107,45,0.18);
        }

        .chatbot-avatar-ring {
          position: absolute;
          inset: -5px;
          z-index: 1;
          border: 1px solid rgba(31,107,45,0.22);
          border-radius: 999px;
          animation: chatbotRingPulse 2.8s ease-out infinite;
          pointer-events: none;
        }

        .chatbot-online-dot {
          position: absolute;
          right: 1px;
          bottom: 3px;
          z-index: 10;
          width: 16px;
          height: 16px;
          border: 3px solid white;
          border-radius: 999px;
          background: #4ade80;
          box-shadow: 0 0 0 rgba(74,222,128,0.40);
          animation: chatbotOnlinePulse 2s ease-out infinite;
          pointer-events: none;
        }

        .chatbot-hover-card {
          position: absolute;
          right: 96px;
          bottom: 18px;
          width: 250px;
          padding: 18px;
          opacity: 0;
          visibility: hidden;
          transform:
            translateX(12px)
            translateY(8px)
            scale(0.96);
          transform-origin: right bottom;
          border: 1px solid rgba(31,107,45,0.11);
          border-radius: 24px;
          background:
            linear-gradient(
              145deg,
              rgba(2, 58, 5, 0.33),
              rgba(247, 240, 228, 0.77)
            );
          box-shadow:
            0 22px 50px rgba(31,60,30,0.16),
            0 8px 18px rgba(31,60,30,0.08);
          transition:
            opacity 0.25s ease,
            visibility 0.25s ease,
            transform 0.3s cubic-bezier(0.16,1,0.3,1);
          pointer-events: none;
        }

        .chatbot-hover-card-visible {
          opacity: 1;
          visibility: visible;
          transform:
            translateX(0)
            translateY(0)
            scale(1);
          pointer-events: auto;
        }

        .chatbot-hover-arrow {
          position: absolute;
          right: -7px;
          bottom: 18px;
          width: 15px;
          height: 15px;
          transform: rotate(45deg);
          border-top: 1px solid rgba(31,107,45,0.11);
          border-right: 1px solid rgba(31,107,45,0.11);
          background: #f8f1e6d8;
        }

        /* Barre d'actions rapides */
        .chatbot-quick-actions {
          display: flex;
          flex-shrink: 0;
          gap: 8px;
          padding: 10px 14px;
          overflow-x: auto;
          background: #f7f0e4;
          border-bottom: 1px solid #e0d9cc;
        }

        .chatbot-quick-action-btn {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          color: #164f22;
          background: #fff;
          border: 1.5px solid rgba(31,107,45,0.22);
          box-shadow: 0 3px 8px rgba(31,60,30,0.14);
          transition: transform 0.15s ease, background 0.2s ease, box-shadow 0.15s ease;
          cursor: pointer;
        }

        .chatbot-quick-action-btn:hover {
          transform: translateY(-1px);
          background: rgba(31,107,45,0.06);
          box-shadow: 0 5px 12px rgba(31,60,30,0.20);
        }

        .chatbot-quick-action-btn:active {
          transform: translateY(0);
          box-shadow: 0 1px 4px rgba(31,60,30,0.16);
        }

        /* Lien intelligent dans un message de LaMiss */
        .chatbot-smart-link {
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-top: 8px;
          padding: 10px 14px;
          border-radius: 14px;
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          background: linear-gradient(135deg, #1f6b2d, #2d8a3e);
          box-shadow: 0 4px 12px rgba(31,107,45,0.25);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
        }

        .chatbot-smart-link:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(31,107,45,0.32);
        }

        @keyframes chatbotAvatarFloat {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes chatbotRingPulse {
          0% {
            opacity: 0.55;
            transform: scale(0.96);
          }

          75%, 100% {
            opacity: 0;
            transform: scale(1.22);
          }
        }

        @keyframes chatbotOnlinePulse {
          0% {
            box-shadow: 0 0 0 0 rgba(74,222,128,0.42);
          }

          70% {
            box-shadow: 0 0 0 8px rgba(74,222,128,0);
          }

          100% {
            box-shadow: 0 0 0 0 rgba(74,222,128,0);
          }
        }

        @media (max-width: 639px) {
          .chatbot-hover-card {
            display: none;
          }

          .chatbot-avatar-button,
          .chatbot-avatar-wrap {
            width: 72px !important;
            height: 72px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .chatbot-avatar-wrap,
          .chatbot-avatar-ring,
          .chatbot-online-dot {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default Chatbot;