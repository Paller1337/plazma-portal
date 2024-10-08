export namespace DEFAULTS {
    export const SERVER_URL = {
        prod: 'https://strapi.kplazma.ru',
        dev: 'https://strapi-plazma.ru.tuna.am',
    }

    export const APP_URL = {
        prod: 'https://portal.kplazma.ru',
        dev: 'https://portal-plazma.ru.tuna.am',
    }

    //prod or dev
    export const GENERAL_URL = {
        app: APP_URL.prod,
        server: SERVER_URL.prod
    }

    export const SOCKET_URL = {
        prod: SERVER_URL.prod,
        local: SERVER_URL.dev,
    }

    export const STRAPI_URL = {
        prod: SERVER_URL.prod,
        local: SERVER_URL.dev
    }

    export const PORTAL = {
        url: {
            prod: APP_URL.prod,
            dev: APP_URL.dev,
        }
    }

    export const MAIN_URL = GENERAL_URL.app

    export const SOCKET = {
        URL: GENERAL_URL.server,
    }
    export const STRAPI = {
        url: GENERAL_URL.server,
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

    export const SOCIALS = {
        vk: 'https://vk.com/park_hotel_plazma',
        telegram: 'https://t.me/plazmadonskoy',
    }
}