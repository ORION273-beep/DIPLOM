import { Link } from 'react-router-dom';
'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { HelpCircle } from '@untitledui/icons';
import { motion } from 'motion/react';
import { cx } from '@/utils/cx';

export type FAQItem = {
  id: string;
  question: string;
  answer: string;
  icon?: FC<{ className?: string }>;
};

export type FAQAccordion03BrandProps = {
  items: FAQItem[];
  eyebrow?: string;
  title?: string;
  description?: string;
  supportHref?: string;
  supportLabel?: string;
};

export function FAQAccordion03Brand({
  items,
  eyebrow = 'Support',
  title = 'FAQs',
  description,
  supportHref = '/contacts',
  supportLabel = 'свяжитесь с поддержкой',
}: FAQAccordion03BrandProps) {
  const [openQuestions, setOpenQuestions] = useState(new Set<string>(items[0] ? [items[0].id] : []));

  const handleToggle = (id: string) => {
    const next = new Set(openQuestions);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setOpenQuestions(next);
  };

  return (
    <section className="bg-brand-section py-16 md:py-24">
      <div className="mx-auto max-w-container px-4 md:px-8">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          <div className="flex w-full max-w-3xl flex-col lg:max-w-xl">
            <span className="text-sm font-semibold text-secondary_on-brand md:text-md">{eyebrow}</span>
            <h2 className="mt-3 text-display-sm font-semibold text-primary_on-brand md:text-display-md">{title}</h2>
            {description && (
              <p className="mt-4 text-lg text-tertiary_on-brand md:mt-5">
                {description}{' '}
                <Link
                  to={supportHref}
                  className="rounded-xs underline underline-offset-4 outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {supportLabel}
                </Link>
                .
              </p>
            )}
          </div>
          <div className="flex w-full flex-col gap-8">
            {items.map((faq) => {
              const Icon = faq.icon ?? HelpCircle;
              const isOpen = openQuestions.has(faq.id);

              return (
                <div key={faq.id}>
                  <h3>
                    <button
                      type="button"
                      onClick={() => handleToggle(faq.id)}
                      className="flex w-full cursor-pointer items-start justify-between gap-6 rounded-md text-left outline-focus-ring select-none focus-visible:outline-2 focus-visible:outline-offset-2 md:gap-6"
                    >
                      <span className="flex items-start gap-3 text-md font-semibold text-primary_on-brand">
                        <Icon className="mt-0.5 size-5 shrink-0 text-icon-fg-brand_on-brand" />
                        {faq.question}
                      </span>
                      <span aria-hidden="true" className="flex size-6 shrink-0 items-center text-icon-fg-brand_on-brand">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line
                            className={cx(
                              'origin-center rotate-0 transition duration-150 ease-out',
                              isOpen && '-rotate-90'
                            )}
                            x1="12"
                            y1="8"
                            x2="12"
                            y2="16"
                          />
                          <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                      </span>
                    </button>
                  </h3>
                  <motion.div
                    className="overflow-hidden"
                    initial={false}
                    animate={{
                      height: isOpen ? 'auto' : 0,
                      opacity: isOpen ? 1 : 0,
                    }}
                    transition={{
                      type: 'spring',
                      damping: 24,
                      stiffness: 240,
                      bounce: 0.4,
                    }}
                  >
                    <div className="pt-1 pr-12">
                      <p className="text-md text-tertiary_on-brand">{faq.answer}</p>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
