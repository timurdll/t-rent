import { NextResponse } from 'next/server';
import { isAdminAuthed } from '@/src/server/adminAuth';
import { getAppConfig, setAppConfig, type AppConfig } from '@/src/server/appData';
import { getTelegramConfig } from '@/src/server/telegramConfig';

export const runtime = 'nodejs';

export async function GET() {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const appConfig = await getAppConfig();

  // Дополняем конфиг актуальными данными Telegram из БД
  const telegramCfg = await getTelegramConfig();

  return NextResponse.json({
    ...appConfig,
    telegramChatId: telegramCfg.chatId ?? undefined,
    telegramChatTitle: telegramCfg.chatTitle ?? undefined,
    telegramChatType: telegramCfg.chatType ?? undefined,
  });
}

export async function PUT(req: Request) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const patch = (await req.json().catch(() => null)) as Partial<AppConfig> | null;
  if (!patch) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  // Исключаем Telegram-поля — они управляются только через бота
  const { telegramChatId: _1, telegramChatTitle: _2, telegramChatType: _3, ...safePatch } = patch;
  void _1; void _2; void _3;

  await setAppConfig(safePatch);
  const nextConfig = await getAppConfig();

  // Возвращаем полный конфиг с telegram данными из БД
  const telegramCfg = await getTelegramConfig();
  return NextResponse.json({
    ...nextConfig,
    telegramChatId: telegramCfg.chatId ?? undefined,
    telegramChatTitle: telegramCfg.chatTitle ?? undefined,
    telegramChatType: telegramCfg.chatType ?? undefined,
  });
}
