import * as Chart_data from "./Chart_data";
import * as Server_data from "./Server_data";

export function group_time_series_by_year(source_entries: Server_data.Time_series_data_entry[]): Chart_data.Chart_data {

    const labels: string[] = [];
    const values: number[][] = [];
    const high_values: number[] = [];
    const low_values: number[] = [];
    const volume_values: number[] = [];

    for (const entry of source_entries) {
        const year = entry.date.getUTCFullYear();

        const year_label = year.toString();
        if (labels.length === 0 || labels[labels.length - 1] !== year_label) {
            labels.push(year_label);
            values.push([entry.low, entry.high]);
            high_values.push(entry.high);
            low_values.push(entry.low);
            volume_values.push(entry.volume);
        }
        else {
            values.push([entry.low, entry.high]);
            values[values.length - 1] = [Math.min(values[values.length - 1][0], entry.low), Math.max(values[values.length - 1][1], entry.high)];
            high_values[high_values.length - 1] = Math.max(entry.high, high_values[high_values.length - 1]);
            low_values[low_values.length - 1] = Math.min(entry.low, low_values[low_values.length - 1]);
            volume_values[volume_values.length - 1] += entry.volume;
        }
    }

    return {
        labels: labels,
        datasets: [
            { label: "Price", data: values },
            { label: "High", data: high_values },
            { label: "Low", data: low_values },
            { label: "Volume", data: volume_values },
        ]
    };
}

export function get_dividends(source_entries: Server_data.Time_series_data_entry[]): Chart_data.Chart_data {

    const labels: string[] = [];
    const dividends: number[] = [];

    for (const entry of source_entries) {
        if (entry.dividend_amount > 0.0) {
            labels.push(entry.date.toISOString().substring(0, 10));
            dividends.push(entry.dividend_amount);
        }
    }

    return {
        labels: labels,
        datasets: [
            { label: "Dividends", data: dividends }
        ]
    };
}
