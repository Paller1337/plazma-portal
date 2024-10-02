import Redis, { RedisOptions } from 'ioredis'
import { Logger } from './logger'

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
}


export class CacheManager {
    private redis?: Redis;
    private logger: Logger;

    constructor(redisConfig?: RedisOptions, logger?: Logger) {
        this.logger = logger || new Logger();

        if (redisConfig) {
            this.redis = new Redis(redisConfig);
            this.logger.info('[Cache Manager] Redis клиент инициализирован');
        } else {
            this.logger.warn('[Cache Manager] Redis конфигурация не указана. Кэш использоваться не будет.');
        }
    }

    /** Get value from cache */
    public async get(key: string): Promise<string | null> {
        if (this.redis) {
            try {
                const value = await this.redis.get(key);
                if (value) {
                    this.logger.info(`[Cache Manager] Кэш содержит ключ: ${key}`);
                } else {
                    this.logger.info(`[Cache Manager] В кэше отсутствует ключ: ${key}`);
                }
                return value;
            } catch (error) {
                this.logger.error(`[Cache Manager] Ошибка получения ключа ${key} из Redis: ${getErrorMessage(error)}`);
                return null;
            }
        }
        return null;
    }

    /** Set value in cache */
    public async set(key: string, value: string, expirationSeconds?: number): Promise<void> {
        if (this.redis) {
            try {
                if (expirationSeconds) {
                    await this.redis.set(key, value, 'EX', expirationSeconds);
                } else {
                    await this.redis.set(key, value);
                }
                this.logger.info(`[Cache Manager] Значение установлено для ключа: ${key}`);
            } catch (error) {
                this.logger.error(`[Cache Manager] Ошибка установки ключа ${key} в Redis: ${getErrorMessage(error)}`);
            }
        }
    }

    /** Close Redis connection */
    public async close(): Promise<void> {
        if (this.redis) {
            await this.redis.quit();
            this.logger.info('[Cache Manager] Redis подключение закрыто');
        }
    }
}
