'use client';

import React, { useState } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Bold,
  Italic,
  Code,
  Quote,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Plus,
  X,
  Youtube,
  Code2,
  Braces,
  MoreHorizontal,
  Search,
  Upload,
  Download,
  FileText,
  Clock,
  Camera,
  AlignLeft,
  AlignCenter,
  Maximize,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { TransparentPromptModal } from '@/components/ui/transparent-prompt-modal';
import { KeyboardShortcutsBottomSheet } from '@/components/ui/keyboard-shortcuts-bottomsheet';
import { useEditorStore } from '@/store/use-editor-store';
import { htmlToMarkdown, markdownToHtml } from '@/lib/markdown';
import { calculateReadingTime } from '@/lib/utils';
import { searchUnsplash, UnsplashPhoto } from '@/lib/unsplash-search';
import { IframeExtension, normalizeEmbedUrl } from './extensions/iframe-extension';

export function TipTapEditor() {
  const { currentPost, updateField, saveVersion } = useEditorStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  // Inline Unsplash Search Line State
  const [showInlineUnsplash, setShowInlineUnsplash] = useState(false);
  const [unsplashQuery, setUnsplashQuery] = useState('');
  const [unsplashPage, setUnsplashPage] = useState(1);
  const [activeUnsplashResults, setActiveUnsplashResults] = useState<UnsplashPhoto[] | null>(null);
  const [isSearchingUnsplash, setIsSearchingUnsplash] = useState(false);

  // Image Selection Toolbar State
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [selectedImageAlt, setSelectedImageAlt] = useState<string>('');
  const [selectedImageScale, setSelectedImageScale] = useState<'normal' | 'wide' | 'full'>('normal');

  // Transparent Modals State (Replacing native prompt)
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'altText' | 'imageUrl' | 'videoUrl' | 'embedUrl' | null;
    title: string;
    subtitle?: string;
    imageSrc?: string | null;
    placeholder?: string;
    initialValue?: string;
  }>({
    isOpen: false,
    type: null,
    title: '',
  });

  const [showMarkdownModal, setShowMarkdownModal] = useState(false);
  const [markdownInput, setMarkdownInput] = useState('');
  const [showShortcutsSheet, setShowShortcutsSheet] = useState(false);

  // Dynamic Left Gutter Plus Button Line Tracking
  const [menuTop, setMenuTop] = useState<number>(0);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  const performSearch = React.useCallback(async (q: string) => {
    setIsSearchingUnsplash(true);
    try {
      const results = await searchUnsplash(q);
      setUnsplashPage(1);
      setActiveUnsplashResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearchingUnsplash(false);
    }
  }, []);

  const handleUnsplashSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      performSearch(unsplashQuery);
    }
  };

  const insertUnsplashImageInline = (photo: UnsplashPhoto) => {
    if (!editor) return;
    const photographerLink = photo.photographerUrl || 'https://unsplash.com';
    const captionHtml = `<p><img src="${photo.url}" alt="${photo.title}" class="rounded-xl my-4 border-2 border-emerald-500 shadow-lg" /><span class="block text-center text-xs text-muted-foreground my-2">Photo by <a href="${photographerLink}" target="_blank" class="underline">${photo.photographer}</a> on <a href="https://unsplash.com" target="_blank" class="underline">Unsplash</a></span></p>`;
    editor.chain().focus().insertContent(captionHtml).run();
    setShowInlineUnsplash(false);
    setActiveUnsplashResults(null);
    setUnsplashQuery('');
    setUnsplashPage(1);
  };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      IframeExtension,
      ImageExtension.configure({
        allowBase64: true,
      }),
      LinkExtension.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Tell your story...',
      }),
    ],
    content: currentPost.content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      updateField('content', html);
      if (wrapperRef.current) {
        try {
          const { from } = editor.state.selection;
          const coords = editor.view.coordsAtPos(from);
          const wrapperRect = wrapperRef.current.getBoundingClientRect();
          setMenuTop(Math.max(0, coords.top - wrapperRect.top - 2));
        } catch (_) {}
      }
    },
    onSelectionUpdate: ({ editor }) => {
      if (editor.isActive('image')) {
        const attrs = editor.getAttributes('image');
        if (attrs.src) {
          setSelectedImageSrc(attrs.src);
          setSelectedImageAlt(attrs.alt || '');
        }
      } else {
        setSelectedImageSrc(null);
      }
      if (wrapperRef.current) {
        try {
          const { from } = editor.state.selection;
          const coords = editor.view.coordsAtPos(from);
          const wrapperRect = wrapperRef.current.getBoundingClientRect();
          setMenuTop(Math.max(0, coords.top - wrapperRect.top - 2));
        } catch (_) {}
      }
    },
    onFocus: ({ editor }) => {
      if (wrapperRef.current) {
        try {
          const { from } = editor.state.selection;
          const coords = editor.view.coordsAtPos(from);
          const wrapperRect = wrapperRef.current.getBoundingClientRect();
          setMenuTop(Math.max(0, coords.top - wrapperRect.top - 2));
        } catch (_) {}
      }
    },
  });

  const updateMenuPosition = React.useCallback(() => {
    if (!editor || !wrapperRef.current) return;
    try {
      const { from } = editor.state.selection;
      const coords = editor.view.coordsAtPos(from);
      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      const relativeY = coords.top - wrapperRect.top;
      setMenuTop(Math.max(0, relativeY - 2));
    } catch (_) {}
  }, [editor]);

  React.useEffect(() => {
    const handleToggle = () => setShowShortcutsSheet((prev) => !prev);
    const handleCmdAlt6 = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.altKey && (e.key === '6' || e.code === 'Digit6')) {
        e.preventDefault();
        if (editor) {
          editor.chain().focus().toggleCodeBlock().run();
        }
      }
    };
    window.addEventListener('toggle-shortcuts-bottomsheet', handleToggle);
    window.addEventListener('keydown', handleCmdAlt6);
    return () => {
      window.removeEventListener('toggle-shortcuts-bottomsheet', handleToggle);
      window.removeEventListener('keydown', handleCmdAlt6);
    };
  }, [editor]);

  React.useEffect(() => {
    if (editor) {
      updateMenuPosition();
      window.addEventListener('resize', updateMenuPosition);
      window.addEventListener('scroll', updateMenuPosition);
      return () => {
        window.removeEventListener('resize', updateMenuPosition);
        window.removeEventListener('scroll', updateMenuPosition);
      };
    }
  }, [editor, updateMenuPosition]);

  React.useEffect(() => {
    if (editor && currentPost.content !== undefined) {
      const currentHtml = editor.getHTML();
      if (currentPost.content !== currentHtml) {
        const isEmptyEditor = editor.isEmpty || currentHtml === '<p></p>' || currentHtml === '';
        if (isEmptyEditor || !editor.isFocused) {
          editor.commands.setContent(currentPost.content || '', false);
        }
      }
    }
  }, [editor, currentPost.content]);

  if (!editor) return null;

  const readingTime = calculateReadingTime(editor.getHTML());

  const handleModalSave = (val: string) => {
    if (!val) return;
    if (modalConfig.type === 'imageUrl') {
      editor.chain().focus().setImage({ src: val }).run();
    } else if (modalConfig.type === 'altText' && selectedImageSrc) {
      editor.chain().focus().setImage({ src: selectedImageSrc, alt: val }).run();
    } else if (modalConfig.type === 'videoUrl') {
      const normalizedSrc = normalizeEmbedUrl(val);
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'iframe',
          attrs: { src: normalizedSrc },
        })
        .run();
    } else if (modalConfig.type === 'embedUrl') {
      if (val.includes('<iframe') || val.startsWith('http://') || val.startsWith('https://')) {
        const normalizedSrc = normalizeEmbedUrl(val);
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'iframe',
            attrs: { src: normalizedSrc },
          })
          .run();
      } else {
        const embedCode = `<blockquote class="border-l-4 border-primary pl-4 my-4 font-mono text-sm">Embed: ${val}</blockquote>`;
        editor.chain().focus().insertContent(embedCode).run();
      }
    }
  };

  const handleImportMarkdown = () => {
    const html = markdownToHtml(markdownInput);
    editor.commands.setContent(html);
    updateField('content', html);
    setShowMarkdownModal(false);
  };

  const handleExportMarkdown = () => {
    const md = htmlToMarkdown(editor.getHTML());
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPost.slug || 'story'}.md`;
    a.click();
  };

  const actions = [
    {
      id: 'image',
      label: 'Add an image',
      icon: ImageIcon,
      onClick: () =>
        setModalConfig({
          isOpen: true,
          type: 'imageUrl',
          title: 'Add Image URL',
          subtitle: 'Paste a web address of an image to insert into your story',
          placeholder: 'https://images.unsplash.com/...',
        }),
    },
    {
      id: 'unsplash',
      label: 'Search Unsplash',
      icon: Camera,
      onClick: () => {
        const next = !showInlineUnsplash;
        setShowInlineUnsplash(next);
        if (next) {
          performSearch(unsplashQuery || '');
        }
      },
    },
    {
      id: 'video',
      label: 'Add a video',
      icon: Youtube,
      onClick: () =>
        setModalConfig({
          isOpen: true,
          type: 'videoUrl',
          title: 'Add Video Embed',
          subtitle: 'Paste a YouTube or Vimeo video link to embed in your story',
          placeholder: 'https://www.youtube.com/watch?v=...',
        }),
    },
    {
      id: 'embed',
      label: 'Add an embed',
      icon: Code2,
      onClick: () =>
        setModalConfig({
          isOpen: true,
          type: 'embedUrl',
          title: 'Add Interactive Embed',
          subtitle: 'Paste a Twitter/X post link or GitHub Gist URL',
          placeholder: 'https://twitter.com/username/status/...',
        }),
    },
    {
      id: 'code',
      label: 'Add a new code block',
      icon: Braces,
      onClick: () => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      id: 'divider',
      label: 'Add a part divider',
      icon: MoreHorizontal,
      onClick: () => editor.chain().focus().setHorizontalRule().run(),
    },
  ];

  return (
    <div className="relative space-y-6">
      {/* Medium Floating Selection Bubble Menu for Text */}
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 150 }}
          className="flex items-center gap-1 bg-slate-900 text-slate-100 p-1.5 rounded-xl shadow-2xl border border-slate-800 backdrop-blur-md z-50"
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors ${
              editor.isActive('bold') ? 'text-emerald-400 bg-slate-800' : 'text-slate-300'
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors ${
              editor.isActive('italic') ? 'text-emerald-400 bg-slate-800' : 'text-slate-300'
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors ${
              editor.isActive('heading', { level: 1 }) ? 'text-emerald-400 bg-slate-800' : 'text-slate-300'
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors ${
              editor.isActive('heading', { level: 2 }) ? 'text-emerald-400 bg-slate-800' : 'text-slate-300'
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors ${
              editor.isActive('blockquote') ? 'text-emerald-400 bg-slate-800' : 'text-slate-300'
            }`}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-1.5 rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors ${
              editor.isActive('codeBlock') ? 'text-emerald-400 bg-slate-800' : 'text-slate-300'
            }`}
            title="Code"
          >
            <Code className="w-4 h-4" />
          </button>
        </BubbleMenu>
      )}

      {/* Floating Image Scale & Alt Text Toolbar when Image is clicked */}
      <AnimatePresence>
        {selectedImageSrc && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900 text-slate-100 p-2 rounded-2xl shadow-2xl border border-slate-800 backdrop-blur-md font-sans"
          >
            <button
              onClick={() => setSelectedImageScale('normal')}
              className={`p-2 rounded-xl text-xs flex items-center gap-1 font-semibold transition-colors ${
                selectedImageScale === 'normal' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
              title="Normal Center Inset"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedImageScale('wide')}
              className={`p-2 rounded-xl text-xs flex items-center gap-1 font-semibold transition-colors ${
                selectedImageScale === 'wide' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
              title="Wide Column Width"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedImageScale('full')}
              className={`p-2 rounded-xl text-xs flex items-center gap-1 font-semibold transition-colors ${
                selectedImageScale === 'full' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
              title="Full Bleed Width"
            >
              <Maximize className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-slate-700 mx-1" />

            <button
              onClick={() =>
                setModalConfig({
                  isOpen: true,
                  type: 'altText',
                  title: 'Alternative text',
                  subtitle: 'Write a brief description of this image for readers with visual impairments',
                  imageSrc: selectedImageSrc,
                  placeholder: 'E.g., An antique typewriter with a blank sheet of paper sits on a wooden desk',
                  initialValue: selectedImageAlt,
                })
              }
              className="px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer"
            >
              Alt text
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Canvas Wrapper with Absolute Left Margin Gutter Positioned Menu */}
      <div className="relative w-full" ref={wrapperRef}>
        {/* Absolute Left Gutter Menu - Dynamically Tracks Active Line Position */}
        <motion.div
          animate={{ top: menuTop }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="absolute -left-12 sm:-left-16 z-30"
        >
          <div className="flex items-center gap-2">
            {/* Toggle Circle (+) / (X) Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                isMenuOpen
                  ? 'border-foreground text-foreground bg-background'
                  : 'border-muted-foreground/40 text-muted-foreground hover:border-foreground hover:text-foreground bg-background'
              }`}
              title={isMenuOpen ? 'Close menu' : 'Add media or element'}
            >
              {isMenuOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </motion.button>

            {/* Expanded Horizontal Green Circle Tools */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 bg-background/95 backdrop-blur-md p-1 rounded-full shadow-lg border border-border/40"
                >
                  {actions.map((act) => {
                    const Icon = act.icon;
                    return (
                      <div key={act.id} className="relative">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onMouseEnter={() => setHoveredAction(act.label)}
                          onMouseLeave={() => setHoveredAction(null)}
                          onClick={() => {
                            act.onClick();
                            setIsMenuOpen(false);
                          }}
                          className="w-8 h-8 rounded-full border border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-background hover:bg-emerald-500/10 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Medium Style Hover Tooltip */}
          <AnimatePresence>
            {isMenuOpen && hoveredAction && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute left-12 top-11 z-40 bg-slate-900 text-slate-100 text-[11px] px-2.5 py-1 rounded-md shadow-xl font-sans whitespace-nowrap"
              >
                {hoveredAction}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Medium Inline Unsplash Search Bar - Dynamically Attached to Current Active Line Position */}
        <AnimatePresence>
          {showInlineUnsplash && (
            <motion.div
              style={{ top: menuTop + 44 }}
              initial={{ opacity: 0, scale: 0.98, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -5 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 z-40 bg-card/95 backdrop-blur-xl p-5 rounded-3xl border border-border/80 shadow-2xl space-y-4 font-sans max-w-2xl mx-auto"
            >
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={unsplashQuery}
                  onChange={(e) => {
                    const q = e.target.value;
                    setUnsplashQuery(q);
                    performSearch(q);
                  }}
                  onKeyDown={handleUnsplashSearch}
                  placeholder="Type keywords to search Unsplash (e.g. boredom, coffee, nature, books, code, travel), and press Enter"
                  className="w-full py-2 text-sm font-sans bg-transparent border-none border-b border-border outline-none text-foreground placeholder:text-muted-foreground/50"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowInlineUnsplash(false);
                    setActiveUnsplashResults(null);
                  }}
                  className="ml-3 p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Close search"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Inline Photo Results Grid with True Batch Pagination */}
              {activeUnsplashResults && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Batch {unsplashPage} of {Math.ceil(activeUnsplashResults.length / 6)} • Showing{' '}
                      {Math.min((unsplashPage - 1) * 6 + 1, activeUnsplashResults.length)}-
                      {Math.min(unsplashPage * 6, activeUnsplashResults.length)} of {activeUnsplashResults.length * 500} photos
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={unsplashPage <= 1}
                        onClick={() => setUnsplashPage((p) => Math.max(1, p - 1))}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border/70 hover:bg-muted text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Prev
                      </button>
                      <button
                        type="button"
                        disabled={unsplashPage * 6 >= activeUnsplashResults.length}
                        onClick={() => setUnsplashPage((p) => p + 1)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border/70 hover:bg-muted text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                      >
                        Next
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {activeUnsplashResults
                      .slice((unsplashPage - 1) * 6, unsplashPage * 6)
                      .map((photo, idx) => (
                      <div
                        key={idx}
                        onClick={() => insertUnsplashImageInline(photo)}
                        className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-border cursor-pointer hover:border-emerald-500/80 transition-colors shadow-xs"
                      >
                        <img src={photo.url} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                          <span className="text-[10px] text-white font-medium line-clamp-1">Photo by {photo.photographer}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full-width TipTap Canvas Area */}
        <div className="w-full pl-0">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Minimal Footer Toolbar */}
      <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-10 border-t border-border/40 font-sans">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            {readingTime.wordCount} words
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {readingTime.minutes} min read
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMarkdownModal(true)}
            className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" /> Import MD
          </button>
          <span>•</span>
          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export MD
          </button>
          <span>•</span>
          <button
            onClick={saveVersion}
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            Save Revision
          </button>
          <span>•</span>
          <button
            onClick={() => setShowShortcutsSheet(true)}
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            Shortcuts (⌘Shift?)
          </button>
        </div>
      </div>

      {/* Transparent Full-Screen Prompt Modal for Alt Text, Image, Video & Embed Inputs */}
      <TransparentPromptModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onSave={handleModalSave}
        title={modalConfig.title}
        subtitle={modalConfig.subtitle}
        imageSrc={modalConfig.imageSrc}
        placeholder={modalConfig.placeholder}
        initialValue={modalConfig.initialValue}
      />

      {/* Keyboard Shortcuts Bottom Sheet Modal */}
      <KeyboardShortcutsBottomSheet
        isOpen={showShortcutsSheet}
        onClose={() => setShowShortcutsSheet(false)}
      />

      {/* Markdown Import Modal */}
      {showMarkdownModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-card p-6 rounded-2xl border border-border space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-foreground font-sans">Import Markdown Content</h3>
            <textarea
              rows={8}
              value={markdownInput}
              onChange={(e) => setMarkdownInput(e.target.value)}
              placeholder="Paste raw markdown here..."
              className="w-full p-3 bg-muted/50 border border-border rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setShowMarkdownModal(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleImportMarkdown}>
                Convert & Insert
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
