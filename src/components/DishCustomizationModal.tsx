import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Check, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { createPortal } from "react-dom";
const LABEL_TRANSLATIONS: Record<string, string> = {
  "Toujours inclus": "Always included",
  Personnaliser: "Customize",
  "Mezzé chauds": "Hot mezzés",
  "Mezzé froids": "Cold mezzés",
  Sandwiches: "Sandwiches",
  "Sandwiches Végétariens": "Vegetarian Sandwiches",
  Boissons: "Drinks",
  Beignets: "Pastries",
  Sandwich: "Sandwich",
  Mezzés: "Mezzés",
  Assortiments: "Sides",
  Dessert: "Dessert",
  Base: "Base",
  Protéine: "Protein",
  Accompagnement: "Side",
  Boisson: "Drink",
  Sauce: "Sauce",
  Choix: "Choice",
};

const translateLabel = (label: string, lang: string): string =>
  lang === "en" ? (LABEL_TRANSLATIONS[label] ?? label) : label;
// ─── Types ──────────────────────────────────────────────────────────────────
interface ChoiceGroupCategory {
  label: string;
  source_category?: string;
  source_categories?: string[];
  max: number;
  min?: number;
}

interface AlternativeOption {
  name: string;
  count: number;
  dish_ids?: number[];
  source_category?: string;
}

interface ChoiceGroupAlternative {
  label: string;
  type: "alternative";
  alternatives: AlternativeOption[];
}
interface ChoiceGroupOptions {
  label: string;
  options: string[];
  max: number;
  min?: number;
  allergen_map?: Record<string, string>;
}
type ChoiceGroup =
  | ChoiceGroupCategory
  | ChoiceGroupAlternative
  | ChoiceGroupOptions;
const isOptionsGroup = (g: ChoiceGroup): g is ChoiceGroupOptions =>
  Array.isArray((g as ChoiceGroupOptions).options);

export interface CustomizationRules {
  fixed?: string[];
  removable?: string[];
  choice_groups?: ChoiceGroup[];
  extra_allergens?: string[];
}

interface MenuItemLite {
  id?: number;
  name: string;
  allergens?: string[];
  customizationRules?: CustomizationRules;
  image?: string;
}

interface SubCustomization {
  removed: string[];
  optionsChoices: Record<string, string[]>;
}

interface Props {
  dishId: number;
  name: string;
  price: number;
  priceLabel: string;
  image?: string;
  rules: CustomizationRules;
  baseAllergens: string[];
  dishesByCategory: Record<string, MenuItemLite[]>;
  dishesById: Record<number, MenuItemLite>;
  onClose: () => void;
}

interface ChoiceSelection {
  dishIds: number[];
  alternative?: string;
  optionValues?: string[];
}

const isAlternativeGroup = (g: ChoiceGroup): g is ChoiceGroupAlternative =>
  (g as ChoiceGroupAlternative).type === "alternative";

// ─── Sélecteur de plats avec compteur (supporte les doublons) ────────────────
const PLACEHOLDER_THUMB = "https://placehold.co/56x56/9ca89b/f7f0e4?text=🌯";

const DishThumb: React.FC<{ image?: string }> = ({ image }) => (
  <img
    src={image || PLACEHOLDER_THUMB}
    alt=""
    className="w-9 h-9 rounded-full object-cover flex-shrink-0"
    onError={(e) => {
      (e.target as HTMLImageElement).src = PLACEHOLDER_THUMB;
    }}
  />
);
const QuantityDishPicker: React.FC<{
  candidates: MenuItemLite[];
  max: number;
  selected: number[];
  onChange: (next: number[]) => void;
  renderBelowSelected?: (
    dish: MenuItemLite,
    unitIndex?: number,
  ) => React.ReactNode;
}> = ({ candidates, max, selected, onChange, renderBelowSelected }) => {
  const total = selected.length;

  const increment = (id: number) => {
    if (total >= max) return;
    onChange([...selected, id]);
  };
  const decrement = (id: number) => {
    const idx = selected.indexOf(id);
    if (idx === -1) return;
    const next = [...selected];
    next.splice(idx, 1);
    onChange(next);
  };

  // max === 1 → radio simple, plus lisible
  if (max === 1) {
    return (
      <div className="space-y-2">
        {candidates.map((c) => {
          if (c.id == null) return null;
          const isSelected = selected[0] === c.id;
          return (
            <React.Fragment key={c.id}>
              <label
                className="flex items-center gap-3 rounded-xl px-3 py-2 cursor-pointer"
                style={{
                  background: isSelected ? "#e8f4ea" : "white",
                  border: `1px solid ${isSelected ? "#1f6b2d" : "#e0d9cc"}`,
                }}
              >
                <input
                  type="radio"
                  checked={isSelected}
                  onChange={() => onChange([c.id!])}
                />
                <DishThumb image={c.image} />
                <span
                  className="text-sm"
                  style={{
                    color: isSelected ? "#1f6b2d" : "#333",
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  {c.name}
                </span>
              </label>
              {isSelected && renderBelowSelected?.(c)}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  // max > 1 → compteur +/-, avec panneau de personnalisation par unité
  return (
    <div className="space-y-2">
      {candidates.map((c) => {
        if (c.id == null) return null;
        const occurrenceIndices = selected.reduce<number[]>((acc, sid, i) => {
          if (sid === c.id) acc.push(i);
          return acc;
        }, []);
        const qty = occurrenceIndices.length;
        return (
          <React.Fragment key={c.id}>
            <div
              className="flex items-center justify-between gap-3 rounded-xl px-3 py-2"
              style={{
                background: qty > 0 ? "#e8f4ea" : "white",
                border: `1px solid ${qty > 0 ? "#1f6b2d" : "#e0d9cc"}`,
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <DishThumb image={c.image} />
                <span
                  className="text-sm truncate"
                  style={{
                    color: qty > 0 ? "#1f6b2d" : "#333",
                    fontWeight: qty > 0 ? 600 : 400,
                  }}
                >
                  {c.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => decrement(c.id!)}
                  disabled={qty === 0}
                  className="w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-30"
                  style={{ background: "#1f6b2d22", color: "#1f6b2d" }}
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span
                  className="text-sm w-4 text-center font-bold"
                  style={{ color: qty > 0 ? "#1f6b2d" : "#666" }}
                >
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => increment(c.id!)}
                  disabled={total >= max}
                  className="w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-30"
                  style={{ background: "#1f6b2d22", color: "#1f6b2d" }}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            {qty > 0 &&
              renderBelowSelected &&
              occurrenceIndices.map((idx) => (
                <React.Fragment key={idx}>
                  {renderBelowSelected(c, idx)}
                </React.Fragment>
              ))}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// max === 1 → radio simple, plus lisible

// ─── Modal principal ──────────────────────────────────────────────────────────
const DishCustomizationModal: React.FC<Props> = ({
  dishId,
  name,
  price,
  priceLabel,
  image,
  rules,
  baseAllergens,
  dishesByCategory,
  dishesById,
  onClose,
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage?.startsWith("en") ? "en" : "fr";
  const { addItem } = useCart();

  const fixed = rules.fixed ?? [];
  const removable = rules.removable ?? [];
  const choiceGroups = rules.choice_groups ?? [];

  const [removed, setRemoved] = useState<string[]>([]);
  const [selections, setSelections] = useState<Record<string, ChoiceSelection>>(
    () =>
      Object.fromEntries(choiceGroups.map((g) => [g.label, { dishIds: [] }])),
  );

  const toggleRemoved = (ingredient: string) => {
    setRemoved((prev) =>
      prev.includes(ingredient)
        ? prev.filter((i) => i !== ingredient)
        : [...prev, ingredient],
    );
  };

  const [subCustomizations, setSubCustomizations] = useState<
    Record<string, SubCustomization>
  >({});

  const initSubCustomization = (dish?: MenuItemLite): SubCustomization => ({
    removed: [],

    optionsChoices: Object.fromEntries(
      (dish?.customizationRules?.choice_groups ?? [])

        .filter(isOptionsGroup)

        .map((g) => [g.label, []]),
    ),
  });

  const toggleSubRemoved = (groupLabel: string, ingredient: string) => {
    setSubCustomizations((prev) => {
      const current = prev[groupLabel] ?? { removed: [], optionsChoices: {} };

      const removed = current.removed.includes(ingredient)
        ? current.removed.filter((i) => i !== ingredient)
        : [...current.removed, ingredient];

      return { ...prev, [groupLabel]: { ...current, removed } };
    });
  };

  const setSubOptionChoice = (
    groupLabel: string,

    optGroupLabel: string,

    values: string[],
  ) => {
    setSubCustomizations((prev) => {
      const current = prev[groupLabel] ?? { removed: [], optionsChoices: {} };

      return {
        ...prev,

        [groupLabel]: {
          ...current,

          optionsChoices: {
            ...current.optionsChoices,
            [optGroupLabel]: values,
          },
        },
      };
    });
  };

  const setCategoryChoice = (group: ChoiceGroupCategory, dishIds: number[]) => {
    setSelections((prev) => {
      const prevDishIds = prev[group.label]?.dishIds ?? [];

      if (group.max === 1) {
        if (prevDishIds[0] !== dishIds[0]) {
          const dish = dishIds[0] != null ? dishesById[dishIds[0]] : undefined;
          setSubCustomizations((p) => ({
            ...p,
            [group.label]: initSubCustomization(dish),
          }));
        }
      } else {
        setSubCustomizations((p) => {
          const next = { ...p };
          Object.keys(next).forEach((key) => {
            if (key.startsWith(`${group.label}#`)) {
              const idx = parseInt(key.split("#")[1], 10);
              if (idx >= dishIds.length) delete next[key];
            }
          });
          dishIds.forEach((id, idx) => {
            const key = `${group.label}#${idx}`;
            if (prevDishIds[idx] !== id || !next[key]) {
              next[key] = initSubCustomization(dishesById[id]);
            }
          });
          return next;
        });
      }

      return { ...prev, [group.label]: { dishIds } };
    });
  };

  const setAlternativeChoice = (
    group: ChoiceGroupAlternative,
    altName: string,
    dishIds: number[],
  ) => {
    setSelections((prev) => ({
      ...prev,
      [group.label]: { dishIds, alternative: altName },
    }));
    const alt = group.alternatives.find((a) => a.name === altName);
    if (alt?.count === 1) {
      const dish = dishIds[0] != null ? dishesById[dishIds[0]] : undefined;
      setSubCustomizations((prev) => ({
        ...prev,
        [group.label]: initSubCustomization(dish),
      }));
    }
  };
  const setOptionsChoice = (group: ChoiceGroupOptions, values: string[]) => {
    setSelections((prev) => ({
      ...prev,
      [group.label]: { dishIds: [], optionValues: values },
    }));
  };
  const resolveCandidates = (opt: {
    source_category?: string;
    dish_ids?: number[];
  }): MenuItemLite[] => {
    if (opt.dish_ids)
      return opt.dish_ids.map((id) => dishesById[id]).filter(Boolean);
    if (opt.source_category) return dishesByCategory[opt.source_category] ?? [];
    return [];
  };

  // Un groupe est valide si sa sélection est complète
  const isGroupComplete = (group: ChoiceGroup): boolean => {
    const sel = selections[group.label];
    if (isAlternativeGroup(group)) {
      if (!sel?.alternative) return false;
      const alt = group.alternatives.find((a) => a.name === sel.alternative);
      return !!alt && sel.dishIds.length === alt.count;
    }
    const min = group.min ?? group.max;
    if (isOptionsGroup(group)) {
      const min = group.min ?? group.max;
      return (sel?.optionValues?.length ?? 0) >= min;
    }
    return (sel?.dishIds.length ?? 0) >= min;
  };
  const subComplete = choiceGroups.every((group) => {
    if (isOptionsGroup(group)) return true;

    if (isAlternativeGroup(group)) {
      const alt = group.alternatives.find(
        (a) => a.name === selections[group.label]?.alternative,
      );
      if (!alt || alt.count !== 1) return true;
      const dishId = selections[group.label]?.dishIds?.[0];
      if (dishId == null) return true;
      const optGroups = (
        dishesById[dishId]?.customizationRules?.choice_groups ?? []
      ).filter(isOptionsGroup);
      const sub = subCustomizations[group.label];
      return optGroups.every(
        (og) =>
          (sub?.optionsChoices[og.label]?.length ?? 0) >= (og.min ?? og.max),
      );
    }

    if (group.max === 1) {
      const dishId = selections[group.label]?.dishIds?.[0];
      if (dishId == null) return true;
      const optGroups = (
        dishesById[dishId]?.customizationRules?.choice_groups ?? []
      ).filter(isOptionsGroup);
      const sub = subCustomizations[group.label];
      return optGroups.every(
        (og) =>
          (sub?.optionsChoices[og.label]?.length ?? 0) >= (og.min ?? og.max),
      );
    }

    const dishIds = selections[group.label]?.dishIds ?? [];
    return dishIds.every((id, idx) => {
      const optGroups = (
        dishesById[id]?.customizationRules?.choice_groups ?? []
      ).filter(isOptionsGroup);
      const sub = subCustomizations[`${group.label}#${idx}`];
      return optGroups.every(
        (og) =>
          (sub?.optionsChoices[og.label]?.length ?? 0) >= (og.min ?? og.max),
      );
    });
  });

  const allComplete = choiceGroups.every(isGroupComplete) && subComplete;

  const displayedAllergens = React.useMemo(() => {
    const set = new Set(baseAllergens);
    (rules.extra_allergens ?? []).forEach((a) => set.add(a));
    Object.entries(selections).forEach(([label, sel]) => {
      const group = choiceGroups.find((g) => g.label === label);
      if (group && isOptionsGroup(group)) {
        (sel.optionValues ?? []).forEach((opt) => {
          const allergen = group.allergen_map?.[opt];
          if (allergen) set.add(allergen);
        });
      }
      sel.dishIds.forEach((id) => {
        (dishesById[id]?.allergens ?? []).forEach((a) => set.add(a));
      });
    });
    return Array.from(set);
  }, [baseAllergens, rules, selections, dishesById]);

  const handleConfirm = () => {
    if (!allComplete) return;
    addItem({
      dishId,
      name,
      price,
      priceLabel,
      image,
      customizations: {
        removed,
        choices: Object.fromEntries(
          Object.entries(selections).map(([label, sel]) => {
            const group = choiceGroups.find((g) => g.label === label);
            const isMulti =
              group &&
              !isAlternativeGroup(group) &&
              !isOptionsGroup(group) &&
              group.max > 1;
            if (isMulti) {
              const subs = sel.dishIds.map(
                (_, idx) => subCustomizations[`${label}#${idx}`],
              );
              return [
                label,
                {
                  dish_ids: sel.dishIds,
                  sub_removed_by_unit: subs.map((s) => s?.removed ?? []),
                  sub_choices_by_unit: subs.map((s) => s?.optionsChoices ?? {}),
                },
              ];
            }
            const sub = subCustomizations[label];
            return [
              label,
              {
                dish_ids: sel.dishIds,
                alternative: sel.alternative,
                options: sel.optionValues,
                sub_removed: sub?.removed,
                sub_choices: sub?.optionsChoices,
              },
            ];
          }),
        ),
      },
    });
    onClose();
  };
  const renderPerUnitCustomization = (
    groupLabel: string,
    dishIds: number[],
  ) => {
    const units = dishIds
      .map((id, idx) => ({ idx, dish: dishesById[id] }))
      .filter(({ dish }) => {
        const r = dish?.customizationRules;
        return (
          r &&
          ((r.removable?.length ?? 0) > 0 ||
            (r.choice_groups ?? []).some(isOptionsGroup))
        );
      });
    if (units.length === 0) return null;

    return (
      <div className="mt-2 space-y-3">
        {units.map(({ idx, dish }) => (
          <div key={idx}>
            <p
              className="text-[10px] font-semibold uppercase tracking-wide mb-1"
              style={{ color: "#c47d0e" }}
            >
              {t("customize.unitLabel", "Sandwich")} {idx + 1} — {dish!.name}
            </p>
            {renderNestedCustomization(`${groupLabel}#${idx}`, dish)}
          </div>
        ))}
      </div>
    );
  };
  const renderNestedCustomization = (
    groupLabel: string,
    dish?: MenuItemLite,
  ) => {
    if (!dish?.customizationRules) return null;
    const rules = dish.customizationRules;
    const removable = rules.removable ?? [];
    const optionGroups = (rules.choice_groups ?? []).filter(isOptionsGroup);
    if (removable.length === 0 && optionGroups.length === 0) return null;
    const sub = subCustomizations[groupLabel] ?? {
      removed: [],
      optionsChoices: {},
    };

    return (
      <div
        className="mt-3 ml-1 pl-3"
        style={{ borderLeft: "2px solid #e0d9cc" }}
      >
        <p
          className="text-[10px] font-semibold uppercase tracking-wide mb-2"
          style={{ color: "#9ca89b" }}
        >
          {t("customize.personalizeDish", "Personnaliser")} {dish.name}
        </p>

        {removable.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {removable.map((ingredient) => {
              const isRemoved = sub.removed.includes(ingredient);
              return (
                <label
                  key={ingredient}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 cursor-pointer text-xs"
                  style={{
                    background: isRemoved ? "#f0eadf" : "white",
                    border: "1px solid #e0d9cc",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!isRemoved}
                    onChange={() => toggleSubRemoved(groupLabel, ingredient)}
                  />
                  <span
                    style={{
                      color: isRemoved ? "#999" : "#333",
                      textDecoration: isRemoved ? "line-through" : "none",
                    }}
                  >
                    {ingredient}
                  </span>
                </label>
              );
            })}
          </div>
        )}

        {optionGroups.map((og) => {
          const values = sub.optionsChoices[og.label] ?? [];
          return (
            <div key={og.label} className="mb-2">
              <p
                className="text-[10px] font-semibold mb-1"
                style={{ color: "#c47d0e" }}
              >
                {og.label} ({values.length}/{og.max})
              </p>
              <div className="space-y-1.5">
                {og.options.map((opt) => {
                  const isSelected = values.includes(opt);
                  const toggle = () => {
                    if (og.max === 1) {
                      setSubOptionChoice(groupLabel, og.label, [opt]);
                      return;
                    }
                    const next = isSelected
                      ? values.filter((v) => v !== opt)
                      : [...values, opt];
                    if (!isSelected && next.length > og.max) return;
                    setSubOptionChoice(groupLabel, og.label, next);
                  };
                  return (
                    <label
                      key={opt}
                      onClick={toggle}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 cursor-pointer text-xs"
                      style={{
                        background: isSelected ? "#e8f4ea" : "white",
                        border: `1px solid ${isSelected ? "#1f6b2d" : "#e0d9cc"}`,
                      }}
                    >
                      <input
                        type={og.max === 1 ? "radio" : "checkbox"}
                        checked={isSelected}
                        readOnly
                      />
                      <span style={{ color: isSelected ? "#1f6b2d" : "#333" }}>
                        {opt}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="dish-modal-scroll relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: "#f7f0e4",
          maxHeight: "90vh",
          overflowY: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full text-white font-bold text-lg shadow"
          style={{ background: "#1f6b2d" }}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6">
          <h3
            className="text-2xl font-playfair leading-tight"
            style={{ color: "#1f6b2d" }}
          >
            {name}
          </h3>
          <span
            className="inline-block mt-1 text-sm font-bold"
            style={{ color: "#c47d0e" }}
          >
            {priceLabel}
          </span>

          {fixed.length > 0 && (
            <div className="mt-5">
              <h4
                className="text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: "#9ca89b" }}
              >
                {t("customize.included", "Toujours inclus")}
              </h4>
              <ul className="space-y-1">
                {fixed.map((f) => (
                  <li
                    key={f}
                    className="text-sm flex items-center gap-2"
                    style={{ color: "#444" }}
                  >
                    <Check
                      className="h-3.5 w-3.5"
                      style={{ color: "#1f6b2d" }}
                    />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {removable.length > 0 && (
            <div className="mt-5">
              <h4
                className="text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: "#1f6b2d" }}
              >
                {t("customize.customize", "Personnaliser")}
              </h4>
              <div className="space-y-2">
                {removable.map((ingredient) => {
                  const isRemoved = removed.includes(ingredient);
                  return (
                    <label
                      key={ingredient}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 cursor-pointer"
                      style={{
                        background: isRemoved ? "#f0eadf" : "white",
                        border: "1px solid #e0d9cc",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={!isRemoved}
                        onChange={() => toggleRemoved(ingredient)}
                      />
                      <span
                        className="text-sm"
                        style={{
                          color: isRemoved ? "#999" : "#333",
                          textDecoration: isRemoved ? "line-through" : "none",
                        }}
                      >
                        {ingredient}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {choiceGroups.map((group) => {
            const sel = selections[group.label] ?? { dishIds: [] };
            const complete = isGroupComplete(group);

            if (isAlternativeGroup(group)) {
              return (
                <div key={group.label} className="mt-5">
                  <h4
                    className="text-xs font-semibold uppercase tracking-widest mb-2"
                    style={{ color: complete ? "#1f6b2d" : "#c47d0e" }}
                  >
                    {group.label}{" "}
                    {!complete && "· " + t("customize.required", "requis")}
                  </h4>

                  {/* Choix de l'alternative */}
                  <div className="flex gap-2 mb-3">
                    {group.alternatives.map((alt) => (
                      <button
                        key={alt.name}
                        type="button"
                        onClick={() => {
                          const candidates = resolveCandidates(alt);
                          const autoIds =
                            candidates.length > 0 &&
                            candidates.length <= alt.count
                              ? Array.from(
                                  { length: alt.count },
                                  (_, i) =>
                                    candidates[i % candidates.length]?.id,
                                ).filter((id): id is number => id != null)
                              : [];
                          setAlternativeChoice(group, alt.name, autoIds);
                        }}
                        className="flex-1 rounded-xl py-2 text-xs font-semibold"
                        style={{
                          background:
                            sel.alternative === alt.name ? "#1f6b2d" : "white",
                          color:
                            sel.alternative === alt.name ? "#fff8d8" : "#333",
                          border: "1px solid #e0d9cc",
                        }}
                      >
                        {alt.name}
                      </button>
                    ))}
                  </div>

                  {/* Sélection des plats pour l'alternative choisie */}
                  {sel.alternative &&
                    (() => {
                      const alt = group.alternatives.find(
                        (a) => a.name === sel.alternative,
                      )!;
                      const candidates = resolveCandidates(alt);
                      const showPicker = candidates.length > alt.count;

                      if (showPicker) {
                        return (
                          <QuantityDishPicker
                            candidates={candidates}
                            max={alt.count}
                            selected={sel.dishIds}
                            onChange={(ids) =>
                              setAlternativeChoice(group, sel.alternative!, ids)
                            }
                            renderBelowSelected={
                              alt.count === 1
                                ? (dish) =>
                                    renderNestedCustomization(group.label, dish)
                                : undefined
                            }
                          />
                        );
                      }

                      if (alt.count !== 1) return null;
                      const dishId = sel.dishIds[0];
                      return dishId != null
                        ? renderNestedCustomization(
                            group.label,
                            dishesById[dishId],
                          )
                        : null;
                    })()}
                </div>
              );
            }
            if (isOptionsGroup(group)) {
              const values = sel.optionValues ?? [];
              return (
                <div key={group.label} className="mt-5">
                  <h4
                    className="text-xs font-semibold uppercase tracking-widest mb-2"
                    style={{ color: complete ? "#1f6b2d" : "#c47d0e" }}
                  >
                    {group.label} ({values.length}/{group.max})
                  </h4>
                  <div className="space-y-2">
                    {group.options.map((opt) => {
                      const isSelected = values.includes(opt);
                      const toggle = () => {
                        if (group.max === 1) {
                          setOptionsChoice(group, [opt]);
                          return;
                        }
                        const next = isSelected
                          ? values.filter((v) => v !== opt)
                          : [...values, opt];
                        if (!isSelected && next.length > group.max) return;
                        setOptionsChoice(group, next);
                      };
                      return (
                        <label
                          key={opt}
                          onClick={toggle}
                          className="flex items-center gap-3 rounded-xl px-3 py-2 cursor-pointer"
                          style={{
                            background: isSelected ? "#e8f4ea" : "white",
                            border: `1px solid ${isSelected ? "#1f6b2d" : "#e0d9cc"}`,
                          }}
                        >
                          <input
                            type={group.max === 1 ? "radio" : "checkbox"}
                            checked={isSelected}
                            readOnly
                          />
                          <span
                            className="text-sm"
                            style={{
                              color: isSelected ? "#1f6b2d" : "#333",
                              fontWeight: isSelected ? 600 : 400,
                            }}
                          >
                            {opt}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            }
            const cats =
              group.source_categories ??
              (group.source_category ? [group.source_category] : []);
            return (
              <div key={group.label} className="mt-5">
                <h4
                  className="text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: complete ? "#1f6b2d" : "#c47d0e" }}
                >
                  {group.label} ({sel.dishIds.length}/{group.max})
                </h4>
                {(() => {
                  const renderBelow =
                    group.max === 1
                      ? (dish: MenuItemLite) =>
                          renderNestedCustomization(group.label, dish)
                      : (dish: MenuItemLite, idx?: number) => {
                          const nested = renderNestedCustomization(
                            `${group.label}#${idx}`,
                            dish,
                          );
                          if (!nested) return null;
                          return (
                            <div key={idx}>
                              <p
                                className="text-[10px] font-semibold uppercase tracking-wide mt-2 mb-1"
                                style={{ color: "#c47d0e" }}
                              >
                                {group.label} {(idx ?? 0) + 1} — {dish.name}
                              </p>
                              {nested}
                            </div>
                          );
                        };
                  return cats.length > 1 ? (
                    cats.map((cat) => {
                      const catCandidates = dishesByCategory[cat] ?? [];
                      if (catCandidates.length === 0) return null;
                      return (
                        <div key={cat} className="mb-3">
                          <p
                            className="text-[10px] font-semibold uppercase tracking-wide mb-1.5"
                            style={{ color: "#9ca89b" }}
                          >
                            {cat}
                          </p>
                          <QuantityDishPicker
                            candidates={catCandidates}
                            max={group.max}
                            selected={sel.dishIds}
                            onChange={(ids) => setCategoryChoice(group, ids)}
                            renderBelowSelected={renderBelow}
                          />
                        </div>
                      );
                    })
                  ) : (
                    <QuantityDishPicker
                      candidates={cats.flatMap(
                        (cat) => dishesByCategory[cat] ?? [],
                      )}
                      max={group.max}
                      selected={sel.dishIds}
                      onChange={(ids) => setCategoryChoice(group, ids)}
                      renderBelowSelected={renderBelow}
                    />
                  );
                })()}
              </div>
            );
          })}

          {displayedAllergens.length > 0 && (
            <div
              className="mt-5 rounded-xl p-3"
              style={{ background: "#c47d0e22", border: "1px solid #c47d0e55" }}
            >
              <h4
                className="text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: "#c47d0e" }}
              >
                ⚠ Allergènes
              </h4>
              <div className="flex flex-wrap gap-2">
                {displayedAllergens.map((a) => (
                  <span
                    key={a}
                    className="text-xs px-3 py-1 rounded-full"
                    style={{
                      background: "#c47d0e22",
                      color: "#c47d0e",
                      border: "1px solid #c47d0e55",
                    }}
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!allComplete}
            className="mt-6 w-full rounded-2xl py-3 text-white font-semibold disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #1f6b2d, #2d8a3e)" }}
          >
            {allComplete
              ? `${t("customize.addToCart", "Ajouter au panier")} · ${priceLabel}`
              : t("customize.completeSelection", "Complétez votre sélection")}
          </button>
        </div>
      </div>
      <style>{`.dish-modal-scroll::-webkit-scrollbar { display: none; }`}</style>
    </div>,
    document.body,
  );
};

export default DishCustomizationModal;
