import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type Props = {
  talking: boolean;
};

export default function AnimatedAvatar({ talking }: Props) {
  const [blink, setBlink] = useState(false);
  const [mouth, setMouth] = useState(0);

  useEffect(() => {
    const i = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 120);
    }, 3000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (!talking) return;
    const i = setInterval(() => {
      setMouth((m) => (m + 1) % 4);
    }, 130);
    return () => clearInterval(i);
  }, [talking]);

  const mouths = [
    { rx: 7, ry: 2 },
    { rx: 5, ry: 6 },
    { rx: 9, ry: 4 },
    { rx: 4, ry: 7 },
  ];

  return (
    <motion.div
      whileHover={{ scale: 1.08 }}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 2.3, repeat: Infinity, ease: "easeInOut" }}
      style={{ width: 95, height: 115, cursor: "pointer" }}
    >
      <svg viewBox="0 0 130 150" width="100%" height="100%">
        {/* Halo */}
        <motion.circle
          cx="65"
          cy="75"
          r="48"
          fill="rgba(45,138,62,0.18)"
          animate={{ scale: [1, 1.12, 1], opacity: [0.45, 0.85, 0.45] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Ombre */}
        <motion.ellipse
          cx="65"
          cy="137"
          rx="32"
          ry="7"
          fill="rgba(0,0,0,0.22)"
          animate={{ rx: [32, 26, 32], opacity: [0.22, 0.12, 0.22] }}
          transition={{ duration: 2.3, repeat: Infinity }}
        />

        {/* Bras gauche */}
        <motion.g
          animate={{ rotate: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ transformOrigin: "42px 82px" }}
        >
          <path
            d="M43 82 Q25 88 25 108"
            stroke="#e7a47c"
            strokeWidth="9"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="25" cy="109" r="6" fill="#e7a47c" />
        </motion.g>

        {/* Bras droit wave */}
        <motion.g
          animate={{ rotate: [0, 22, -14, 22, 0] }}
          transition={{ duration: 1.35, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "90px 80px" }}
        >
          <path
            d="M88 80 Q110 65 108 43"
            stroke="#e7a47c"
            strokeWidth="9"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="108" cy="42" r="7" fill="#e7a47c" />
          <circle cx="103" cy="37" r="2.5" fill="#e7a47c" />
          <circle cx="108" cy="34" r="2.5" fill="#e7a47c" />
          <circle cx="113" cy="37" r="2.5" fill="#e7a47c" />
        </motion.g>

        {/* Shawarma body */}
        <motion.g
          animate={{ scaleY: [1, 1.025, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ transformOrigin: "65px 95px" }}
        >
          {/* wrap */}
          <path
            d="M35 132 Q32 70 44 42 Q54 18 76 18 Q98 42 95 132 Z"
            fill="#f4dfb8"
          />

          {/* grill marks */}
          <path d="M48 45 Q65 55 82 45" stroke="#c58d55" strokeWidth="3" opacity=".5" />
          <path d="M43 70 Q65 82 88 70" stroke="#c58d55" strokeWidth="3" opacity=".45" />
          <path d="M42 96 Q65 108 90 96" stroke="#c58d55" strokeWidth="3" opacity=".4" />

          {/* veggies top */}
          <path d="M44 34 Q55 22 66 34 Q77 22 88 34" fill="#2d7d32" />
          <circle cx="55" cy="33" r="6" fill="#d8342a" />
          <circle cx="75" cy="31" r="5" fill="#ffd166" />
          <circle cx="84" cy="38" r="5" fill="#7bc043" />

          {/* face */}
          <ellipse cx="65" cy="64" rx="25" ry="24" fill="#f0bf8d" opacity=".95" />

          {/* eyes */}
          {!blink ? (
            <>
              <ellipse cx="55" cy="61" rx="6" ry="7" fill="white" />
              <ellipse cx="75" cy="61" rx="6" ry="7" fill="white" />
              <circle cx="55" cy="62" r="3.2" fill="#2b160d" />
              <circle cx="75" cy="62" r="3.2" fill="#2b160d" />
              <circle cx="53.5" cy="59.5" r="1" fill="white" />
              <circle cx="73.5" cy="59.5" r="1" fill="white" />
            </>
          ) : (
            <>
              <path d="M49 61 Q55 64 61 61" stroke="#2b160d" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M69 61 Q75 64 81 61" stroke="#2b160d" strokeWidth="3" fill="none" strokeLinecap="round" />
            </>
          )}

          {/* brows */}
          <path d="M48 51 Q55 47 61 51" stroke="#2b160d" strokeWidth="3" strokeLinecap="round" />
          <path d="M69 51 Q75 47 82 51" stroke="#2b160d" strokeWidth="3" strokeLinecap="round" />

          {/* cheeks */}
          <ellipse cx="47" cy="71" rx="6" ry="3" fill="#f0806a" opacity=".35" />
          <ellipse cx="83" cy="71" rx="6" ry="3" fill="#f0806a" opacity=".35" />

          {/* mouth */}
          <motion.ellipse
            cx="65"
            cy="77"
            fill="#8e3f34"
            animate={{
              rx: talking ? mouths[mouth].rx : 7,
              ry: talking ? mouths[mouth].ry : 2,
            }}
            transition={{ duration: 0.1 }}
          />

          {!talking && (
            <path
              d="M57 76 Q65 82 73 76"
              stroke="#7d342c"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          )}
        </motion.g>

        {/* Point online */}
        <motion.circle
          cx="105"
          cy="22"
          r="6"
          fill="#63e66d"
          animate={{ scale: [1, 1.25, 1], opacity: [1, 0.65, 1] }}
          transition={{ duration: 1.3, repeat: Infinity }}
        />
      </svg>
    </motion.div>
  );
}