export const DAY_MINUTES_AMOUNT = 1440;
export const WEEK_DAYS_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const MONTHS_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const BUILD_DAY_HOURS_BLOCKS = () => {
    const dailyViewHourBlocks = [];
    for (let i = 0; i < 24; i++) {
        const suffix = (i < 13) ? 'am' : 'pm';
        const formattedHour = (i % 12) + (12 * (Math.trunc(i / 12)));
        dailyViewHourBlocks.push({ hour: i, hourString: `${((i < 10) ? '0' : '') + formattedHour}:00${suffix}` });
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