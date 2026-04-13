import { NextResponse } from "next/server";
import { setTelegramConfig, clearTelegramConfig, getTelegramConfig } from "@/src/server/telegramConfig";

export const runtime = "nodejs";

// ID администратора — укажите ваш Telegram user ID для защиты /connect
// Получить можно у @userinfobot в Telegram
const ADMIN_TELEGRAM_ID = process.env.TELEGRAM_ADMIN_ID
  ? Number(process.env.TELEGRAM_ADMIN_ID)
  : null;

type TelegramChat = {
  id: number;
  type?: string;
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
};

type TelegramMessage = {
  message_id: number;
  from?: { id: number };
  chat: TelegramChat;
  text?: string;
};

type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
};

function chatTitle(chat: TelegramChat): string {
  if (chat.title) return chat.title;
  const name = [chat.first_name, chat.last_name].filter(Boolean).join(" ").trim();
  if (name) return name;
  if (chat.username) return `@${chat.username}`;
  return String(chat.id);
}

async function sendMessage(chatId: number, text: string): Promise<void> {
  const token = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("BOT_TOKEN is not set");

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Telegram sendMessage failed: ${res.status} ${body}`);
  }
}

export async function POST(req: Request) {
  // Опциональная защита через секретный токен webhook
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const header = req.headers.get("x-telegram-bot-api-secret-token");
    if (header !== secret) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  const update = (await req.json().catch(() => null)) as TelegramUpdate | null;
  const msg = update?.message;
  const text = msg?.text?.trim() ?? "";
  const chat = msg?.chat;

  if (!chat || !text) return NextResponse.json({ ok: true });

  // /connect — подключить чат для получения заявок
  if (text.startsWith("/connect")) {
    // Проверка: только администратор может подключать чат
    if (ADMIN_TELEGRAM_ID && msg?.from?.id !== ADMIN_TELEGRAM_ID) {
      await sendMessage(chat.id, "⛔ У вас нет прав для выполнения этой команды.");
      return NextResponse.json({ ok: true });
    }

    try {
      await setTelegramConfig(String(chat.id), chatTitle(chat), chat.type);
      await sendMessage(
        chat.id,
        `✅ Подключено.\nТеперь заявки с сайта T Rent будут приходить сюда.\n\nChat ID: ${chat.id}`,
      );
    } catch {
      await sendMessage(chat.id, "❌ Ошибка при сохранении в базу данных. Попробуйте снова.");
    }

    return NextResponse.json({ ok: true });
  }

  // /disconnect — отключить чат
  if (text.startsWith("/disconnect")) {
    if (ADMIN_TELEGRAM_ID && msg?.from?.id !== ADMIN_TELEGRAM_ID) {
      await sendMessage(chat.id, "⛔ У вас нет прав для выполнения этой команды.");
      return NextResponse.json({ ok: true });
    }

    try {
      await clearTelegramConfig();
      await sendMessage(chat.id, "🧹 Отключено. Заявки больше не будут приходить в этот чат.");
    } catch {
      await sendMessage(chat.id, "❌ Ошибка при обновлении базы данных. Попробуйте снова.");
    }

    return NextResponse.json({ ok: true });
  }

  // /status — проверить текущее подключение
  if (text.startsWith("/status")) {
    const cfg = await getTelegramConfig();
    const connected = cfg.chatId
      ? `✅ Подключено\nChat ID: ${cfg.chatId}\nНазвание: ${cfg.chatTitle ?? "—"}\nТип: ${cfg.chatType ?? "—"}`
      : "❌ Не подключено.\nДобавьте бота в чат и отправьте /connect.";
    await sendMessage(chat.id, connected);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
