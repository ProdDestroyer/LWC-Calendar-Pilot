export const DAY_MINUTES_AMOUNT = 1440;
export const WEEK_DAYS_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const MONTHS_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const BUILD_DAY_HOURS_BLOCKS = () => {
    const dailyViewHourBlocks = [];

    const factor = 1/13;
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