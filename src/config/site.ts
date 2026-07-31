export const siteConfig = {
  name: "InkFlow",
  description: "A modern, publishing-first blogging platform for thinkers, engineers, and creators.",
  url: "https://inkflow.dev",
  ogImage: "https://inkflow.dev/og.jpg",
  author: {
    name: "InkFlow Team",
    twitter: "@inkflow_dev",
    github: "https://github.com/inkflow",
  },
  links: {
    twitter: "https://twitter.com/inkflow_dev",
    github: "https://github.com/inkflow",
  },
  nav: {
    reader: [
      { title: "Home", href: "/" },
      { title: "Explore", href: "/blog" },
    ],
    admin: [
      { title: "Overview", href: "/dashboard" },
      { title: "Posts", href: "/dashboard/posts" },
      { title: "New Article", href: "/dashboard/posts/new" },
      { title: "Reports", href: "/dashboard/reports" },
      { title: "Categories", href: "/dashboard/categories" },
      { title: "Tags", href: "/dashboard/tags" },
      { title: "Analytics", href: "/dashboard/analytics" },
      { title: "Users", href: "/dashboard/users" },
      { title: "Settings", href: "/dashboard/settings" },
    ],
  },
};
