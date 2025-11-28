'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'What is OneSign?',
    answer:
      'OneSign is a comprehensive digital signature platform that enables secure, legally binding electronic signatures for documents. Our platform streamlines the signing process, making it fast, secure, and compliant with international standards.',
  },
  {
    question: 'Is OneSign legally binding?',
    answer:
      'Yes, OneSign complies with international e-signature laws including eIDAS, ESIGN Act, and UETA. All signatures created through our platform are legally binding and admissible in court.',
  },
  {
    question: 'How secure is OneSign?',
    answer:
      'OneSign uses bank-level encryption (AES-256) to protect your documents. We employ multi-factor authentication, audit trails, and comply with SOC 2 Type II and ISO 27001 security standards.',
  },
  {
    question: 'What file formats are supported?',
    answer:
      'OneSign supports PDF, Word (DOC/DOCX), Excel (XLS/XLSX), PowerPoint (PPT/PPTX), and image files (PNG, JPG). All documents are converted to secure PDF format for signing.',
  },
  {
    question: 'Can I use OneSign on mobile devices?',
    answer:
      'Yes! OneSign is fully responsive and works seamlessly on smartphones and tablets. We also offer dedicated iOS and Android apps for an optimized mobile experience.',
  },
  {
    question: 'How much does OneSign cost?',
    answer:
      'OneSign offers flexible pricing plans to suit businesses of all sizes. We have a free tier for individual use, as well as professional and enterprise plans with advanced features. Contact our sales team for custom enterprise pricing.',
  },
  {
    question: 'Can I integrate OneSign with other tools?',
    answer:
      'Yes, OneSign integrates with popular tools like Salesforce, Google Drive, Dropbox, Microsoft 365, and more. We also provide a comprehensive API for custom integrations.',
  },
  {
    question: 'What support do you offer?',
    answer:
      'We provide 24/7 email support for all users, with priority phone and chat support for premium plans. Enterprise customers receive dedicated account management and technical support.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Find answers to common questions about OneSign
        </p>
      </div>

      <div className="space-y-4">
        {faqData.map((faq, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <button
              onClick={() => toggleQuestion(index)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="font-semibold text-gray-900 dark:text-white pr-4">
                {faq.question}
              </span>
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${
                  openIndex === index ? 'transform rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-6 pb-4 text-gray-600 dark:text-gray-300">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Still have questions?
        </p>
        <a
          href="/contact"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          Contact our support team
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>
    </div>
  );
}
