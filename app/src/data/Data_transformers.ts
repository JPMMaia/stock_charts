import * as Chart_data from "./Chart_data";
import * as Server_data from "./Server_data";

import * as simple_statistics from "simple-statistics";

function create_x_scale_options_from_dates(first_date: Date | undefined, last_date: Date | undefined, units?: string): Chart_data.Scale_options {
    return {
        axis_ID: "x",
        type: "time",
        position: "bottom",
        min: first_date !== undefined ? first_date.getTime() : undefined,
        max: last_date !== undefined ? last_date.getTime() : undefined,
        units: units
    };
}

function create_linear_regression_dataset(values: [number, number][]): Chart_data.Dataset {

    const label = "Prediction";

    if (values.length < 2) {
        return {
            label: label,
            data: [],
            type: "line"
        };
    }

    const linear_function_parameters = simple_statistics.linearRegression(values);

    const x0 = values[0][0];
    const xn = values[values.length - 1][0];

    return {
        label: label,
        data: [
            [x0, linear_function_parameters.m * x0 + linear_function_parameters.b],
            [xn, linear_function_parameters.m * xn + linear_function_parameters.b]
        ],
        type: "line"
    };
}

function zip_date_value(dates: Date[], values: number[]): [number, number][] {

    const zip: [number, number][] = [];

    for (let index = 0; index < dates.length; ++index) {
        zip.push([dates[index].getTime(), values[index]]);
    }

    return zip;
}

export function create_price_chart(source_entries: Server_data.Time_series_data_entry[], currency: string): Chart_data.Chart_data {

    const values: [number, number][] = [];

    for (const entry of source_entries) {
        values.push([entry.date.getTime(), entry.open]);
    }

    const linear_regression_dataset = create_linear_regression_dataset(values);

    return {
        labels: [],
        datasets: [
            {
                label: "Price",
                data: values,
                type: "line",
                fill: "origin",
                y_scale_options: {
                    axis_ID: "y",
                    type: "linear",
                    position: "left",
                    min: 0,
                    units: currency
                },
            },
            linear_regression_dataset
        ],
        x_scale_options: create_x_scale_options_from_dates(source_entries[0].date, source_entries[source_entries.length - 1].date)
    };
}

export function create_total_revenue_chart(source_entries: Server_data.Income_statement_data_entry[], currency: string): Chart_data.Chart_data {

    const dates: Date[] = [];
    const values: number[] = [];

    for (const entry of source_entries) {
        dates.push(new Date(entry.fiscal_date_ending.getFullYear(), 0));
        values.push(entry.total_revenue);
    }

    const linear_regression_dataset = create_linear_regression_dataset(zip_date_value(dates, values));

    return {
        labels: dates.map(date => date.toISOString()),
        datasets: [
            {
                label: "Total Revenue",
                data: values,
                type: "bar",
                y_scale_options: {
                    axis_ID: "y",
                    type: "linear",
                    position: "left",
                    min: 0,
                    units: currency
                },
            },
            linear_regression_dataset
        ],
        x_scale_options: create_x_scale_options_from_dates(dates[0], dates[dates.length - 1], "year"),
    };
}

export function create_net_income_chart(source_entries: Server_data.Income_statement_data_entry[], currency: string): Chart_data.Chart_data {

    const dates: Date[] = [];
    const values: number[] = [];

    for (const entry of source_entries) {
        dates.push(new Date(entry.fiscal_date_ending.getFullYear(), 0));
        values.push(entry.net_income);
    }

    const linear_regression_dataset = create_linear_regression_dataset(zip_date_value(dates, values));

    return {
        labels: dates.map(date => date.toISOString()),
        datasets: [
            {
                label: "Net Income",
                data: values,
                type: "bar",
                y_scale_options: {
                    axis_ID: "y",
                    type: "linear",
                    position: "left",
                    min: 0,
                    units: currency
                },
            },
            linear_regression_dataset
        ],
        x_scale_options: create_x_scale_options_from_dates(dates[0], dates[dates.length - 1], "year"),
    };
}

export function create_earnings_per_share_chart(income_statements: Server_data.Income_statement_data_entry[], balance_sheets: Server_data.Balance_sheet_data_entry[], currency: string): Chart_data.Chart_data {

    const dates: Date[] = [];
    const values: number[] = [];

    for (let index = 0; index < income_statements.length; ++index) {
        const income_statement = income_statements[index];
        const balance_sheet = balance_sheets.find(value => value.fiscal_date_ending.getTime() === income_statement.fiscal_date_ending.getTime());
        if (balance_sheet === undefined) {
            continue;
        }

        dates.push(new Date(income_statement.fiscal_date_ending.getFullYear(), 0));
        values.push(income_statement.net_income / balance_sheet.common_stock_shares_outstanding);
    }

    const linear_regression_dataset = create_linear_regression_dataset(zip_date_value(dates, values));

    return {
        labels: dates.map(date => date.toISOString()),
        datasets: [
            {
                label: "Earnings per Share (EPS)",
                data: values,
                type: "bar",
                y_scale_options: {
                    axis_ID: "y",
                    type: "linear",
                    position: "left",
                    min: 0,
                    units: currency
                },
            },
            linear_regression_dataset
        ],
        x_scale_options: create_x_scale_options_from_dates(dates[0], dates[dates.length - 1], "year"),
    };
}

export function create_profit_margin_chart(income_statements: Server_data.Income_statement_data_entry[]): Chart_data.Chart_data {

    const dates: Date[] = [];
    const values: number[] = [];

    for (const entry of income_statements) {
        dates.push(new Date(entry.fiscal_date_ending.getFullYear(), 0));
        values.push((entry.net_income / entry.total_revenue));
    }

    const linear_regression_dataset = create_linear_regression_dataset(zip_date_value(dates, values));

    return {
        labels: dates.map(date => date.toISOString()),
        datasets: [
            {
                label: "Profit Margin",
                data: values,
                type: "bar",
                y_scale_options: {
                    axis_ID: "y",
                    type: "linear",
                    position: "left",
                    min: 0,
                    units: "percentage"
                },
            },
            linear_regression_dataset
        ],
        x_scale_options: create_x_scale_options_from_dates(dates[0], dates[dates.length - 1], "year"),
    };
}

export function create_cash_flow_chart(source_entries: Server_data.Income_statement_data_entry[], currency: string): Chart_data.Chart_data {

    const dates: Date[] = [];

    return {
        labels: [],
        datasets: [],
        x_scale_options: create_x_scale_options_from_dates(dates[0], dates[dates.length - 1]),
    };
}

export function create_debt_levels_chart(source_entries: Server_data.Income_statement_data_entry[], currency: string): Chart_data.Chart_data {

    const dates: Date[] = [];

    return {
        labels: [],
        datasets: [],
        x_scale_options: create_x_scale_options_from_dates(dates[0], dates[dates.length - 1]),
    };
}

export function create_return_on_equity_chart(source_entries: Server_data.Income_statement_data_entry[], currency: string): Chart_data.Chart_data {

    const dates: Date[] = [];

    return {
        labels: [],
        datasets: [],
        x_scale_options: create_x_scale_options_from_dates(dates[0], dates[dates.length - 1]),
    };
}

export function create_dividend_chart(source_entries: Server_data.Time_series_data_entry[], currency: string): Chart_data.Chart_data {

    const dates: Date[] = [];
    const dividends: number[] = [];

    for (let index = 0; index < source_entries.length; ++index) {
        const entry = source_entries[index];
        if (entry.dividend_amount > 0.0) {
            dates.push(entry.date);
            dividends.push(entry.dividend_amount);
        }
    }

    const linear_regression_dataset = create_linear_regression_dataset(zip_date_value(dates, dividends));

    return {
        labels: dates.map(date => date.toISOString()),
        datasets: [
            {
                label: "Dividends",
                data: dividends,
                type: "bar",
                y_scale_options: {
                    axis_ID: "y",
                    type: "linear",
                    position: "left",
                    min: 0,
                    units: currency
                },
            },
            linear_regression_dataset
        ],
        x_scale_options: create_x_scale_options_from_dates(dates[0], dates[source_entries.length - 1]),
    };
}

export function create_dividend_yield_chart(source_entries: Server_data.Time_series_data_entry[]): Chart_data.Chart_data {

    const source_indices: number[] = [];
    const dates: Date[] = [];
    const total_dividend_per_year: number[] = [];

    for (let index = 0; index < source_entries.length; ++index) {
        const entry = source_entries[index];
        if (entry.dividend_amount > 0.0) {
            if (dates.length === 0 || (dates[dates.length - 1].getFullYear() !== entry.date.getFullYear())) {
                source_indices.push(index);
                dates.push(new Date(entry.date.getFullYear(), 0));
                total_dividend_per_year.push(entry.dividend_amount);
            }
            else {
                source_indices[source_indices.length - 1] = index;
                total_dividend_per_year[total_dividend_per_year.length - 1] += entry.dividend_amount;
            }
        }
    }

    const dividend_yields: number[] = [];

    for (let index = 0; index < source_indices.length; ++index) {
        const entry_index = source_indices[index];
        const entry = source_entries[entry_index];

        const total_dividend_in_year = total_dividend_per_year[index];
        dividend_yields.push(total_dividend_in_year / entry.close);
    }

    // Exclude the current year
    if (dates.length > 0) {
        const current_year = new Date().getFullYear();
        if (dates[dates.length - 1].getFullYear() === current_year) {
            source_indices.pop();
            dates.pop();
            total_dividend_per_year.pop();
        }
    }

    const linear_regression_dataset = create_linear_regression_dataset(zip_date_value(dates, dividend_yields));

    return {
        labels: dates.map(date => date.toISOString()),
        datasets: [
            {
                label: "Dividend Yield",
                data: dividend_yields,
                type: "bar",
                y_scale_options: {
                    axis_ID: "y",
                    type: "linear",
                    position: "left",
                    min: 0,
                    units: "percentage"
                },
            },
            linear_regression_dataset
        ],
        x_scale_options: create_x_scale_options_from_dates(dates[0], dates[source_entries.length - 1]),
    };
}

export function create_book_value_per_share_chart(source_entries: Server_data.Income_statement_data_entry[], currency: string): Chart_data.Chart_data {

    const dates: Date[] = [];

    return {
        labels: [],
        datasets: [],
        x_scale_options: create_x_scale_options_from_dates(dates[0], dates[dates.length - 1]),
    };
}

export function create_price_to_earnings_ratio_chart(source_entries: Server_data.Income_statement_data_entry[], currency: string): Chart_data.Chart_data {

    const dates: Date[] = [];

    return {
        labels: [],
        datasets: [],
        x_scale_options: create_x_scale_options_from_dates(dates[0], dates[dates.length - 1]),
    };
}
