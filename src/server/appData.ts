import { prisma } from './prisma';

export type AppConfig = {
  phone: string;
  phoneHref: string;
  whatsappPhone: string;
  whatsappText: string;
  telegramChatId?: string;
  telegramChatTitle?: string;
  telegramChatType?: string;
};

const CONFIG_KEYS = ['PHONE', 'PHONE_HREF', 'WHATSAPP_PHONE', 'WHATSAPP_TEXT'];

export async function getAppConfig(): Promise<AppConfig> {
  const records = await prisma.systemConfig.findMany({
    where: { key: { in: CONFIG_KEYS } }
  });
  const map = Object.fromEntries(records.map(r => [r.key, r.value]));

  const cfg = {
    phone: map['PHONE'] || process.env.DEFAULT_PHONE || '+7 777 111 72 72',
    phoneHref: map['PHONE_HREF'] || process.env.DEFAULT_PHONE_HREF || 'tel:+77771117272',
    whatsappPhone: map['WHATSAPP_PHONE'] || process.env.DEFAULT_WHATSAPP_PHONE || '+7 777 111 72 72',
    whatsappText: map['WHATSAPP_TEXT'] || process.env.DEFAULT_WHATSAPP_TEXT || 'Здравствуйте!\n\nПишу с сайта T Rent.\n\n',
  };

  return cfg as AppConfig;
}

export async function setAppConfig(config: Partial<AppConfig>): Promise<void> {
  const updates: Array<Promise<any>> = [];

  const addUpsert = (key: string, value: string | undefined) => {
    if (value !== undefined) {
      updates.push(
        prisma.systemConfig.upsert({
          where: { key },
          create: { key, value },
          update: { value },
        })
      );
    }
  };

  addUpsert('PHONE', config.phone);
  addUpsert('PHONE_HREF', config.phoneHref);
  addUpsert('WHATSAPP_PHONE', config.whatsappPhone);
  addUpsert('WHATSAPP_TEXT', config.whatsappText);

  if (updates.length > 0) {
    await Promise.all(updates);
  }
}
