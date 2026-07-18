export const DAY_MINUTES_AMOUNT = 1440;
export const CALENDAR_EVENT_TYPES = [{label: 'Health', value: 'health'}, {label: 'Social', value: 'social'}, {label: 'Work', value: 'work'}];
export const WEEK_DAYS_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const MONTHS_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const BUILD_DAY_HOURS_BLOCKS = () => {
    const dailyViewHourBlocks = [];

    const factor = 1 / 13;
    for (let i = 0; i < 24; i++) {
        const suffix = (i < 12) ? 'am' : 'pm';
        const formattedHour = (i + (Math.trunc(factor * i))) % 13;
        dailyViewHourBlocks.push({ hour: i, hourString: `${((formattedHour < 10) ? '0' : '') + formattedHour}:00${suffix}` });
    }
    return dailyViewHourBlocks;
}

export const ARE_DATES_EQUAL = (firstDate, secondDate) => {
    return (firstDate.getFullYear() == secondDate.getFullYear() &&
        firstDate.getMonth() == secondDate.getMonth() &&
        firstDate.getDate() == secondDate.getDate());
}

export const PRINT_ERROR = (exceptionError) => {
    console.error(exceptionError.stack);
    console.error(exceptionError.message);
}

export const USER_TIME_TO_DATE_TIME = (userTime) => {
    const year = Number(userTime.year);
    const month = Number(userTime.month - 1);
    const day = Number(userTime.day);
    const hour = Number(userTime.hour);
    const minute = Number(userTime.minute);
    return new Date(year, month, day, hour, minute);
}

export const BUILD_TIME_DIRECTLY = (date) => {
    return {
        year: `${date.getFullYear()}`,
        month: `${date.getMonth() < 9 ? '0' : ''}${(date.getMonth() + 1)}`,
        day: `${date.getDate() < 10 ? '0' : ''}${date.getDate()}`,
        weekday: WEEK_DAYS_NAMES[date.getDay()],
        hour: `${date.getHours() < 10 ? '0' : ''}${date.getHours()}`,
        minute: `${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`,
        second: `${date.getSeconds() < 10 ? '0' : ''}${date.getSeconds()}`,
    }
}

export const BUILD_CURRENT_USER_TIME = (date, timeZone) => {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const parts = formatter.formatToParts(new Date(date));
    
    return Object.fromEntries(
        parts
            .filter(p => p.type !== 'literal')
            .map(p => [p.type, p.value])
    );
}