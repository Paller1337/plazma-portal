import { RedisOptions } from 'ioredis'

export interface Config {
  apiKey: string;
  baseURL?: string;
  redis?: RedisOptions;
  loggingLevel?: 'error' | 'warn' | 'info' | 'debug';
  retryOptions?: {
    maxAttempts?: number;
    initialDelayMs?: number;
  };
  cachePrefix?: string
}

export const defaultConfig: Config = {
  apiKey: '',
  baseURL: 'https://api-ru.iiko.services',
  loggingLevel: 'info',
  retryOptions: {
    maxAttempts: 5,
    initialDelayMs: 100,
  },
  cachePrefix: 'iiko:cache:'
};
