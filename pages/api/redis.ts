// pages/api/redis.js
import Redis from 'ioredis'

const redisOptions = {
    host: '95.163.214.158',
    port: 6379,
    password: 'PlazmaR3di$2023',
}

const redis = new Redis(redisOptions)

export default async function handler(req, res) {
    const { action, key, value, time } = req.body;

    console.log(req.body);

    try {
        let result;
        switch (action) {
            case 'get':
                result = await redis.get(key);
                break;
            case 'set':
                // Убедитесь, что time преобразовано в число, если это необходимо
                result = await redis.set(key, value, 'EX', parseInt(time, 10));
                break;
            default:
                result = false;
        }

        res.status(200).json({ result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
