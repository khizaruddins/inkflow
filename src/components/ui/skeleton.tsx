'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rect' | 'circle' | 'text' | 'pill';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'rect',
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const variantClasses =
    variant === 'circle'
      ? 'rounded-full'
      : variant === 'pill'
      ? 'rounded-full'
      : variant === 'text'
      ? 'rounded-md h-4'
      : 'rounded-lg';

  return (
    <div
      aria-hidden="true"
      className={cn('skeleton-shimmer', variantClasses, className)}
      style={{
        ...(width !== undefined ? { width } : {}),
        ...(height !== undefined ? { height } : {}),
        ...style,
      }}
      {...props}
    />
  );
}

export function SkeletonText({
  lines = 3,
  className,
  lineClassName,
  lastLineWidth = '68%',
}: {
  lines?: number;
  className?: string;
  lineClassName?: string;
  lastLineWidth?: string;
}) {
  return (
    <div aria-hidden="true" className={cn('space-y-2.5', className)}>
      {Array.from({ length: lines }).map((_, idx) => {
        const isLast = idx === lines - 1 && lines > 1;
        return (
          <Skeleton
            key={idx}
            variant="text"
            className={cn('w-full h-3.5', lineClassName)}
            style={isLast ? { width: lastLineWidth } : undefined}
          />
        );
      })}
    </div>
  );
}

export function SkeletonCircle({
  size = 40,
  className,
}: {
  size?: number | string;
  className?: string;
}) {
  return (
    <Skeleton
      variant="circle"
      width={size}
      height={size}
      className={cn('shrink-0', className)}
    />
  );
}

const WRAPPER_TOKEN_REGEX =
  /^(?:w-|h-|min-w-|max-w-|min-h-|max-h-|aspect-|rounded|border|shrink|flex-shrink|grow|flex-grow|basis-|overflow-|shadow-|ring-|m-|mx-|my-|mt-|mr-|mb-|ml-|self-|col-span-|row-span-)/;

function splitImageClasses(className?: string): {
  wrapperClasses: string;
  imgClasses: string;
  hasExplicitSize: boolean;
} {
  if (!className) {
    return { wrapperClasses: '', imgClasses: '', hasExplicitSize: false };
  }

  const wrapperTokens: string[] = [];
  const imgTokens: string[] = [];
  let hasHeightOrAspect = false;

  for (const token of className.split(/\s+/).filter(Boolean)) {
    const baseToken = token.includes(':') ? token.split(':').pop() || token : token;
    if (/^(?:h-|aspect-|min-h-)/.test(baseToken)) {
      hasHeightOrAspect = true;
    }
    if (WRAPPER_TOKEN_REGEX.test(baseToken)) {
      wrapperTokens.push(token);
      if (baseToken.startsWith('rounded')) {
        imgTokens.push(token);
      }
    } else {
      imgTokens.push(token);
    }
  }

  return {
    wrapperClasses: wrapperTokens.join(' '),
    imgClasses: imgTokens.join(' '),
    hasExplicitSize: hasHeightOrAspect,
  };
}

export interface ImageWithSkeletonProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height' | 'alt'> {
  src?: string | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: ImageProps['sizes'];
  priority?: boolean;
  quality?: number;
  unoptimized?: boolean;
  useNextImage?: boolean;
  wrapperClassName?: string;
  skeletonClassName?: string;
}

/**
 * Drop-in replacement for <img> and next/image that always renders a shimmering
 * skeleton box matching the target shape/aspect until the image finishes loading.
 */
export function ImageWithSkeleton({
  src,
  alt,
  fill = false,
  width,
  height,
  sizes,
  priority = false,
  quality,
  unoptimized,
  useNextImage,
  className,
  wrapperClassName,
  skeletonClassName,
  onLoad,
  onError,
  style,
  ...rest
}: ImageWithSkeletonProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const normalizedSrc = typeof src === 'string' ? src.trim() : '';
  const shouldUseNextImage = useMemo(() => {
    if (!normalizedSrc) return false;
    if (normalizedSrc.startsWith('data:') || normalizedSrc.startsWith('blob:')) {
      return false;
    }
    if (useNextImage !== undefined) return useNextImage;
    return Boolean(fill || (width && height));
  }, [normalizedSrc, useNextImage, fill, width, height]);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [normalizedSrc]);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [normalizedSrc]);

  const { wrapperClasses, imgClasses, hasExplicitSize } = useMemo(
    () => splitImageClasses(className),
    [className]
  );

  const handleLoad: React.ReactEventHandler<HTMLImageElement> = (e) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError: React.ReactEventHandler<HTMLImageElement> = (e) => {
    setHasError(true);
    setIsLoaded(true);
    onError?.(e);
  };

  const showSkeleton = Boolean(normalizedSrc) && !isLoaded;

  if (fill) {
    return (
      <span
        className={cn(
          'absolute inset-0 overflow-hidden block',
          wrapperClassName
        )}
      >
        {showSkeleton && (
          <Skeleton
            className={cn('absolute inset-0 w-full h-full rounded-none z-10', skeletonClassName)}
          />
        )}
        {normalizedSrc && !hasError ? (
          <Image
            src={normalizedSrc}
            alt={alt}
            fill
            sizes={sizes || '100vw'}
            priority={priority}
            quality={quality}
            unoptimized={unoptimized}
            className={cn(
              'transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0',
              className
            )}
            style={style}
            onLoad={handleLoad}
            onError={handleError}
          />
        ) : (
          <Skeleton
            className={cn('absolute inset-0 w-full h-full rounded-none', skeletonClassName)}
          />
        )}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'relative inline-block overflow-hidden align-middle',
        !wrapperClassName && wrapperClasses,
        !isLoaded && !hasExplicitSize && !height && 'min-h-[120px] min-w-[40px]',
        wrapperClassName
      )}
    >
      {showSkeleton && (
        <Skeleton
          className={cn('absolute inset-0 w-full h-full rounded-[inherit] z-10', skeletonClassName)}
        />
      )}

      {!normalizedSrc || hasError ? (
        <span
          aria-label={alt || 'Image placeholder'}
          className={cn(
            'flex items-center justify-center w-full h-full bg-muted/70 text-muted-foreground text-xs font-medium rounded-[inherit]',
            !hasExplicitSize && !height && 'min-h-[120px]'
          )}
        >
          {alt ? alt.charAt(0).toUpperCase() : ''}
        </span>
      ) : shouldUseNextImage && width && height ? (
        <Image
          src={normalizedSrc}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          priority={priority}
          quality={quality}
          unoptimized={unoptimized}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            wrapperClassName ? className : imgClasses
          )}
          style={style}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          ref={imgRef}
          src={normalizedSrc}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            'transition-opacity duration-300',
            wrapperClassName ? className : cn('w-full h-full', imgClasses),
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          style={style}
          onLoad={handleLoad}
          onError={handleError}
          {...rest}
        />
      )}
    </span>
  );
}

/**
 * Renders HTML strings safely with progressive per-element skeleton overlays on
 * embedded <img> and <iframe> nodes inside HTML articles/comments until they finish loading.
 */
export function HtmlContentWithSkeletons({
  html,
  className,
  isLoading = false,
}: {
  html: string;
  className?: string;
  isLoading?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root || isLoading) return;

    const cleanups: Array<() => void> = [];
    const mediaNodes = root.querySelectorAll('img, iframe');

    mediaNodes.forEach((node) => {
      if (node.parentElement?.dataset.htmlSkeletonWrapper === 'true') {
        return;
      }

      const isImg = node.tagName.toLowerCase() === 'img';
      if (isImg) {
        const imgEl = node as HTMLImageElement;
        if (imgEl.complete && imgEl.naturalWidth > 0) {
          return;
        }
      }

      const wrapper = document.createElement('div');
      wrapper.dataset.htmlSkeletonWrapper = 'true';
      wrapper.className = isImg
        ? 'relative overflow-hidden rounded-xl my-4 min-h-[180px]'
        : 'relative overflow-hidden rounded-xl my-4 aspect-video w-full';

      const overlay = document.createElement('div');
      overlay.setAttribute('aria-hidden', 'true');
      overlay.className =
        'skeleton-shimmer absolute inset-0 z-10 rounded-[inherit] pointer-events-none transition-opacity duration-300';

      const parent = node.parentNode;
      if (!parent) return;

      parent.insertBefore(wrapper, node);
      wrapper.appendChild(overlay);
      wrapper.appendChild(node);

      const el = node as HTMLElement;
      const previousOpacity = el.style.opacity;
      el.style.opacity = '0';
      el.style.transition = 'opacity 250ms ease';

      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        el.style.opacity = previousOpacity || '1';
        overlay.style.opacity = '0';
        wrapper.style.minHeight = '';
        window.setTimeout(() => {
          overlay.remove();
        }, 280);
      };

      el.addEventListener('load', finish, { once: true });
      el.addEventListener('error', finish, { once: true });
      // Safety timeout for third-party iframes that don't fire cross-origin load promptly
      const fallbackTimer = window.setTimeout(finish, isImg ? 5000 : 2500);

      cleanups.push(() => {
        window.clearTimeout(fallbackTimer);
        el.removeEventListener('load', finish);
        el.removeEventListener('error', finish);
      });
    });

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [html, isLoading]);

  if (isLoading) {
    return (
      <div aria-hidden="true" className={cn('space-y-6', className)}>
        <SkeletonText lines={4} lineClassName="h-4" lastLineWidth="78%" />
        <Skeleton className="w-full aspect-[16/9] rounded-xl" />
        <SkeletonText lines={5} lineClassName="h-4" lastLineWidth="62%" />
        <SkeletonText lines={3} lineClassName="h-4" lastLineWidth="85%" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

