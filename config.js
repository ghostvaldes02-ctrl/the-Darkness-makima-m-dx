 // config.js
import { getCreds } from './credits.js'

const creds = await getCreds()

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
export const REDIRECT_BOT = process.env.REDIRECT_BOT || "";
export const OWNER_ID = process.env.OWNER_ID || "6888309241";
export const LIMIT = process.env.LIMIT ? parseInt(process.env.LIMIT) : 30;
export const MODE = process.env.MODE || "Default";
export const PUB = process.env.PUB === 'true';
export const OWNER_NAME = creds.dev_name;
export const OWNER_NUM = process.env.OWNER_NUM || "237655374632";
export const OWNER_TELEGRAM = creds.telegram_id;
export const BOT_NAME = creds.bot_name;
export const TELEGRAM_CHANNEL = creds.telegram_channel;
export const TELEGRAM_GROUP = creds.telegram_group;
export const GROUP_INVITE_CODE = process.env.GROUP_INVITE_CODE || 'DmVYp2R9zll1j1WHWVQMC4';
export const WA_CHANNEL = process.env.WA_CHANNEL || "https://whatsapp.com/channel/0029VbBUNQO7NoZyYyKOK10m";
export const NEWSLETTER_JID = process.env.NEWSLETTER_JID || "120363407096919821@newsletter";
export const WEATHER_API_KEY = process.env.WEATHER_API_KEY || '';
export const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
export const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'pinterest-scraper5.p.rapidapi.com';
export const RAPIDAPI_PINTEREST_KEY = process.env.RAPIDAPI_PINTEREST_KEY || '';
export const RAPIDAPI_PINTEREST_HOST = process.env.RAPIDAPI_PINTEREST_HOST || 'pinterest-video-and-image-downloader.p.rapidapi.com';
export const PINTEREST_ACCESS_TOKEN = process.env.PINTEREST_ACCESS_TOKEN || '';