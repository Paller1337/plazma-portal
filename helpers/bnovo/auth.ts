// helpers/bnovoAuth.ts
import bnovoClient from './bnovoClient'

export async function bnovoAuth() {
  const userObj = {
    username: '659ba7a3246dd+2368@customapp.bnovo.ru',
    password: 'aa1940f55eb35867',
  };

  try {
    await bnovoClient.post('https://online.bnovo.ru/', userObj, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

  } catch (error) {
    console.error('Ошибка аутентификации Bnovo:', error);
    throw error;
  }
}