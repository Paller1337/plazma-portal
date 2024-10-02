import { get } from 'lodash'
import { DateTime } from 'luxon'

export const validateBanquet = (query, createState) => {
    // console.log('query: ' + query)
    let message
    const value = get(createState, query)
    switch (query) {
        case 'banquetData.estimatedStartTime':
            console.log('date input: ' + DateTime.fromSQL(value as string)?.toJSDate())
            console.log('date now: ' + DateTime.now().toJSDate())
            console.log('date bool: ', (DateTime.fromSQL(value as string)?.toJSDate() <= DateTime.now().toJSDate()))
            message = DateTime.fromSQL(value as string)?.toJSDate() <= DateTime.now().toJSDate() ? 'Дата не может быть раньше текущей' : ''
            break

        case 'banquetData.durationInMinutes':
            message =
                parseInt((value as string)?.toString()) < 30
                    ? 'Длительность банкета должна быть больше 30 минут'
                    : parseInt((value as string)?.toString()) > 1440
                        ? 'Длительность банкета должна быть не более 24 часов'
                        : isNaN(parseInt((value as string))) ? 'Укажите длительность банкета' : ''
            break

        case 'banquetData.guests.count':
            message = parseInt((value as string)?.toString()) < 1
                ? 'Минимум должен быть хотя бы 1 человек'
                : parseInt((value as string)?.toString()) > 99
                    ? 'Максимальное число гостей 99'
                    : ''
            break

        case 'banquetData.customer.name':
            message = (value as string)?.toString().length > 60
                ? 'Максимальная длина 60 символов'
                : (value as string)?.toString().length < 2
                    ? 'Необходимо ввести имя заказчика'
                    : ''
            break

        case 'banquetData.phone':
            message = (value as string)?.toString().length > 12
                ? 'Неверный формат номера'
                : (value as string)?.toString().length < 12
                    ? 'Телефон должен быть формата +7 (000) 000-00-00'
                    : ''
            break


        default:
            message = ''
            break;
    }

    return message
}