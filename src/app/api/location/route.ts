import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch("https://ipinfo.io/json", {
      next: { revalidate: 3600 } 
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error("Invalid JSON response");
    }
    
    return NextResponse.json({
      city: data.city || 'Астана'
    });
  } catch (error) {
    // Only log a warning without the stack trace to avoid spamming the console
    console.warn("Location fetch fallback triggered. Defaulting to 'Астана'.");
    return NextResponse.json({ city: 'Астана' });
  }
}
