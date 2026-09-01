import { Node, mergeAttributes } from '@tiptap/core';

export interface IframeOptions {
  allowFullscreen: boolean;
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    iframe: {
      /**
       * Insert an iframe (video, embed, interactive player)
       */
      setIframe: (options: { src: string }) => ReturnType;
    };
  }
}

export function normalizeEmbedUrl(rawUrl: string): string {
  let url = rawUrl.trim();

  // If the user pasted full <iframe ... src="..." ...> code, extract the src
  if (url.includes('<iframe') && url.includes('src=')) {
    const match = url.match(/src=["']([^"']+)["']/i);
    if (match && match[1]) {
      url = match[1];
    }
  }

  // YouTube standard watch link: https://www.youtube.com/watch?v=VIDEO_ID
  if (url.includes('youtube.com/watch')) {
    try {
      const parsed = new URL(url);
      const v = parsed.searchParams.get('v');
      if (v) return `https://www.youtube-nocookie.com/embed/${v}`;
    } catch (_) {}
  }

  // YouTube short link: https://youtu.be/VIDEO_ID
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1]?.split(/[?&#]/)[0];
    if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
  }

  // YouTube Shorts: https://www.youtube.com/shorts/VIDEO_ID
  if (url.includes('youtube.com/shorts/')) {
    const id = url.split('youtube.com/shorts/')[1]?.split(/[?&#]/)[0];
    if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
  }

  // Vimeo link: https://vimeo.com/VIDEO_ID
  if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com')) {
    const id = url.split('vimeo.com/')[1]?.split(/[?&#]/)[0];
    if (id && !isNaN(Number(id))) return `https://player.vimeo.com/video/${id}`;
  }

  // Spotify embed: https://open.spotify.com/track/ID -> https://open.spotify.com/embed/track/ID
  if (url.includes('open.spotify.com/') && !url.includes('/embed/')) {
    return url.replace('open.spotify.com/', 'open.spotify.com/embed/');
  }

  // CodePen embed: https://codepen.io/user/pen/ID -> https://codepen.io/user/embed/ID
  if (url.includes('codepen.io/') && url.includes('/pen/')) {
    return url.replace('/pen/', '/embed/');
  }

  return url;
}

export const IframeExtension = Node.create<IframeOptions>({
  name: 'iframe',
  group: 'block',
  selectable: true,
  draggable: true,
  atom: true,

  addOptions() {
    return {
      allowFullscreen: true,
      HTMLAttributes: {
        class: 'w-full h-full border-0 rounded-2xl',
      },
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      frameborder: {
        default: 0,
      },
      allowfullscreen: {
        default: this.options.allowFullscreen,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'iframe',
      },
      {
        tag: 'div[data-iframe-wrapper]',
        getAttrs: (element) => {
          const el = element as HTMLElement;
          const iframe = el.querySelector('iframe');
          return {
            src: iframe?.getAttribute('src') || el.getAttribute('data-src'),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      {
        class: 'aspect-video w-full my-6 rounded-2xl overflow-hidden shadow-lg border border-border/60 bg-muted/30 relative not-prose',
        'data-iframe-wrapper': 'true',
        'data-src': HTMLAttributes.src,
      },
      [
        'iframe',
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
          class: 'w-full h-full border-0 absolute inset-0',
          allowfullscreen: 'true',
          loading: 'lazy',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
        }),
      ],
    ];
  },

  addCommands() {
    return {
      setIframe:
        (options: { src: string }) =>
        ({ commands }) => {
          const normalizedSrc = normalizeEmbedUrl(options.src);
          return commands.insertContent({
            type: this.name,
            attrs: {
              src: normalizedSrc,
            },
          });
        },
    };
  },
});
