import { axiosInstance } from 'helpers/axiosInstance';
import bnovoClient from './bnovoClient'
import { cacheToRedis, getCachedRedis } from 'helpers/redis';

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




