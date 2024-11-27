import { DateTime, Duration } from 'luxon';
import { IStoreWorkTime } from 'pages/store/[id]';

export interface IStoreStatus {
    isOpen: boolean;
    untilClose: string;
    untilCloseShort: string;
    untilClose_min: number;
    untilOpen: any;
    untilOpenShort: any;
    untilOpen_min: any;
    start: string;
    end: string;
}
// Функция для формирования строки с правильными окончаниями и без нулевых значений
const formatDuration = (days, hours, minutes, short = false) => {
    const pluralize = (value, singular, few, many) => {
        if (value % 10 === 1 && value % 100 !== 11) return singular;
        if (value % 10 >= 2 && value % 10 <= 4 && (value % 100 < 10 || value % 100 >= 20)) return few;
        return many;
    };

    const parts = [];

    if (days) {
        parts.push(short ? `${days} д.` : `${days} ${pluralize(days, 'день', 'дня', 'дней')}`);
    }
    if (hours) {
        parts.push(short ? `${hours} ч.` : `${hours} ${pluralize(hours, 'час', 'часа', 'часов')}`);
    }
    if (minutes) {
        parts.push(short ? `${minutes} мин.` : `${minutes} ${pluralize(minutes, 'минута', 'минуты', 'минут')}`);
    }

    return parts.join(' ');
};


export const getStoreStatus = (storeWorktime: IStoreWorkTime[]): IStoreStatus => {
    const now = DateTime.local();
    const todayLocaly = now.setLocale('en').toFormat('ccc').toLowerCase();

    // Если расписания нет, магазин открыт всегда
    if (!storeWorktime || storeWorktime.length === 0) {
        return {
            isOpen: true,
            untilClose: null,
            untilCloseShort: null,
            untilClose_min: null,
            untilOpen: null,
            untilOpenShort: null,
            untilOpen_min: null,
            start: null,
            end: null,
        };
    }

    // Ищем расписание на текущий день
    const todayWorktime = storeWorktime.find(p => p.weekday.day === todayLocaly);

    if (todayWorktime) {
        const start = now.set({ hour: parseInt(todayWorktime.start.split(':')[0]), minute: parseInt(todayWorktime.start.split(':')[1]), second: 0 });
        const end = now.set({ hour: parseInt(todayWorktime.end.split(':')[0]), minute: parseInt(todayWorktime.end.split(':')[1]), second: 0 });

        if (now >= start && now <= end) {
            // Магазин открыт
            const untilClose = end.diff(now, ['days', 'hours', 'minutes']).toObject();
            return {
                isOpen: true,
                untilClose: formatDuration(0, Math.floor(untilClose.hours), Math.floor(untilClose.minutes), false),
                untilCloseShort: formatDuration(0, Math.floor(untilClose.hours), Math.floor(untilClose.minutes), true),
                untilClose_min: Math.floor(untilClose.hours * 60 + untilClose.minutes),
                untilOpen: null,
                untilOpenShort: null,
                untilOpen_min: null,
                start: todayWorktime.start.slice(0, 5),
                end: todayWorktime.end.slice(0, 5),
            };
        } else if (now < start) {
            // Магазин еще не открылся
            const untilOpen = start.diff(now, ['days', 'hours', 'minutes']).toObject();
            return {
                isOpen: false,
                untilClose: null,
                untilCloseShort: null,
                untilClose_min: null,
                untilOpen: formatDuration(0, Math.floor(untilOpen.hours), Math.floor(untilOpen.minutes), false),
                untilOpenShort: formatDuration(0, Math.floor(untilOpen.hours), Math.floor(untilOpen.minutes), true),
                untilOpen_min: Math.floor(untilOpen.hours * 60 + untilOpen.minutes),
                start: todayWorktime.start.slice(0, 5),
                end: todayWorktime.end.slice(0, 5),
            };
        }
    }

    // Если сегодня магазин не работает, ищем следующий рабочий день
    const dayOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const sortedWorktime = storeWorktime.sort((a, b) =>
        dayOrder.indexOf(a.weekday.day) - dayOrder.indexOf(b.weekday.day)
    );

    const todayIndex = dayOrder.indexOf(todayLocaly);

    let nextWorkday = null;
    let daysUntilNextWorkday = 0;

    for (let i = 1; i <= 7; i++) {
        const nextIndex = (todayIndex + i) % 7;
        const nextDay = sortedWorktime.find(p => dayOrder.indexOf(p.weekday.day) === nextIndex);
        if (nextDay) {
            nextWorkday = nextDay;
            daysUntilNextWorkday = i;
            break;
        }
    }

    if (nextWorkday) {
        const nextStart = now
            .plus({ days: daysUntilNextWorkday })
            .set({ hour: nextWorkday.start.split(':')[0], minute: nextWorkday.start.split(':')[1], second: 0 });
        const untilOpen = nextStart.diff(now, ['days', 'hours', 'minutes']).toObject();

        return {
            isOpen: false,
            untilClose: null,
            untilCloseShort: null,
            untilClose_min: null,
            untilOpen: formatDuration(untilOpen.days, Math.floor(untilOpen.hours), Math.floor(untilOpen.minutes), false),
            untilOpenShort: formatDuration(untilOpen.days, Math.floor(untilOpen.hours), Math.floor(untilOpen.minutes), true),
            untilOpen_min: Math.floor((untilOpen.days * 24 + untilOpen.hours) * 60 + untilOpen.minutes),
            start: nextWorkday.start.slice(0, 5),
            end: nextWorkday.end.slice(0, 5),
        };
    }

    // Если никакой рабочий день не найден
    return {
        isOpen: false,
        untilClose: null,
        untilCloseShort: null,
        untilClose_min: null,
        untilOpen: null,
        untilOpenShort: null,
        untilOpen_min: null,
        start: null,
        end: null,
    };
};