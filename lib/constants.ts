import { generateDummyPassword } from './db/utils';

export const isProductionEnvironment = process.env.NODE_ENV === 'production';
export const isDevelopmentEnvironment = process.env.NODE_ENV === 'development';
export const isTestEnvironment = Boolean(
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.PLAYWRIGHT ||
    process.env.CI_PLAYWRIGHT,
);

export const guestRegex = /^guest-\d+$/;

// Model calls cost money. Chat stays blocked unless CHAT_ENABLED=true is set
// (locally in .env.local, or in Vercel env to open up production).
export const isChatEnabled = process.env.CHAT_ENABLED === 'true';

export const DUMMY_PASSWORD = generateDummyPassword();
