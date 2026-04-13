import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    // 1. Попытка получить город из заголовков Vercel (работает на проде)
    const vercelCity = req.headers.get('x-vercel-ip-city');
    
    // Декодируем город из latin1 (Vercel присылает так), если он есть
    if (vercelCity) {
      // Некоторые города приходят в кодировке, лучше вернуть как есть или обработать
      return NextResponse.json({
        city: decodeURIComponent(vercelCity) || 'Астана'
      });
    }

    // 2. Если мы на локалке или заголовка нет, используем ipinfo.io
    // Но передаем IP пользователя, а не сервера
    const xForwardedFor = req.headers.get('x-forwarded-for');
    const ip = xForwardedFor ? xForwardedFor.split(',')[0] : '';
    
    const url = ip ? `https://ipinfo.io/${ip}/json` : "https://ipinfo.io/json";
    const response = await fetch(url, {
      next: { revalidate: 3600 } 
    });
    
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        city: data.city || 'Астана'
      });
    }

    return NextResponse.json({ city: 'Астана' });
  } catch (error) {
    console.warn("Location fetch fallback triggered. Defaulting to 'Астана'.");
    return NextResponse.json({ city: 'Астана' });
  }
}
