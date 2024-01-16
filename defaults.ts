export module DEFAULTS {
    const URL = {
        prod: 'https://strapi.kplazma.ru',
        local: 'http://192.168.1.19:1337'
    }
    export const SOCKET = {
        URL: URL.prod,
    }
    export const STRAPI = {
        url: URL.prod,
    }
}