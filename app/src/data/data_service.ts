import axios from 'axios';

import * as Server_data from "./Server_data";

enum Metric {
    Time_series_montly_adjusted
}

function metric_to_function_name(metric: Metric): string {
    switch (metric) {
        case Metric.Time_series_montly_adjusted:
            return "TIME_SERIES_MONTHLY_ADJUSTED";
        default:
            throw Error("Invalid metric!");
    }
}

function get_base_url(): string {
    return "https://www.alphavantage.co/query";
}

function create_url(function_name: string, symbol: string, api_key: string): string {
    const base_url = get_base_url();
    return `${base_url}?function=${function_name}&symbol=${symbol}&apikey=${api_key}`;
}



async function get_data(symbol: string, metric: Metric, api_key: string, cache: Storage, force_fetch: boolean): Promise<unknown> {

    const function_name = metric_to_function_name(metric);
    const url = create_url(function_name, symbol, api_key);

    if (!force_fetch) {
        const cached_item = cache.getItem(url);

        if (cached_item !== null) {
            return JSON.parse(cached_item);
        }
    }

    try {

        const options = {
            method: 'GET',
            url: get_base_url(),
            params: { function: function_name, symbol: symbol, apikey: api_key },
            headers: {}
        };

        const response = await axios.request(options);

        if (response.status === 200) {
            const item_to_cache = JSON.stringify(response.data);
            cache.setItem(url, item_to_cache);

            return Promise.resolve(response.data);
        }

        return Promise.resolve(undefined);
    }
    catch (error) {
        console.error('Error fetching data:', error);
        return Promise.resolve(undefined);
    }
}

export async function get_time_series_data(symbol: string, api_key: string, cache: Storage, force_fetch: boolean): Promise<Server_data.Time_series_data | undefined> {

    const raw_json = await get_data(symbol, Metric.Time_series_montly_adjusted, api_key, cache, force_fetch);

    if (raw_json === undefined) {
        return Promise.resolve(undefined);
    }

    const data = transform_raw_json_to_time_series_data(raw_json);
    return data;
}

function parse_date(value: string, timezone: string): Date {
    return new Date(value);
}

function transform_raw_json_to_time_series_data(json: any): Server_data.Time_series_data {

    const meta_data_json = json["Meta Data"];

    const meta_data: Server_data.Meta_data = {
        information: meta_data_json["1. Information"],
        symbol: meta_data_json["2. Symbol"],
        last_refreshed: parse_date(meta_data_json["3. Last Refreshed"], meta_data_json["4. Time Zone"])
    };

    const raw_entries = json["Monthly Adjusted Time Series"];

    const entries: Server_data.Time_series_data_entry[] = [];

    for (const key in raw_entries) {
        const raw_entry = raw_entries[key];

        entries.push({
            date: parse_date(key, ""),
            open: Number(raw_entry["1. open"]),
            high: Number(raw_entry["2. high"]),
            low: Number(raw_entry["3. low"]),
            close: Number(raw_entry["4. close"]),
            adjusted_close: Number(raw_entry["5. adjusted close"]),
            volume: Number(raw_entry["6. volume"]),
            dividend_amount: Number(raw_entry["7. dividend amount"]),
        });
    }

    entries.reverse();

    return {
        meta_data: meta_data,
        entries: entries
    };
}