import { NextResponse } from "next/server";
import { readAppData, writeAppData } from "@/src/server/appData";

export const runtime = "nodejs";

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
  // Optional security: set this secret in Vercel and when calling setWebhook(secret_token=...)
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

  if (text.startsWith("/connect")) {
    const data = await readAppData();
    const next = {
      ...data,
      config: {
        ...data.config,
        telegramChatId: String(chat.id),
        telegramChatTitle: chatTitle(chat),
        telegramChatType: chat.type ?? undefined,
      },
    };
    await writeAppData(next);

    await sendMessage(
      chat.id,
      `✅ Подключено.\nТеперь заявки с сайта T Rent будут приходить сюда.\n\nChat ID: ${chat.id}`
    );
    return NextResponse.json({ ok: true });
  }

  if (text.startsWith("/disconnect")) {
    const data = await readAppData();
    const next = {
      ...data,
      config: {
        ...data.config,
        telegramChatId: undefined,
        telegramChatTitle: undefined,
        telegramChatType: undefined,
      },
    };
    await writeAppData(next);

    await sendMessage(chat.id, "🧹 Отключено. Заявки больше не будут приходить в этот чат.");
    return NextResponse.json({ ok: true });
  }

  if (text.startsWith("/status")) {
    const data = await readAppData();
    const cfg = data.config;
    const connected = cfg.telegramChatId
      ? `✅ Подключено\nChat ID: ${cfg.telegramChatId}\nНазвание: ${cfg.telegramChatTitle ?? "—"}\nТип: ${cfg.telegramChatType ?? "—"}`
      : "❌ Не подключено.\nДобавьте бота в чат и отправьте /connect.";
    await sendMessage(chat.id, connected);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}

