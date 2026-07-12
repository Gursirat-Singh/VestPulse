"use client";

import React from "react";
import ReactMarkdown from "react-markdown";

interface ReportMarkdownProps {
  content: string | null;
}

export function ReportMarkdown({ content }: ReportMarkdownProps) {
  if (!content) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 border border-white/[0.08] bg-zinc-950/40 rounded-2xl p-6 md:p-10 shadow-2xl backdrop-blur-md">
      <div className="prose prose-invert prose-zinc max-w-none text-zinc-300 space-y-6">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="text-3xl font-extrabold text-white tracking-tight border-b border-white/[0.08] pb-4 mb-6">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-bold text-white mt-8 mb-4 flex items-center">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold text-zinc-100 mt-6 mb-2">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-sm md:text-base leading-relaxed text-zinc-300 mb-4">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-2 mb-4 pl-4">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside space-y-2 mb-4 pl-4">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="text-sm md:text-base text-zinc-300">
                {children}
              </li>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-white">
                {children}
              </strong>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-6 rounded-xl border border-white/[0.06] bg-zinc-900/30">
                <table className="w-full text-left text-sm text-zinc-300">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-zinc-900/80 text-xs font-semibold text-zinc-400 uppercase">
                {children}
              </thead>
            ),
            th: ({ children }) => (
              <th className="px-4 py-3 border-b border-white/[0.08] font-semibold">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-3 border-b border-white/[0.04]">
                {children}
              </td>
            ),
            tr: ({ children }) => (
              <tr className="hover:bg-zinc-800/20 transition-colors">
                {children}
              </tr>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 hover:underline inline-flex items-center"
              >
                {children}
              </a>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
