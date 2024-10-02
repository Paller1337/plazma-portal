export module DEFAULTS {
    export const SOCKET_URL = {
        prod: 'https://strapi.kplazma.ru',
        // local: 'http://192.168.1.19:1337'
        local: 'https://strapi-plazma.ru.tuna.am'
    }

    export const STRAPI_URL = {
        prod: 'https://strapi.kplazma.ru',
        local: 'https://strapi-plazma.ru.tuna.am'
        // local: 'http://192.168.1.19:1337'
    }

    export const PORTAL = {
        url: {
            // prod: 'https://portal.kplazma.ru',
            prod: 'https://portal-plazma.ru.tuna.am',
            // dev: 'http://localhost:4000',
            dev: 'https://portal-plazma.ru.tuna.am',
        }
    }

    export const MAIN_URL = PORTAL.url.dev

    export const SOCKET = {
        URL: SOCKET_URL.local,
    }
    export const STRAPI = {
        url: STRAPI_URL.local,
    }

    export const IIKO = {
        login: '9feaa89d-33b',
        organizations: {
            smash: '55535df8-0c9c-4976-a82f-6d3150afaf03'
        }
    }

    export const PHONE_NUMBERS = {
        reception: '+79101681761',
        restaurant: '+79202756312',
    }
}