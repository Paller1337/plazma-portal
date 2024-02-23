export module DEFAULTS {
    export const SOCKET_URL = {
        prod: 'https://strapi.kplazma.ru',
        local: 'http://192.168.1.19:1337'
    }

    export const STRAPI_URL = {
        prod: 'https://strapi.kplazma.ru',
        local: 'http://192.168.1.19:1337'
    } 
    
    export const PORTAL = {
        url: {
            prod: 'https://portal.kplazma.ru',
            dev: 'http://192.168.1.19:4000',
        }
    }

    export const SOCKET = {
        URL: SOCKET_URL.local,
    }
    export const STRAPI = {
        url: STRAPI_URL.local,
    }
}