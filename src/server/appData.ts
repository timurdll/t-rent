import { promises as fs } from 'node:fs';
import path from 'node:path';

export type AppConfig = {
  phone: string;
  phoneHref: string;
  whatsappPhone: string;
  whatsappText: string;
  telegramChatId?: string;
  telegramChatTitle?: string;
  telegramChatType?: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
};

export type AppData = {
  config: AppConfig;
  products: Product[];
};

const DATA_PATH = path.join(process.cwd(), 'data', 'app.json');

export async function readAppData(): Promise<AppData> {
  const raw = await fs.readFile(DATA_PATH, 'utf8');
  return JSON.parse(raw) as AppData;
}

export async function writeAppData(next: AppData): Promise<void> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(next, null, 2) + '\n', 'utf8');
}

export function newId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

