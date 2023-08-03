import * as Chart_data from "./Chart_data";
import * as Server_data from "./Server_data";

export function create_price_chart(source_entries: Server_data.Time_series_data_entry[]): Chart_data.Chart_data {

    const values: [number, number][] = [];

    for (const entry of source_entries) {
        values.push([entry.date.getTime(), entry.open]);
    }

    return {
        labels: [],
        datasets: [
            { label: "Price", data: values, fill: "origin" },
        ]
    };
}

export function create_dividend_chart(source_entries: Server_data.Time_series_data_entry[]): Chart_data.Chart_data {

    const labels: string[] = [];
    const dividends: number[] = [];

    for (const entry of source_entries) {
        if (entry.dividend_amount > 0.0) {
            labels.push(entry.date.toISOString());
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
