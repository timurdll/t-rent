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
  console.log("[telegram-webhook] Received update request");
  
  // Опциональная защита через секретный токен webhook
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const header = req.headers.get("x-telegram-bot-api-secret-token");
    if (header !== secret) {
      console.warn("[telegram-webhook] Unauthorized: secret token mismatch");
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  const update = (await req.json().catch((err) => {
    console.error("[telegram-webhook] Failed to parse JSON:", err);
    return null;
  })) as TelegramUpdate | null;

  if (!update) return NextResponse.json({ ok: false }, { status: 400 });

  const msg = update?.message;
  const text = msg?.text?.trim() ?? "";
  const chat = msg?.chat;
  const fromId = msg?.from?.id;

  console.log(`[telegram-webhook] Message from ${fromId} in chat ${chat?.id}: "${text}"`);

  if (!chat || !text) {
    console.log("[telegram-webhook] No chat or text found, skipping");
    return NextResponse.json({ ok: true });
  }

  // /connect — подключить чат для получения заявок
  if (text.startsWith("/connect")) {
    console.log(`[telegram-webhook] Handling /connect for chat ${chat.id}`);
    
    // Проверка: только администратор может подключать чат
    if (ADMIN_TELEGRAM_ID && fromId !== ADMIN_TELEGRAM_ID) {
      console.warn(`[telegram-webhook] Forbidden: user ${fromId} is not admin ${ADMIN_TELEGRAM_ID}`);
      await sendMessage(chat.id, "⛔ У вас нет прав для выполнения этой команды.");
      return NextResponse.json({ ok: true });
    }

    try {
      console.log("[telegram-webhook] Saving config to DB...");
      await setTelegramConfig(String(chat.id), chatTitle(chat), chat.type);
      console.log("[telegram-webhook] Config saved successfuly. Sending confirmation...");
      
      await sendMessage(
        chat.id,
        `✅ Подключено.\nТеперь заявки с сайта T Rent будут приходить сюда.\n\nChat ID: ${chat.id}`,
      );
    } catch (err: any) {
      console.error("[telegram-webhook] ERROR in /connect:", err);
      await sendMessage(chat.id, `❌ Ошибка при сохранении в базу данных: ${err?.message || 'Unknown error'}`);
    }

    return NextResponse.json({ ok: true });
  }

  // /disconnect — отключить чат
  if (text.startsWith("/disconnect")) {
    if (ADMIN_TELEGRAM_ID && fromId !== ADMIN_TELEGRAM_ID) {
      await sendMessage(chat.id, "⛔ У вас нет прав для выполнения этой команды.");
      return NextResponse.json({ ok: true });
    }

    try {
      await clearTelegramConfig();
      await sendMessage(chat.id, "🧹 Отключено. Заявки больше не будут приходить в этот чат.");
    } catch (err: any) {
      console.error("[telegram-webhook] ERROR in /disconnect:", err);
      await sendMessage(chat.id, "❌ Ошибка при обновлении базы данных.");
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
