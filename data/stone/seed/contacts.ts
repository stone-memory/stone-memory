import type { Contacts } from '@/lib/stone/cms-types'

export const contacts: Contacts = {
  legalName: 'Stone Memory',
  brand: 'Stone Memory',
  company: 'ФОП Stone Memory',
  phone: {
    display: '+380 (68) 808 02 22',
    href: 'tel:+380688080222',
  },
  email: {
    display: 'info@stonememory.com.ua',
    href: 'mailto:info@stonememory.com.ua',
  },
  address: {
    city: 'Костопіль',
    region: 'Рівненська область',
    country: 'Україна',
    street: 'провулок Білий, 20',
    postalCode: '35000',
    // координати виробництва для карти/LocalBusiness
    lat: 50.865009,
    lng: 26.4539213,
  },
  hours: {
    weekdays: 'Пн–Пт 9:00–19:00',
    saturday: 'Сб 10:00–16:00',
    sunday: 'Нд — вихідний',
  },
  chat: {
    viber: 'viber://chat?number=%2B380688080222',
    telegram: 'https://t.me/+380688080222',
    whatsapp:
      'https://wa.me/380688080222?text=Добрий%20день!%20Хочу%20обговорити%20виріб%20з%20каменю.',
  },
  social: {
    instagram: 'https://www.instagram.com/sttonememory/',
    facebook: 'https://www.facebook.com/profile.php?id=61588950935616',
  },
  // Адреса сайту НЕ тут: див. lib/site-config.ts (SITE_URL / absoluteUrl).
}
