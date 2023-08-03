export function now(): Date {
    const date = new Date();
    return date;
}

export function days_ago(days: number): Date {
    const date = new Date();
    date.setMonth(date.getDay() - days);
    return date;
}

export function months_ago(months: number): Date {
    const date = new Date();
    date.setMonth(date.getMonth() - months);
    return date;
}

export function years_ago(years: number): Date {
    const date = new Date();
    date.setFullYear(date.getFullYear() - years);
    return date;
}

export function format_date_to_yyyy_mm_dd(date: Date): string {
    return date.toISOString();
}