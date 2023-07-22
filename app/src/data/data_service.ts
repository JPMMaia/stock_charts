import axios from 'axios';

export enum Metric {
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

export async function get_data(symbol: string, metric: Metric, api_key: string, cache: Storage, force_fetch: boolean): Promise<unknown> {

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

        return Promise.resolve([]);
    }
    catch (error) {
        console.error('Error fetching data:', error);
        return Promise.resolve([]);
    }
}