import axios from 'axios';

import * as Server_data from "./Server_data";

enum Metric {
    Balance_sheet = "BALANCE_SHEET",
    Cash_flow = "CASH_FLOW",
    Income_statement = "INCOME_STATEMENT",
    Listing_status = "LISTING_STATUS",
    Overview = "OVERVIEW",
    Time_series_montly_adjusted = "TIME_SERIES_MONTHLY_ADJUSTED",
}

function metric_to_function_name(metric: Metric): string {
    return metric.toString();
}

function get_base_url(): string {
    return "https://www.alphavantage.co/query";
}

function create_url(function_name: string, symbol: string | undefined, api_key: string): string {
    const base_url = get_base_url();
    if (symbol !== undefined) {
        return `${base_url}?function=${function_name}&symbol=${symbol}&apikey=${api_key}`;
    }
    else {
        return `${base_url}?function=${function_name}&apikey=${api_key}`;
    }
}

async function get_data(symbol: string | undefined, metric: Metric, api_key: string, cache: Storage, force_fetch: boolean): Promise<unknown> {

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

export async function get_overview_data(symbol: string, api_key: string, cache: Storage, force_fetch: boolean): Promise<Server_data.Overview_data | undefined> {

    const raw_json = await get_data(symbol, Metric.Overview, api_key, cache, force_fetch);

    if (raw_json === undefined) {
        return Promise.resolve(undefined);
    }

    const data = transform_raw_json_to_overview_data(raw_json);
    return data;
}

export async function get_income_statement_data(symbol: string, api_key: string, cache: Storage, force_fetch: boolean): Promise<Server_data.Income_statement_data | undefined> {

    const raw_json = await get_data(symbol, Metric.Income_statement, api_key, cache, force_fetch);

    if (raw_json === undefined) {
        return Promise.resolve(undefined);
    }

    const data = transform_raw_json_to_income_statement_data(raw_json);
    return data;
}

export async function get_balance_sheet_data(symbol: string, api_key: string, cache: Storage, force_fetch: boolean): Promise<Server_data.Balance_sheet_data | undefined> {

    const raw_json = await get_data(symbol, Metric.Balance_sheet, api_key, cache, force_fetch);

    if (raw_json === undefined) {
        return Promise.resolve(undefined);
    }

    const data = transform_raw_json_to_balance_sheet_data(raw_json);
    return data;
}

export async function get_cash_flow_data(symbol: string, api_key: string, cache: Storage, force_fetch: boolean): Promise<Server_data.Cash_flow_data | undefined> {

    const raw_json = await get_data(symbol, Metric.Cash_flow, api_key, cache, force_fetch);

    if (raw_json === undefined) {
        return Promise.resolve(undefined);
    }

    const data = transform_raw_json_to_cash_flow_data(raw_json);
    return data;
}

export async function get_all_symbol_data(symbol: string, api_key: string, storage: Storage, force_fetch: boolean): Promise<Server_data.All_symbol_data> {

    const overview_promise = get_overview_data(symbol, api_key, storage, force_fetch);
    const time_series_promise = get_time_series_data(symbol, api_key, storage, force_fetch);
    const income_statement_promise = get_income_statement_data(symbol, api_key, storage, force_fetch);
    const balance_sheets_promise = get_balance_sheet_data(symbol, api_key, storage, force_fetch);
    const cash_flow_promise = get_cash_flow_data(symbol, api_key, storage, force_fetch);

    return Promise.all([overview_promise, time_series_promise, income_statement_promise, balance_sheets_promise, cash_flow_promise]).then(
        (all_data): Server_data.All_symbol_data => {

            if (all_data[0] === undefined) {
                throw new Error("Could not get overview data!");
            }

            if (all_data[1] === undefined) {
                throw new Error("Could not get time series data!");
            }

            if (all_data[2] === undefined) {
                throw new Error("Could not get income statements data!");
            }

            if (all_data[3] === undefined) {
                throw new Error("Could not get balance sheets data!");
            }

            if (all_data[4] === undefined) {
                throw new Error("Could not get cash flow data!");
            }

            return {
                overview: all_data[0],
                time_series: all_data[1],
                income_statements: all_data[2],
                balance_sheets: all_data[3],
                cash_flow: all_data[4],
            };
        }
    );
}

export async function get_listing_status_data(api_key: string, cache: Storage, force_fetch: boolean): Promise<Server_data.Listing_status_entry[] | undefined> {

    const csv = await get_data(undefined, Metric.Listing_status, api_key, cache, force_fetch);

    if (csv === undefined) {
        return Promise.resolve(undefined);
    }

    const data = transform_csv_to_listing_status_data(csv as string);
    return data;
}

function parse_date(value: string, timezone: string): Date {
    return new Date(value);
}

function parse_number(value: string): number {
    if (value === "None") {
        return 0;
    }

    return Number(value);
}

function parse_string(value: any): string {
    return value;
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

function transform_raw_json_to_overview_data(json: any): Server_data.Overview_data {

    const overview_data: Server_data.Overview_data = {
        symbol: parse_string(json["Symbol"]),
        asset_type: parse_string(json["AssetType"]),
        name: parse_string(json["Name"]),
        description: parse_string(json["Description"]),
        cik: parse_number(json["CIK"]),
        exchange: parse_string(json["Exchange"]),
        currency: parse_string(json["Currency"]),
        country: parse_string(json["Country"]),
        sector: parse_string(json["Sector"]),
        industry: parse_string(json["Industry"]),
        address: parse_string(json["Address"]),
        fiscal_year_end: parse_string(json["FiscalYearEnd"]),
        latest_quarter: parse_date(json["LatestQuarter"], ""),
        market_capitalization: parse_number(json["MarketCapitalization"]),
        ebitda: parse_number(json["EBITDA"]),
        pe_ratio: parse_number(json["PERatio"]),
        peg_ratio: parse_number(json["PEGRatio"]),
        book_value: parse_number(json["BookValue"]),
        dividend_per_share: parse_number(json["DividendPerShare"]),
        dividend_yield: parse_number(json["DividendYield"]),
        eps: parse_number(json["EPS"]),
        revenue_per_share_ttm: parse_number(json["RevenuePerShareTTM"]),
        profit_margin: parse_number(json["ProfitMargin"]),
        operating_margin_ttm: parse_number(json["OperatingMarginTTM"]),
        return_on_assets_ttm: parse_number(json["ReturnOnAssetsTTM"]),
        return_on_equity_ttm: parse_number(json["ReturnOnEquityTTM"]),
        revenue_ttm: parse_number(json["RevenueTTM"]),
        gross_profit_ttm: parse_number(json["GrossProfitTTM"]),
        diluted_epsttm: parse_number(json["DilutedEPSTTM"]),
        quarterly_earnings_growth_yoy: parse_number(json["QuarterlyEarningsGrowthYOY"]),
        quarterly_revenue_growth_yoy: parse_number(json["QuarterlyRevenueGrowthYOY"]),
        analyst_target_price: parse_number(json["AnalystTargetPrice"]),
        trailing_pe: parse_number(json["TrailingPE"]),
        forward_pe: parse_number(json["ForwardPE"]),
        price_to_sales_ratio_ttm: parse_number(json["PriceToSalesRatioTTM"]),
        price_to_book_ratio: parse_number(json["PriceToBookRatio"]),
        ev_to_revenue: parse_number(json["EVToRevenue"]),
        ev_to_ebitda: parse_number(json["EVToEBITDA"]),
        beta: parse_number(json["Beta"]),
        price_52_week_high: parse_number(json["52WeekHigh"]),
        price_52_week_low: parse_number(json["52WeekLow"]),
        price_50_day_moving_average: parse_number(json["50DayMovingAverage"]),
        price_200_day_moving_average: parse_number(json["200DayMovingAverage"]),
        shares_outstanding: parse_number(json["SharesOutstanding"]),
        dividend_date: parse_date(json["DividendDate"], ""),
        ex_dividend_date: parse_date(json["ExDividendDate"], ""),
    };

    return overview_data
}

function transform_raw_json_to_income_statement_data(json: any): Server_data.Income_statement_data {

    const symbol: string = json["symbol"];

    const annual_reports_json = json["annualReports"];

    const entries: Server_data.Income_statement_data_entry[] = [];

    for (const key in annual_reports_json) {
        const raw_entry = annual_reports_json[key];

        entries.push({
            fiscal_date_ending: parse_date(raw_entry["fiscalDateEnding"], ""),
            reported_currency: raw_entry["reportedCurrency"] as string,
            gross_profit: parse_number(raw_entry["grossProfit"]),
            total_revenue: parse_number(raw_entry["totalRevenue"]),
            cost_of_revenue: parse_number(raw_entry["costOfRevenue"]),
            costof_goods_and_services_sold: parse_number(raw_entry["costofGoodsAndServicesSold"]),
            operating_income: parse_number(raw_entry["operatingIncome"]),
            selling_general_and_administrative: parse_number(raw_entry["sellingGeneralAndAdministrative"]),
            research_and_development: parse_number(raw_entry["researchAndDevelopment"]),
            operating_expenses: parse_number(raw_entry["operatingExpenses"]),
            investment_income_net: parse_number(raw_entry["investmentIncomeNet"]),
            net_interest_income: parse_number(raw_entry["netInterestIncome"]),
            interest_income: parse_number(raw_entry["interestIncome"]),
            interest_expense: parse_number(raw_entry["interestExpense"]),
            non_interest_income: parse_number(raw_entry["nonInterestIncome"]),
            other_non_operating_income: parse_number(raw_entry["otherNonOperatingIncome"]),
            depreciation: parse_number(raw_entry["depreciation"]),
            depreciation_and_amortization: parse_number(raw_entry["depreciationAndAmortization"]),
            income_before_tax: parse_number(raw_entry["incomeBeforeTax"]),
            income_tax_expense: parse_number(raw_entry["incomeTaxExpense"]),
            interest_and_debt_expense: parse_number(raw_entry["interestAndDebtExpense"]),
            net_income_from_continuing_operations: parse_number(raw_entry["netIncomeFromContinuingOperations"]),
            comprehensive_income_net_of_tax: parse_number(raw_entry["comprehensiveIncomeNetOfTax"]),
            ebit: parse_number(raw_entry["ebit"]),
            ebitda: parse_number(raw_entry["ebitda"]),
            net_income: parse_number(raw_entry["netIncome"]),
        });
    }

    entries.reverse();

    return {
        symbol: symbol,
        annual_reports: entries
    };
}

function transform_raw_json_to_balance_sheet_data(json: any): Server_data.Balance_sheet_data {

    const symbol: string = json["symbol"];

    const annual_reports_json = json["annualReports"];

    const entries: Server_data.Balance_sheet_data_entry[] = [];

    for (const key in annual_reports_json) {
        const raw_entry = annual_reports_json[key];

        entries.push({
            fiscal_date_ending: parse_date(raw_entry["fiscalDateEnding"], ""),
            reported_currency: raw_entry["reportedCurrency"] as string,
            total_assets: parse_number(raw_entry["totalAssets"]),
            total_current_assets: parse_number(raw_entry["totalCurrentAssets"]),
            cash_and_cash_equivalents_at_carrying_value: parse_number(raw_entry["cashAndCashEquivalentsAtCarryingValue"]),
            cash_and_short_term_investments: parse_number(raw_entry["cashAndShortTermInvestments"]),
            inventory: parse_number(raw_entry["inventory"]),
            current_net_receivables: parse_number(raw_entry["currentNetReceivables"]),
            total_non_current_assets: parse_number(raw_entry["totalNonCurrentAssets"]),
            property_plant_equipment: parse_number(raw_entry["propertyPlantEquipment"]),
            accumulated_depreciation_amortization_ppe: parse_number(raw_entry["accumulatedDepreciationAmortizationPPE"]),
            intangible_assets: parse_number(raw_entry["intangibleAssets"]),
            intangible_assets_excluding_goodwill: parse_number(raw_entry["intangibleAssetsExcludingGoodwill"]),
            goodwill: parse_number(raw_entry["goodwill"]),
            investments: parse_number(raw_entry["investments"]),
            long_term_investments: parse_number(raw_entry["longTermInvestments"]),
            short_term_investments: parse_number(raw_entry["shortTermInvestments"]),
            other_current_assets: parse_number(raw_entry["otherCurrentAssets"]),
            other_non_current_assets: parse_number(raw_entry["otherNonCurrentAssets"]),
            total_liabilities: parse_number(raw_entry["totalLiabilities"]),
            total_current_liabilities: parse_number(raw_entry["totalCurrentLiabilities"]),
            current_accounts_payable: parse_number(raw_entry["currentAccountsPayable"]),
            deferred_revenue: parse_number(raw_entry["deferredRevenue"]),
            current_debt: parse_number(raw_entry["currentDebt"]),
            short_term_debt: parse_number(raw_entry["shortTermDebt"]),
            total_non_current_liabilities: parse_number(raw_entry["totalNonCurrentLiabilities"]),
            capital_lease_obligations: parse_number(raw_entry["capitalLeaseObligations"]),
            long_term_debt: parse_number(raw_entry["longTermDebt"]),
            current_long_term_debt: parse_number(raw_entry["currentLongTermDebt"]),
            long_term_debt_noncurrent: parse_number(raw_entry["longTermDebtNoncurrent"]),
            short_long_term_debt_total: parse_number(raw_entry["shortLongTermDebtTotal"]),
            other_current_liabilities: parse_number(raw_entry["otherCurrentLiabilities"]),
            other_non_current_liabilities: parse_number(raw_entry["otherNonCurrentLiabilities"]),
            total_shareholder_equity: parse_number(raw_entry["totalShareholderEquity"]),
            treasury_stock: parse_number(raw_entry["treasuryStock"]),
            retained_earnings: parse_number(raw_entry["retainedEarnings"]),
            common_stock: parse_number(raw_entry["commonStock"]),
            common_stock_shares_outstanding: parse_number(raw_entry["commonStockSharesOutstanding"]),
        });
    }

    entries.reverse();

    return {
        symbol: symbol,
        annual_reports: entries
    };
}

function transform_raw_json_to_cash_flow_data(json: any): Server_data.Cash_flow_data {

    const symbol: string = json["symbol"];

    const annual_reports_json = json["annualReports"];

    const entries: Server_data.Cash_flow_data_entry[] = [];

    for (const key in annual_reports_json) {
        const raw_entry = annual_reports_json[key];

        entries.push({
            fiscal_date_ending: parse_date(raw_entry["fiscalDateEnding"], ""),
            reported_currency: raw_entry["reportedCurrency"] as string,
            operating_cashflow: parse_number(raw_entry["operatingCashflow"]),
            payments_for_operating_activities: parse_number(raw_entry["paymentsForOperatingActivities"]),
            proceeds_from_operating_activities: parse_number(raw_entry["proceedsFromOperatingActivities"]),
            change_in_operating_liabilities: parse_number(raw_entry["changeInOperatingLiabilities"]),
            change_in_operating_assets: parse_number(raw_entry["changeInOperatingAssets"]),
            depreciation_depletion_and_amortization: parse_number(raw_entry["depreciationDepletionAndAmortization"]),
            capital_expenditures: parse_number(raw_entry["capitalExpenditures"]),
            change_in_receivables: parse_number(raw_entry["changeInReceivables"]),
            change_in_inventory: parse_number(raw_entry["changeInInventory"]),
            profit_loss: parse_number(raw_entry["profitLoss"]),
            cashflow_from_investment: parse_number(raw_entry["cashflowFromInvestment"]),
            cashflow_from_financing: parse_number(raw_entry["cashflowFromFinancing"]),
            proceeds_from_repayments_of_short_term_debt: parse_number(raw_entry["proceedsFromRepaymentsOfShortTermDebt"]),
            payments_for_repurchase_of_common_stock: parse_number(raw_entry["paymentsForRepurchaseOfCommonStock"]),
            payments_for_repurchase_of_equity: parse_number(raw_entry["paymentsForRepurchaseOfEquity"]),
            payments_for_repurchase_of_preferred_stock: parse_number(raw_entry["paymentsForRepurchaseOfPreferredStock"]),
            dividend_payout: parse_number(raw_entry["dividendPayout"]),
            dividend_payout_common_stock: parse_number(raw_entry["dividendPayoutCommonStock"]),
            dividend_payout_preferred_stock: parse_number(raw_entry["dividendPayoutPreferredStock"]),
            proceeds_from_issuance_of_common_stock: parse_number(raw_entry["proceedsFromIssuanceOfCommonStock"]),
            proceeds_from_issuance_of_long_term_debt_and_capital_securities_net: parse_number(raw_entry["proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet"]),
            proceeds_from_issuance_of_preferred_stock: parse_number(raw_entry["proceedsFromIssuanceOfPreferredStock"]),
            proceeds_from_repurchase_of_equity: parse_number(raw_entry["proceedsFromRepurchaseOfEquity"]),
            proceeds_from_sale_of_treasury_stock: parse_number(raw_entry["proceedsFromSaleOfTreasuryStock"]),
            change_in_cash_and_cash_equivalents: parse_number(raw_entry["changeInCashAndCashEquivalents"]),
            change_in_exchange_rate: parse_number(raw_entry["changeInExchangeRate"]),
            net_income: parse_number(raw_entry["netIncome"]),
        });
    }

    entries.reverse();

    return {
        symbol: symbol,
        annual_reports: entries
    };
}

function transform_csv_to_listing_status_data(csv: string): Server_data.Listing_status_entry[] {

    const entries: Server_data.Listing_status_entry[] = [];

    const lines = csv.split("\r\n");

    for (let index = 1; index < lines.length; ++index) {
        const line = lines[index];

        const values = line.split(",");

        entries.push({
            symbol: parse_string(values[0]),
            name: parse_string(values[1]),
            exchange: parse_string(values[2]),
            asset_type: parse_string(values[3]),
            ipo_date: parse_date(values[4], ""),
            delisting_date: values[5] === "null" ? null : parse_date(values[5], ""),
            status: parse_string(values[6]),
        });
    }

    return entries;
}
