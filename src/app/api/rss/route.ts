import { BlogService } from '@/services/blog.service';

export async function GET() {
  const posts = await BlogService.getPosts();

  const itemsXml = posts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>https://inkflow.dev/blog/${post.slug}</link>
      <guid>https://inkflow.dev/blog/${post.slug}</guid>
      <pubDate>${new Date(post.publishedAt || post.createdAt).toUTCString()}</pubDate>
      <description><![CDATA[${post.excerpt}]]></description>
    </item>`
    )
    .join('');

  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>InkFlow Platform Feed</title>
    <link>https://inkflow.dev</link>
    <description>Modern technical articles and software architecture blueprints.</description>
    <language>en-us</language>
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
