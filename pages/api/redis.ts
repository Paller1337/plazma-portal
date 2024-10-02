// pages/api/redis.js
import Redis from 'ioredis'

const redisOptions = {
    host: '95.163.214.158',
    port: 6379,
    password: 'PlazmaR3di$2023',
}

const redis = new Redis(redisOptions)

// Функция для удаления ключей по паттерну
async function deleteKeysByPattern(pattern) {
    redis.keys(pattern).then(function (keys) {
        var pipeline = redis.pipeline();
        keys.forEach(function (key) {
            pipeline.del(key);
        })
        return pipeline.exec();
    });
}

// Функция для получения всех ключей
async function getAllKeys() {
    let cursor = '0';
    let allKeys = [];
    do {
        const [newCursor, keys] = await redis.scan(cursor, 'COUNT', 100);
        cursor = newCursor;
        allKeys = allKeys.concat(keys);
    } while (cursor !== '0');
    return allKeys;
}

// Функция для удаления определённых ключей
async function deleteKeys(keys) {
    if (Array.isArray(keys)) {
        // Если передан массив ключей
        await redis.del(...keys);
    } else if (typeof keys === 'string') {
        // Если передана строка (один ключ)
        await redis.del(keys);
    }
}

export default async function handler(req, res) {
    const { action, key, value, time, pattern, keys } = req.body;

    console.log(req.body);

    try {
        let result;
        switch (action) {
            case 'get':
                result = await redis.get(key);
                break;
            case 'set':
                result = await redis.set(key, value, 'EX', parseInt(time, 10));
                break;
            case 'del-pattern':
                result = await deleteKeysByPattern(pattern);
                break;
            case 'get-all-keys':
                result = await getAllKeys();
                break;
            case 'del-keys':
                // Ожидаем, что 'keys' будет массивом ключей или строкой
                result = await deleteKeys(keys);
                break;
            default:
                result = false;
        }

        res.status(200).json({ result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}