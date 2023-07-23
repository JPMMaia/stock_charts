export interface Meta_data {
    information: string;
    symbol: string;
    last_refreshed: Date;
}

export interface Time_series_data_entry {
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    adjusted_close: number;
    volume: number;
    dividend_amount: number;
}

export interface Time_series_data {
    meta_data: Meta_data;
    entries: Time_series_data_entry[];
}
