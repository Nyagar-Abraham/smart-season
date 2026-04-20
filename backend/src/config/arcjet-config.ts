import arcjet, { shield, detectBot, slidingWindow } from '@arcjet/node';
import dotenv from 'dotenv';

dotenv.config();

const ARCJET_KEY = process.env.ARCJET_KEY;

if (!ARCJET_KEY) {
  throw new Error('ARCJET_KEY environment variable is required');
}

export const aj = arcjet({
  key: ARCJET_KEY,
  rules: [
    shield({ mode: 'LIVE' }),
    detectBot({
      mode: 'LIVE',
      allow: [
        'CATEGORY:SEARCH_ENGINE',
      ],
    }),
    slidingWindow({
      mode: 'LIVE',
      interval: '60s',
      max: 30,
    }),
  ],
});
