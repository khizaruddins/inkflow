'use client';

import React, { useEffect } from 'react';

/**
 * Enhances rendered <pre><code> code blocks with:
 * 1. A clean "Copy" button that copies raw code to clipboard
 * 2. An optional subtle language badge in the upper right
 */
export function CodeBlockEnhancer() {
  useEffect(() => {
    const preBlocks = document.querySelectorAll<HTMLPreElement>('.article-body pre, .prose pre');

    preBlocks.forEach((pre) => {
      // Avoid duplicate wrappers
      if (pre.dataset.enhanced === 'true') return;
      pre.dataset.enhanced = 'true';

      const codeElement = pre.querySelector('code');
      if (!codeElement) return;

      // Detect language if present
      const classList = Array.from(codeElement.classList);
      const langClass = classList.find((c) => c.startsWith('language-'));
      const lang = langClass ? langClass.replace('language-', '') : '';

      // Create toolbar container
      const toolbar = document.createElement('div');
      toolbar.className =
        'absolute top-3 right-3 flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity z-10';

      if (lang && lang !== 'plaintext') {
        const langBadge = document.createElement('span');
        langBadge.className =
          'text-[10px] font-mono uppercase tracking-wider text-muted-foreground/80 px-2 py-0.5 rounded-md bg-muted/80 border border-border/40 select-none';
        langBadge.textContent = lang;
        toolbar.appendChild(langBadge);
      }

      // Copy button
      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className =
        'inline-flex items-center gap-1 text-[11px] font-sans font-medium text-muted-foreground hover:text-foreground bg-background/80 hover:bg-background border border-border/60 px-2.5 py-1 rounded-lg backdrop-blur-xs transition-all shadow-xs cursor-pointer select-none';
      copyBtn.innerHTML = `
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
        </svg>
        <span>Copy</span>
      `;

      copyBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const text = codeElement.textContent || '';
        try {
          await navigator.clipboard.writeText(text);
          copyBtn.innerHTML = `
            <svg class="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="text-emerald-500">Copied!</span>
          `;
          setTimeout(() => {
            copyBtn.innerHTML = `
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              <span>Copy</span>
            `;
          }, 2000);
        } catch (err) {
          console.error('Failed to copy code: ', err);
        }
      });

      toolbar.appendChild(copyBtn);
      pre.style.position = 'relative';
      pre.appendChild(toolbar);
    });
  }, []);

  return null;
}
