import React from 'react';
import { Metadata } from 'next';
import { ArticleReaderClient } from '@/features/blogs/article-reader-client';

export const metadata: Metadata = {
  title: 'Private Story | InkFlow',
  robots: { index: false, follow: false },
};

export default async function PrivateSharePage({
  params,
}: {
  params: Promise<{ shareToken: string }>;
}) {
  const { shareToken } = await params;
  return <ArticleReaderClient shareToken={decodeURIComponent(shareToken)} />;
}

