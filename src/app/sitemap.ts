import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://t-rent.kz',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    // We can add more routes if they existed, but currently it's a one-page landing
  ]
}
