import { axiosInstance } from 'helpers/axiosInstance';
import bnovoClient from './bnovoClient'

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

export async function bnovoAuth() {
  const cachedSID = await getCachedRedis('bnovoSID')

  if (cachedSID) {
    bnovoClient.defaults.headers.Cookie = `SID=${cachedSID}`; // Используйте кэшированный SID
    console.log('Received SID: ', cachedSID)
    return
  }

  const userObj = {
    username: '659ba7a3246dd+2368@customapp.bnovo.ru',
    password: 'aa1940f55eb35867',
  };

  try {
    const response = await bnovoClient.post('https://online.bnovo.ru/', userObj, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const setCookieHeader = response.headers['set-cookie']
    const sidMatch = setCookieHeader && setCookieHeader[0].match(/SID=([^;]+)/)
    if (sidMatch && sidMatch[1]) {
      const newSID = sidMatch[1]
      console.log('New SID: ', newSID)
      await cacheToRedis('bnovoSID', newSID, 3300) // Кэшируем новый SID
    }

  } catch (error) {
    console.error('Ошибка аутентификации Bnovo:', error)
    throw error
  }
}




