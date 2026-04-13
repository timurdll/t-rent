/**
 * Вспомогательные функции для работы с Telegram-конфигом через Prisma.
 * Все операции с БД обёрнуты в try/catch — если база недоступна,
 * приложение не падает, а только логирует ошибку.
 */
import { prisma } from './prisma';

const CHAT_ID_KEY = 'TELEGRAM_CHAT_ID';
const CHAT_TITLE_KEY = 'TELEGRAM_CHAT_TITLE';
const CHAT_TYPE_KEY = 'TELEGRAM_CHAT_TYPE';

/** Читает chatId из БД. Fallback: process.env.TELEGRAM_CHAT_ID */
export async function getTelegramChatId(): Promise<string | null> {
  try {
    const record = await prisma.systemConfig.findUnique({
      where: { key: CHAT_ID_KEY },
    });
    if (record?.value) return record.value;
  } catch (err) {
    console.error('[telegramConfig] Failed to read TELEGRAM_CHAT_ID from DB:', err);
  }
  return process.env.TELEGRAM_CHAT_ID ?? null;
}

/** Читает полный Telegram-конфиг (chatId, title, type) из БД. */
export async function getTelegramConfig(): Promise<{
  chatId: string | null;
  chatTitle: string | null;
  chatType: string | null;
}> {
  try {
    const records = await prisma.systemConfig.findMany({
      where: { key: { in: [CHAT_ID_KEY, CHAT_TITLE_KEY, CHAT_TYPE_KEY] } },
    });
    const map = Object.fromEntries(records.map((r: { key: string; value: string }) => [r.key, r.value]));
    return {
      chatId: map[CHAT_ID_KEY] ?? process.env.TELEGRAM_CHAT_ID ?? null,
      chatTitle: map[CHAT_TITLE_KEY] ?? null,
      chatType: map[CHAT_TYPE_KEY] ?? null,
    };
  } catch (err) {
    console.error('[telegramConfig] Failed to read Telegram config from DB:', err);
    return {
      chatId: process.env.TELEGRAM_CHAT_ID ?? null,
      chatTitle: null,
      chatType: null,
    };
  }
}

/** Сохраняет Telegram-конфиг в БД через upsert. */
export async function setTelegramConfig(
  chatId: string,
  chatTitle: string,
  chatType?: string,
): Promise<void> {
  try {
    await prisma.$transaction([
      prisma.systemConfig.upsert({
        where: { key: CHAT_ID_KEY },
        create: { key: CHAT_ID_KEY, value: chatId },
        update: { value: chatId },
      }),
      prisma.systemConfig.upsert({
        where: { key: CHAT_TITLE_KEY },
        create: { key: CHAT_TITLE_KEY, value: chatTitle },
        update: { value: chatTitle },
      }),
      prisma.systemConfig.upsert({
        where: { key: CHAT_TYPE_KEY },
        create: { key: CHAT_TYPE_KEY, value: chatType ?? 'private' },
        update: { value: chatType ?? 'private' },
      }),
    ]);
  } catch (err) {
    console.error('[telegramConfig] Failed to save Telegram config to DB:', err);
    throw err; // пробрасываем, чтобы бот мог ответить об ошибке
  }
}

/** Удаляет Telegram-конфиг из БД. */
export async function clearTelegramConfig(): Promise<void> {
  try {
    await prisma.systemConfig.deleteMany({
      where: { key: { in: [CHAT_ID_KEY, CHAT_TITLE_KEY, CHAT_TYPE_KEY] } },
    });
  } catch (err) {
    console.error('[telegramConfig] Failed to clear Telegram config from DB:', err);
    throw err;
  }
}
