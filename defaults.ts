export module DEFAULTS {
    const URL = {
        prod: 'http://localhost:1337',
        local: 'http://192.168.1.19:1337'
    }
    export const SOCKET = {
        URL: URL.prod,
    }
    export const STRAPI = {
        url: URL.prod,
    }
}