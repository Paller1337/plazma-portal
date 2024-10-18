// src/IikoAPI.ts

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Config, defaultConfig } from './config';
// import * as Types from './types';
import { CacheManager } from './cacheManager';
import { Logger } from './logger';
import {
    AuthResponse, AvailableRestaurantSectionsResponse, CommandStatusResponse, DiscountType,
    MenusV2Request,
    MenuV2ByIdRequest, MenuV2ByIdResponse, NomenclatureResponse, OrganizationResponse,
    PaymentType, ReserveCreateRequest, ReserveCreateResponse, ReserveStatusByIdResponse, RestaurantSectionsWorkloadResponse, TerminalGroupsResponse
} from './types';

export class IikoAPI {
    private client: AxiosInstance;
    private apiKey: string;
    private prefix: string;
    private authToken?: string;
    private cacheManager: CacheManager;
    private logger: Logger;
    private maxAttempts: number;
    private initialDelayMs: number;

    constructor(config: Config) {
        // Initialize API key and base URL
        this.apiKey = config.apiKey || defaultConfig.apiKey
        // this.redis = config.redis || defaultConfig.redis;
        const baseURL = config.baseURL || defaultConfig.baseURL

        this.prefix = config.cachePrefix || defaultConfig.cachePrefix

        // Initialize HTTP client
        this.client = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000,
        });

        // Инициализация logger
        this.logger = new Logger(config.loggingLevel || defaultConfig.loggingLevel || 'info');

        // Инициализация cache manager
        this.cacheManager = new CacheManager(config.redis, this.logger);

        // Set retry options
        this.maxAttempts = config.retryOptions?.maxAttempts || defaultConfig.retryOptions!.maxAttempts!;
        this.initialDelayMs = config.retryOptions?.initialDelayMs || defaultConfig.retryOptions!.initialDelayMs!;
    }

    /** Авторизация */
    private async getAuthToken(): Promise<string> {
        if (this.authToken) {
            return this.authToken;
        }
        // Проверка токена в кэше
        const cachedToken = await this.cacheManager.get(`${this.prefix}---authToken`);
        if (cachedToken) {
            this.authToken = cachedToken;
            this.logger.info('[IIKO API] Токен авторизации, извлеченный из кэша');
            return cachedToken;
        }

        if (!this.apiKey) {
            this.logger.error('[IIKO API] Невозможно выполнить запрос без ключа API')
            return ''
        }
        // Получаем новый токен
        this.logger.info('[IIKO API] Запрашиваем новый токен авторизации');
        const response = await this.client.post<AuthResponse>('/api/1/access_token', {
            apiLogin: this.apiKey,
        });

        this.authToken = response.data.token;

        // Сохраняем новый токен в кэше
        await this.cacheManager.set(`${this.prefix}---authToken`, this.authToken, 3600 - 60); // Expires in 1 hour minus 60 seconds
        this.logger.info('[IIKO API] Токен авторизации сохранен в кэше');

        return this.authToken;
    }

    // Хранение последних запросов
    private requestCache: { [key: string]: number } = {};

    // Метод для проверки и обновления кеша запросов
    private shouldMakeRequest(method: 'GET' | 'POST', url: string, data?: any): boolean {
        const currentTime = Date.now();
        const cacheKey = method === 'POST' && data ? `${url}:${JSON.stringify(data)}` : url;
        const lastRequestTime = this.requestCache[cacheKey];

        // Проверка, если прошло менее 5 секунд с момента последнего запроса
        if (lastRequestTime && currentTime - lastRequestTime < 5000) {
            this.logger.info(`[IIKO API] Пропуск повторного запроса к ${cacheKey}, так как прошло меньше 5 секунд`);
            return false;
        }

        // Обновляем время последнего запроса
        this.requestCache[cacheKey] = currentTime;
        return true;
    }

    /** Утилита для отправки запросов с повторными попытками */
    private async makeRequest<T>(
        method: 'GET' | 'POST',
        url: string,
        data?: any,
        attempt: number = 1
    ): Promise<AxiosResponse<T, any>> {
        // Проверяем, можно ли отправить запрос
        // if (!this.shouldMakeRequest(method, url, data)) {
        //     throw new Error(`Запрос к ${url} был заблокирован, так как он повторяется в течение 5 секунд.`);
        // }

        // Экспоненциальная задержка возврата
        const delay = this.initialDelayMs * Math.pow(2, attempt - 1);

        const token = await this.getAuthToken();

        try {
            if (!token) {
                this.logger.error(`[IIKO API] Токен отсутствует: ${{ token }}`);
                return
            }

            this.logger.info(`[IIKO API] Получен токен: ${token}`);
            this.logger.info(`[IIKO API] Отправка запроса: ${method} ${url}, попытка ${attempt}`);
            if (this.logger) {
                this.logger.debug(`[IIKO API] Тело ответа: ${JSON.stringify(data)}`);
            }

            const response = await this.client.request<T>({
                method,
                url,
                data,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Timeout': '15',
                },
            });

            this.logger.info(`[IIKO API] Получен ответ от ${url}: ${response.status}`);
            if (this.logger) {
                this.logger.debug(`[IIKO API] Тело ответа: ${JSON.stringify(response.data)}`);
            }

            return response;
        } catch (error: any) {
            // Проверяем, можем ли мы повторить запрос
            if (attempt < this.maxAttempts && this.isRetryableError(error)) {
                this.logger.warn(
                    `[IIKO API] Ошибка при запросе к ${url}: ${error.message}. Повторная попытка через ${delay} ms. Попытка номер ${attempt + 1} из ${this.maxAttempts}`
                );
                await this.sleep(delay);
                return this.makeRequest<T>(method, url, data, attempt + 1);
            } else {
                // Обрабатываем ошибку, если достигнуто максимальное количество попыток
                this.logger.error(`[IIKO API] Ошибка при запросе к ${url}: ${error.message}`);
                if (error.response) {
                    this.logger.error(`[IIKO API] Тело ответа ошибки: ${JSON.stringify(error.response.data)}`);
                }
                throw error;
            }
        }
    }

    /** Проверяем, можно ли повторить ошибку */
    private isRetryableError(error: any): boolean {
        if (axios.isAxiosError(error)) {
            if (!error.response) {
                // Сетевые ошибки или тайм-ауты
                return true;
            }
            const status = error.response.status;
            // Повторите попытку при обнаружении временных ошибок сервера
            return status >= 500 && status < 600;
        }
        return false;
    }

    /** Функция задержки */
    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /** Валидация заказа */
    private validateOrder(create: ReserveCreateRequest): void {
        if (!create.organizationId) {
            throw new Error('[IIKO API] Отсутствует обязательное поле organizationId.');
        }
        if (!create.terminalGroupId) {
            throw new Error('[IIKO API] Отсутствует обязательное поле terminalGroupId.');
        }
        if (!create.order || create.order.items.length === 0) {
            throw new Error('[IIKO API] Необходимо указать хотя бы один элемент заказа.');
        }
        // Additional validations as needed
    }

    /** Получить организации */
    public async getOrganizations(): Promise<OrganizationResponse> {
        const cacheKey = `${this.prefix}organizations`;
        const cachedData = await this.cacheManager.get(cacheKey);
        if (cachedData) {
            this.logger.info('[IIKO API] Список организаций, получен из кэша');
            return JSON.parse(cachedData);
        }

        const { data } = await this.makeRequest<OrganizationResponse>('POST', '/api/1/organizations', {
            returnAdditionalInfo: true,
        });

        await this.cacheManager.set(cacheKey, JSON.stringify(data), 86400);
        this.logger.info('[IIKO API] Список организаций кэширован');

        return data;
    }

    /** Получить для которых доступно бронирование банкета/резервации */
    public async getReserveOrganizations(): Promise<OrganizationResponse> {
        const cacheKey = `${this.prefix}reserve:organizations`;
        const cachedData = await this.cacheManager.get(cacheKey);
        if (cachedData) {
            this.logger.info('[IIKO API] Список организаций, для которых доступно бронирование банкета/резервации полученный из кэша');
            return JSON.parse(cachedData);
        }

        const { data } = await this.makeRequest<OrganizationResponse>('POST', '/api/1/reserve/available_organizations', {
            returnAdditionalInfo: true,
        });

        await this.cacheManager.set(cacheKey, JSON.stringify(data), 86400);
        this.logger.info('[IIKO API] Список организаций, для которых доступно бронирование банкета/резервации кэширован');

        return data;
    }

    /** Получить групп терминалов */
    public async getTerminalGroups(organizationIds: string[]): Promise<TerminalGroupsResponse> {
        const cacheKey = `${this.prefix}terminal_groups`;
        const cachedData = await this.cacheManager.get(cacheKey);
        if (cachedData) {
            this.logger.info('[IIKO API] Список терминалов получен из кэша');
            return JSON.parse(cachedData);
        }

        const { data } = await this.makeRequest<TerminalGroupsResponse>(
            'POST',
            '/api/1/terminal_groups',
            { organizationIds }
        );

        await this.cacheManager.set(cacheKey, JSON.stringify(data), 86400);
        this.logger.info('[IIKO API] Список терминалов кэширован');


        return data;
    }

    /** Возвращает все группы терминалов указанных организаций, для которых доступно бронирование банкетов/резерваций. */
    public async getAvailableTerminalGroups(organizationIds: string[]): Promise<TerminalGroupsResponse> {
        const cacheKey = `${this.prefix}reserve:available_terminal_groups`;
        const cachedData = await this.cacheManager.get(cacheKey);
        if (cachedData) {
            this.logger.info('[IIKO API] Список терминалов, для которых доступно бронирование банкетов/резерваций получен из кэша');
            return JSON.parse(cachedData);
        }

        const { data } = await this.makeRequest<TerminalGroupsResponse>(
            'POST',
            '/api/1/reserve/available_terminal_groups',
            { organizationIds }
        );

        await this.cacheManager.set(cacheKey, JSON.stringify(data), 86400);
        this.logger.info('[IIKO API] Список терминалов, для которых доступно бронирование банкетов/резерваций кэширован');

        return data;
    }

    /** Возвращает все залы ресторанов указанных групп терминалов, для которых доступно бронирование банкетов/резервов. */
    public async getAvailableRestaurantSections(terminalGroupIds: string[]): Promise<AvailableRestaurantSectionsResponse> {
        let dynamicKey = terminalGroupIds.join(',');
        const cacheKey = `${this.prefix}reserve:available_restaurant_sections//` + dynamicKey;
        const cachedData = await this.cacheManager.get(cacheKey);
        if (cachedData) {
            this.logger.info('[IIKO API] Список залов ресторанов указанных групп терминалов, для которых доступно бронирование банкетов/резерваций получен из кэша');
            return JSON.parse(cachedData);
        }

        const { data } = await this.makeRequest<AvailableRestaurantSectionsResponse>(
            'POST',
            '/api/1/reserve/available_restaurant_sections',
            { terminalGroupIds }
        );

        await this.cacheManager.set(cacheKey, JSON.stringify(data), 86400);
        this.logger.info('[IIKO API] Список залов ресторанов указанных групп терминалов, для которых доступно бронирование банкетов/резерваций кэширован');

        return data;
    }


    /** Возвращает все банкеты/резервации для заданных залов ресторана. */
    public async getRestaurantSectionsWorkload(restaurantSectionIds: string[], dateFrom: string, dateTo?: string): Promise<RestaurantSectionsWorkloadResponse> {
        const cacheKey = `${this.prefix}reserve:restaurant_sections_workload`;
        const cachedData = await this.cacheManager.get(cacheKey);
        if (cachedData) {
            this.logger.info('[IIKO API] Список банкетов/резерваций для заданных залов ресторана получен из кэша');
            return JSON.parse(cachedData);
        }

        const { data } = await this.makeRequest<RestaurantSectionsWorkloadResponse>(
            'POST',
            '/api/1/reserve/restaurant_sections_workload',
            { restaurantSectionIds, dateFrom, dateTo }
        );

        await this.cacheManager.set(cacheKey, JSON.stringify(data), 600);
        this.logger.info('[IIKO API] Список банкетов/резерваций для заданных залов ресторана кэширован');

        return data;
    }

    /** Возвращает статусы банкетов/резервов по IDs. */
    public async getReserveStatusById(organizationId: string, reserveIds: string[], sourceKeys?: string): Promise<ReserveStatusByIdResponse> {
        const cacheKey = `${this.prefix}reserve_status_by_id`;
        const cachedData = await this.cacheManager.get(cacheKey);
        if (cachedData) {
            this.logger.info('[IIKO API] Информация о банкетах/резервацая для заданных IDs получен из кэша');
            return JSON.parse(cachedData);
        }

        const { data } = await this.makeRequest<ReserveStatusByIdResponse>(
            'POST',
            '/api/1/reserve/status_by_id',
            { organizationId, reserveIds, sourceKeys }
        );

        await this.cacheManager.set(cacheKey, JSON.stringify(data), 600);
        this.logger.info('[IIKO API] Информация о банкетах/резервацая для заданных IDs кэширована');

        return data;
    }

    /** Возвращает статус команды. */
    public async getCommandStatus(organizationId: string, correlationId: string): Promise<CommandStatusResponse> {
        const { data } = await this.makeRequest<CommandStatusResponse>(
            'POST',
            '/api/1/commands/status',
            { organizationId, correlationId }
        )

        return data;
    }

    /** Получить номенклатуру */
    public async getNomenclature(organizationId: string): Promise<NomenclatureResponse> {
        const cacheKey = `${this.prefix}nomenclature:${organizationId}`;
        const cachedData = await this.cacheManager.get(cacheKey);
        if (cachedData) {
            this.logger.info(`[IIKO API] Номенклатура для организации ${organizationId} получена из кэша`);
            return JSON.parse(cachedData);
        }

        const { data } = await this.makeRequest<NomenclatureResponse>('POST', '/api/1/nomenclature', { organizationId });

        await this.cacheManager.set(cacheKey, JSON.stringify(data), 86400);
        this.logger.info(`[IIKO API] Номенклатура для организации ${organizationId} кэширована`);

        return data;
    }

    /** Получить типы оплат */
    public async getPaymentTypes(organizationIds: string[]): Promise<PaymentType[]> {
        const { data } = await this.makeRequest<{ paymentTypes: PaymentType[] }>(
            'POST',
            '/api/1/payment_types',
            { organizationIds }
        );

        this.logger.info(`[IIKO API] Получены типы оплат для организаций: ${organizationIds.join(', ')}`);

        return data.paymentTypes;
    }

    /** Получить скидки */
    public async getDiscounts(organizationIds: string[]): Promise<DiscountType[]> {
        const { data } = await this.makeRequest<{ discounts: DiscountType[] }>(
            'POST',
            '/api/1/discounts',
            { organizationIds }
        );

        this.logger.info(`[IIKO API] Получены скидки для организаций: ${organizationIds.join(', ')}`);

        return data.discounts;
    }

    /** Получение списка меню (API v2) */
    public async getMenusV2(request?: MenusV2Request): Promise<MenuV2ByIdResponse> {
        // Формирование ключа кэша на основе идентификаторов организаций и параметров
        const cacheKey = `${this.prefix}menus:v2`

        // Проверка наличия данных в кэше
        const cachedData = await this.cacheManager.get(cacheKey);
        if (cachedData) {
            this.logger.info('[IIKO API] Список меню (API v2) получен из кэша');
            return JSON.parse(cachedData);
        }

        // Отправка запроса
        const { data } = await this.makeRequest<MenuV2ByIdResponse>('POST', '/api/2/menu', request);

        // Сохранение в кэше
        await this.cacheManager.set(cacheKey, JSON.stringify(data), 86400); // Кэширование на сутки
        this.logger.info('[IIKO API] Список меню (API v2) сохранен в кэше');

        return data;
    }

    /** Получение меню (API v2) */
    public async getMenuByIdV2(request: MenuV2ByIdRequest): Promise<MenuV2ByIdResponse> {
        // Валидация запроса
        if (!request.organizationIds || request.organizationIds.length === 0) {
            throw new Error('[IIKO API] Необходимо указать хотя бы один идентификатор организации.');
        }
        if (!request.externalMenuId) {
            throw new Error('[IIKO API] Необходимо указать ID внешнего меню.');
        }

        // Формирование ключа кэша на основе идентификаторов организаций и параметров
        const cacheKey = `${this.prefix}menu_by_id:v2:${request.externalMenuId}`

        // Проверка наличия данных в кэше
        const cachedData = await this.cacheManager.get(cacheKey);
        if (cachedData) {
            this.logger.info(`[IIKO API] Меню ID:${request.externalMenuId} (API v2) получено из кэша`);
            return JSON.parse(cachedData);
        }

        // Получение номенклатуры
        const n = await this.getNomenclature(request.organizationIds[0])

        // Отправка запроса
        const { data } = await this.makeRequest<MenuV2ByIdResponse>('POST', '/api/2/menu/by_id', request)

        const newMenu = {
            ...data,
            itemCategories: data.itemCategories.map(itemCategory => ({
                ...itemCategory,
                items: itemCategory.items.map(item => {
                    const unit = n.products.find(product => product.id === item.itemId)?.measureUnit || '-'
                    // console.log('measureUnit для продукта ' + item.itemId + ': ' + unit)
                    return ({
                        ...item,
                        measureUnit: unit,
                    })
                })
            }))
        }
        // console.log('Продукт: ' + newMenu.itemCategories[0].items[0].name + ' Единица измерения: ' + newMenu.itemCategories[0].items[0].measureUnit)
        // Сохранение в кэше
        await this.cacheManager.set(cacheKey, JSON.stringify(newMenu), 86400) // Кэширование на сутки
        this.logger.info(`[IIKO API] Меню ID:${request.externalMenuId} (API v2) сохранено в кэше`);

        return newMenu;
    }

    /** Получение списка меню (API v2) */
    public async createReserve(request?: ReserveCreateRequest): Promise<ReserveCreateResponse> {
        // Формирование ключа кэша на основе идентификаторов организаций и параметров
        // const cacheKey = `iiko:menus:v2`

        // Проверка наличия данных в кэше
        // const cachedData = await this.cacheManager.get(cacheKey);
        // if (cachedData) {
        //     this.logger.info('[IIKO API] Список меню (API v2) получен из кэша');
        //     return JSON.parse(cachedData);
        // }

        // Отправка запроса
        const { data } = await this.makeRequest<ReserveCreateResponse>('POST', '/api/1/reserve/create', request);

        // Сохранение в кэше
        // await this.cacheManager.set(cacheKey, JSON.stringify(data), 86400); // Кэширование на сутки
        this.logger.info(`[IIKO API] Заказ ${request.id} отправлен в работу`)

        return data
    }
}
