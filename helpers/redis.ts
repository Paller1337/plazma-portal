import { axiosInstance } from './axiosInstance';

// Функция для получения SID из Redis
export async function getCachedRedis(key) {
    try {
        const result = await axiosInstance.post('/api/redis', {
            action: 'get',
            key: key
        });

        console.log('Received cache: ', result.data.result ? result.data.result.substring(0, 150) : 'No data', ' | in key:', key);
        return result.data.result;
    } catch (err) {
        console.error('Ошибка получения из Redis:', err);
        throw err; // Проброс ошибки для обработки на более высоком уровне
    }
}


// Функция для кэширования SID в Redis
export async function cacheToRedis(key, value, time) {
    try {
        const result = await axiosInstance.post('/api/redis', {
            action: 'set',
            key: key,
            value: value,
            time: time
        })
        console.log(key, ' кэширован в Redis:', result.data.result, ' \nВремя действия: ', time, ' секунд');

    } catch (err) {
        console.error('Ошибка кэширования ', key, ' в Redis:', err);
        throw err;
    }
}

// Функция для получения всех ключей из Redis
export async function getAllCachedKeys() {
    try {
        const result = await axiosInstance.post('/api/redis', {
            action: 'get-all-keys'
        });

        console.log('Получены ключи из Redis:', result.data.result);
        return result.data.result;
    } catch (err) {
        console.error('Ошибка получения ключей из Redis:', err);
        throw err;
    }
}

// Функция для удаления определённых ключей из Redis
export async function deleteCachedKeys(keys) {
    try {
        const result = await axiosInstance.post('/api/redis', {
            action: 'del-keys',
            keys: keys
        });

        console.log('Удалены ключи из Redis:', keys);
        return result.data.result;
    } catch (err) {
        console.error('Ошибка удаления ключей из Redis:', err);
        throw err;
    }
}



// Функция для удаления ключей из Redis по паттерну
export async function deleteCachedKeysByPattern(pattern) {
    try {
        const result = await axiosInstance.post('/api/redis', {
            action: 'del-pattern',
            pattern: pattern
        });

        console.log('Удалены ключи из Redis, pattern:', pattern);
        return result.data.result;
    } catch (err) {
        console.error('Ошибка удаления ключей из Redis:', err);
        throw err;
    }
}

