export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/admin/', '/onboarding/'],
      },
    ],
    sitemap: 'https://onnepal.com/sitemap.xml',
    host: 'https://onnepal.com',
  };
}
