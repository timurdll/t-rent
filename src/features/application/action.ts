"use server";

import { getTelegramChatId } from "@/src/server/telegramConfig";

type ApplicationState = {
  success: boolean;
  message: string;
};

export async function sendApplication(prevState: ApplicationState, formData: FormData): Promise<ApplicationState> {
  try {
    const name = formData.get("name");
    const phone = formData.get("phone");
    const product = formData.get("product") || "Не указан";
    const city = formData.get("city") || "Не определен";

    // Validate inputs
    if (!name || !phone) {
      return { success: false, message: "Имя и телефон обязательны для заполнения." };
    }

    const token = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;

    // Читаем chatId из Prisma (с fallback на env)
    const chatId = await getTelegramChatId();

    if (!token || !chatId) {
      console.warn("[sendApplication] Telegram configuration is missing (token or chatId not set).");
      // Возвращаем успех, чтобы пользователь не видел ошибку конфигурации
      return { success: true, message: "Заявка успешно отправлена! Мы скоро свяжемся с вами." };
    }

    const text = `Новая заявка с сайта "T Rent"\n\n👤 Имя: ${name}\n📞 Телефон: ${phone}\n📍 Город: ${city}\n🛒 Товар: ${product}`;

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    });

    if (!res.ok) {
      throw new Error(`Telegram API error: ${res.statusText}`);
    }

    return { success: true, message: "Ваша заявка успешно отправлена! Мы скоро свяжемся с вами." };
  } catch (error: unknown) {
    console.error("Failed to send application", error);
    return { success: false, message: "Ошибка при отправке заявки. Пожалуйста, попробуйте позже." };
  }
}
