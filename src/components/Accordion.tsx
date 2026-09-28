"use client";

import { useReducedMotionPreference } from "@/lib/use-reduced-motion";

import { useState } from "react";
import { motion } from "motion/react";
import OriginalIcon from "@/components/OriginalIcon";

type Item = {
  title: string;
  paragraphs?: string[];
  list?: string[];
  columns?: string[][];
};

export default function Accordion({
  items,
  variant,
  id,
}: {
  items: Item[];
  variant: "clients" | "faq";
  id: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const [keyboardAction, setKeyboardAction] = useState(false);
  const reducedMotion = useReducedMotionPreference();
  return (
    <div className={`accordion accordion-${variant}`}>
      {items.map((item, index) => (
        <div className="accordion-item" key={item.title}>
          <h3>
            <button
              type="button"
              id={`${id}-question-${index}`}
              className="accordion-trigger"
              aria-expanded={active === index}
              aria-controls={`${id}-answer-${index}`}
              onClick={(event) => {
                setKeyboardAction(event.detail === 0);
                setActive(active === index ? null : index);
              }}
            >
              <span className="accordion-indicator" aria-hidden="true">
                {active === index ? (
                  "−"
                ) : (
                  <OriginalIcon name="chevron-down" width={14} height={14} />
                )}
              </span>
              {item.title}
            </button>
          </h3>
          <motion.div
            id={`${id}-answer-${index}`}
            role="region"
            aria-labelledby={`${id}-question-${index}`}
            aria-hidden={active !== index}
            inert={active !== index}
            initial={false}
            animate={{
              height: active === index ? "auto" : 0,
              opacity: active === index ? 1 : 0,
              visibility: "visible",
              transitionEnd: {
                visibility: active === index ? "visible" : "hidden",
              },
            }}
            transition={{
              duration: reducedMotion || keyboardAction ? 0 : 0.22,
              ease: [0.23, 1, 0.32, 1],
            }}
            style={{
              overflow: "hidden",
            }}
          >
            <div className="accordion-content">
              {item.columns ? (
                <div
                  className={`client-list ${item.columns.length > 1 ? "multiple-columns" : ""}`}
                >
                  {item.columns.map((column, columnIndex) => (
                    <ul key={columnIndex}>
                      {column.map((client) => (
                        <li key={client}>{client}</li>
                      ))}
                    </ul>
                  ))}
                </div>
              ) : null}
              {item.paragraphs?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {item.list && item.list.length > 0 ? (
                <ul>
                  {item.list.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </motion.div>
        </div>
      ))}
    </div>
  );
}
