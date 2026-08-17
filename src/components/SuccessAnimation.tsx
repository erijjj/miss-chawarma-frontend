import React, { useMemo } from "react";

const GREEN = "#1f6b2d";
const DARK_GREEN = "#164f22";
const GOLD = "#c59a28";
const AMBER = "#c47d0e";
const CREAM = "#fff8d8";

const CELEBRATION_COLORS = [
  GREEN,
  DARK_GREEN,
  GOLD,
  AMBER,
  "#75a867",
  CREAM,
];

interface CelebrationPiece {
  id: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  rotation: number;
  type: "leaf" | "seed" | "square";
}

interface SuccessAnimationProps {
  children: React.ReactNode;
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  children,
}) => {
  const celebrationPieces = useMemo<CelebrationPiece[]>(() => {
    const count = 24;

    return Array.from({ length: count }, (_, index) => ({
      id: index,
      angle:
        (360 / count) * index +
        (Math.random() * 14 - 7),
      distance: 75 + Math.random() * 85,
      size: 5 + Math.random() * 7,
      color:
        CELEBRATION_COLORS[
          index % CELEBRATION_COLORS.length
        ],
      delay: 0.9 + Math.random() * 0.2,
      duration: 0.8 + Math.random() * 0.45,
      rotation: Math.random() * 420,
      type:
        index % 3 === 0
          ? "leaf"
          : index % 3 === 1
            ? "seed"
            : "square",
    }));
  }, []);

  return (
    <div className="success-experience">
      <div
        className="restaurant-animation"
        role="img"
        aria-label="Commande confirmée"
      >
        <div className="success-glow" />

        {celebrationPieces.map((piece) => {
          const radians = (piece.angle * Math.PI) / 180;
          const x = Math.cos(radians) * piece.distance;
          const y = Math.sin(radians) * piece.distance;

          const customStyles =
            {
              "--piece-x": `${x}px`,
              "--piece-y": `${y}px`,
              "--piece-rotation": `${piece.rotation}deg`,
              "--piece-color": piece.color,
              width: `${piece.size}px`,
              height:
                piece.type === "leaf"
                  ? `${piece.size * 1.7}px`
                  : piece.type === "seed"
                    ? `${piece.size * 0.65}px`
                    : `${piece.size}px`,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
            } as React.CSSProperties;

          return (
            <span
              key={piece.id}
              className={`celebration-piece celebration-${piece.type}`}
              style={customStyles}
            />
          );
        })}

        <div
          className="steam-container"
          aria-hidden="true"
        >
          <span className="steam steam-one" />
          <span className="steam steam-two" />
          <span className="steam steam-three" />
        </div>

        <div className="cloche-lid" aria-hidden="true">
          <span className="cloche-handle" />

          <div className="cloche-body">
            <span className="cloche-highlight" />
          </div>
        </div>

        <div className="plate" aria-hidden="true">
          <div className="plate-inner">
            <svg
              viewBox="0 0 100 100"
              className="confirmation-check"
            >
              <circle
                cx="50"
                cy="50"
                r="35"
                className="check-circle"
              />

              <path
                d="M33 51 L45 63 L69 38"
                className="check-path"
              />
            </svg>
          </div>
        </div>

        <div className="plate-shadow" />
      </div>

      <div className="success-content">{children}</div>

      <style>{`
        .success-experience {
          position: relative;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .restaurant-animation {
          position: relative;
          width: 200px;
          height: 175px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .success-glow {
          position: absolute;
          left: 50%;
          bottom: 17px;
          width: 120px;
          height: 120px;
          border-radius: 999px;
          opacity: 0;
          transform: translateX(-50%) scale(0.5);
          background: radial-gradient(
            circle,
            rgba(197, 154, 40, 0.34) 0%,
            rgba(197, 154, 40, 0.13) 48%,
            transparent 72%
          );
          animation: successGlowReveal 1.1s ease-out 0.72s forwards;
        }

        .cloche-lid {
          position: absolute;
          z-index: 8;
          left: 50%;
          bottom: 43px;
          width: 132px;
          height: 81px;
          opacity: 0;
          transform:
            translateX(-50%)
            translateY(50px)
            scale(0.88);
          transform-origin: center bottom;
          animation:
            clocheArrival 0.5s
              cubic-bezier(0.2, 0.9, 0.3, 1.15)
              forwards,
            clocheOpening 0.75s
              cubic-bezier(0.25, 0.8, 0.3, 1)
              0.72s forwards;
        }

        .cloche-handle {
          position: absolute;
          z-index: 2;
          top: 0;
          left: 50%;
          width: 34px;
          height: 14px;
          border-radius: 16px 16px 5px 5px;
          transform: translateX(-50%);
          background: linear-gradient(
            135deg,
            #a97615,
            #f7d66d 45%,
            #fff1a9 58%,
            #9c670c
          );
          box-shadow:
            0 3px 7px rgba(83, 55, 7, 0.22),
            inset 0 1px 1px rgba(255, 255, 255, 0.75);
        }

        .cloche-body {
          position: absolute;
          left: 0;
          bottom: 0;
          width: 132px;
          height: 67px;
          overflow: hidden;
          border-radius: 72px 72px 8px 8px;
          background: linear-gradient(
            115deg,
            #96640d 0%,
            #cf9c2e 20%,
            #fff1a9 47%,
            #d6a632 68%,
            #8e5b08 100%
          );
          box-shadow:
            0 12px 20px rgba(70, 46, 5, 0.18),
            inset 0 2px 2px rgba(255, 255, 255, 0.75);
        }

        .cloche-body::after {
          content: "";
          position: absolute;
          left: -6px;
          bottom: 0;
          width: 144px;
          height: 9px;
          border-radius: 10px;
          background: linear-gradient(
            90deg,
            #93600d,
            #f0ce69,
            #9c680f
          );
        }

        .cloche-highlight {
          position: absolute;
          top: 13px;
          left: 34px;
          width: 17px;
          height: 37px;
          border-radius: 50%;
          transform: rotate(22deg);
          background: rgba(255, 255, 255, 0.42);
          filter: blur(1px);
        }

        .plate {
          position: absolute;
          z-index: 5;
          left: 50%;
          bottom: 23px;
          width: 146px;
          height: 57px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          opacity: 0;
          transform: translateX(-50%) scale(0.55);
          background: radial-gradient(
            ellipse at center,
            #ffffff 0%,
            #fffdf6 45%,
            #ddd4bf 48%,
            #f9f3e7 69%,
            #cbbfa8 100%
          );
          box-shadow:
            inset 0 3px 6px rgba(255, 255, 255, 0.9),
            0 7px 15px rgba(37, 59, 30, 0.16);
          animation: plateReveal 0.5s
            cubic-bezier(0.2, 0.9, 0.3, 1.2)
            0.8s forwards;
        }

        .plate-inner {
          width: 66px;
          height: 66px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transform: scaleY(0.66);
          background: rgba(255, 253, 245, 0.94);
        }

        .plate-shadow {
          position: absolute;
          left: 50%;
          bottom: 11px;
          width: 122px;
          height: 16px;
          border-radius: 50%;
          opacity: 0;
          transform: translateX(-50%) scaleX(0.5);
          background: rgba(32, 48, 27, 0.17);
          filter: blur(5px);
          animation: shadowReveal 0.5s ease-out 0.8s forwards;
        }

        .confirmation-check {
          width: 66px;
          height: 66px;
          overflow: visible;
          transform: scaleY(1.5);
        }

        .check-circle {
          fill: ${GREEN};
          stroke: ${DARK_GREEN};
          stroke-width: 2;
          opacity: 0;
          transform-origin: center;
          animation: checkCirclePop 0.45s
            cubic-bezier(0.2, 1.5, 0.4, 1)
            1.05s forwards;
        }

        .check-path {
          fill: none;
          stroke: white;
          stroke-width: 7;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 55;
          stroke-dashoffset: 55;
          animation: checkDraw 0.4s ease-out 1.34s forwards;
        }

        .steam-container {
          position: absolute;
          z-index: 6;
          left: 50%;
          bottom: 75px;
          width: 90px;
          height: 70px;
          transform: translateX(-50%);
          pointer-events: none;
        }

        .steam {
          position: absolute;
          bottom: 0;
          width: 10px;
          height: 45px;
          opacity: 0;
          border-left: 3px solid rgba(255, 255, 255, 0.85);
          border-radius: 50%;
          filter: blur(0.5px);
        }

        .steam-one {
          left: 20px;
          animation: steamRise 1.35s ease-out 1s forwards;
        }

        .steam-two {
          left: 43px;
          height: 58px;
          animation: steamRise 1.5s ease-out 1.12s forwards;
        }

        .steam-three {
          left: 67px;
          height: 40px;
          animation: steamRise 1.25s ease-out 1.22s forwards;
        }

        .celebration-piece {
          position: absolute;
          z-index: 4;
          left: 50%;
          bottom: 57px;
          opacity: 0;
          background: var(--piece-color);
          pointer-events: none;
          animation-name: celebrationBurst;
          animation-timing-function:
            cubic-bezier(0.1, 0.65, 0.3, 1);
          animation-fill-mode: forwards;
        }

        .celebration-leaf {
          border-radius: 90% 10% 90% 10%;
        }

        .celebration-seed {
          border-radius: 50%;
        }

        .celebration-square {
          border-radius: 2px;
        }

        .success-content {
          position: relative;
          z-index: 10;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }

        .success-fade-1,
        .success-fade-2,
        .success-fade-3 {
          opacity: 0;
          animation: successReceiptReveal 0.55s ease-out forwards;
        }

        .success-fade-1 {
          animation-delay: 1.55s;
        }

        .success-fade-2 {
          animation-delay: 1.72s;
        }

        .success-fade-3 {
          animation-delay: 1.9s;
        }

        @keyframes clocheArrival {
          0% {
            opacity: 0;
            transform:
              translateX(-50%)
              translateY(55px)
              scale(0.78)
              rotate(-4deg);
          }

          70% {
            opacity: 1;
            transform:
              translateX(-50%)
              translateY(-3px)
              scale(1.03)
              rotate(2deg);
          }

          100% {
            opacity: 1;
            transform:
              translateX(-50%)
              translateY(0)
              scale(1)
              rotate(0);
          }
        }

        @keyframes clocheOpening {
          0% {
            opacity: 1;
            transform:
              translateX(-50%)
              translateY(0)
              rotate(0)
              scale(1);
          }

          50% {
            opacity: 1;
            transform:
              translateX(-50%)
              translateY(-42px)
              rotate(-7deg)
              scale(0.96);
          }

          100% {
            opacity: 0;
            transform:
              translateX(-50%)
              translateY(-78px)
              rotate(-12deg)
              scale(0.86);
          }
        }

        @keyframes plateReveal {
          0% {
            opacity: 0;
            transform: translateX(-50%) scale(0.55);
          }

          75% {
            opacity: 1;
            transform: translateX(-50%) scale(1.08);
          }

          100% {
            opacity: 1;
            transform: translateX(-50%) scale(1);
          }
        }

        @keyframes shadowReveal {
          to {
            opacity: 1;
            transform: translateX(-50%) scaleX(1);
          }
        }

        @keyframes checkCirclePop {
          0% {
            opacity: 0;
            transform: scale(0.2);
          }

          70% {
            opacity: 1;
            transform: scale(1.16);
          }

          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes checkDraw {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes steamRise {
          0% {
            opacity: 0;
            transform: translateY(18px) scaleX(0.8);
          }

          25% {
            opacity: 0.8;
          }

          70% {
            opacity: 0.5;
          }

          100% {
            opacity: 0;
            transform:
              translateY(-42px)
              translateX(9px)
              scaleX(1.4);
          }
        }

        @keyframes celebrationBurst {
          0% {
            opacity: 1;
            transform:
              translate(-50%, 50%)
              translate(0, 0)
              rotate(0deg)
              scale(0.35);
          }

          25% {
            opacity: 1;
          }

          100% {
            opacity: 0;
            transform:
              translate(-50%, 50%)
              translate(var(--piece-x), var(--piece-y))
              rotate(var(--piece-rotation))
              scale(0.85);
          }
        }

        @keyframes successGlowReveal {
          0% {
            opacity: 0;
            transform: translateX(-50%) scale(0.45);
          }

          50% {
            opacity: 1;
          }

          100% {
            opacity: 0.35;
            transform: translateX(-50%) scale(1.35);
          }
        }

        @keyframes successReceiptReveal {
          from {
            opacity: 0;
            transform: translateY(14px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cloche-lid,
          .plate,
          .plate-shadow,
          .check-circle,
          .check-path,
          .steam,
          .celebration-piece,
          .success-glow,
          .success-fade-1,
          .success-fade-2,
          .success-fade-3 {
            animation-duration: 0.01ms !important;
            animation-delay: 0ms !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SuccessAnimation;