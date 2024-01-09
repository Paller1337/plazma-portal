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

    // SID теперь сохранен в cookieJar
  } catch (error) {
    console.error('Ошибка аутентификации Bnovo:', error);
    throw error;
  }
}




// // utils/bnovoAuth.ts
// import { CookieJar } from 'tough-cookie'
// import fetchCookie from 'fetch-cookie'

// const bnovoLoginUrl = 'https://online.bnovo.ru/'; // Замените на актуальный URL для авторизации

// let cachedSID = null;
// let lastSIDTime = 0;


// export default async function bnovoAuth(username: string, password: string): Promise<string> {
//     const cookieJar = new CookieJar();
//     const fetchWithCookies = fetchCookie(fetch, cookieJar);

//     try {
//         // Отправка запроса на авторизацию
//         const response = await fetchWithCookies(bnovoLoginUrl, {
//             method: 'POST',
//             redirect: 'manual', // не следовать редиректу автоматически
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded',
//             },
//             body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
//         });

//         console.log(response)
//         // Обработка редиректа и сохранение SID в куках
//         if (response.status === 302) {
//             const location = response.headers.get('location');
//             const cookies = cookieJar.getCookieStringSync(bnovoLoginUrl);

//             // Здесь можно выполнить редирект, если это необходимо
//             // Повторный запрос к location с сохраненными куками

//             return cookies; // SID сохранен в cookies
//         }

//         throw new Error('Авторизация не удалась');
//     } catch (error) {
//         console.error('Ошибка при авторизации в Bnovo:', error);
//         throw error;
//     }
// }


// export async function performBnovoTasks() {
//     try {
//         const sid = await bnovoAuth('659ba7a3246dd+2368@customapp.bnovo.ru', 'aa1940f55eb35867');
//         console.log('SID получен:', sid);

//         return sid
//         // Здесь можно использовать SID для выполнения других запросов к API Bnovo
//     } catch (error) {
//         console.error('Ошибка при выполнении задач Bnovo:', error);
//     }
// }

// export async function getBnovoSID(): Promise<string> {
//     const now = Date.now();

//     // Проверяем, не истек ли тайм-аут обновления SID (55 минут)
//     if (cachedSID && (now - lastSIDTime) < 55 * 60 * 1000) {
//         return cachedSID;
//     }

//     // Получение нового SID
//     cachedSID = await performBnovoTasks();
//     lastSIDTime = now;

//     return cachedSID;
// }
