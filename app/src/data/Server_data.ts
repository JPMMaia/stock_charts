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

export interface Overview_data {
    symbol: string;
    asset_type: string;
    name: string;
    description: string;
    cik: number;
    exchange: string;
    currency: string;
    country: string;
    sector: string;
    industry: string;
    address: string;
    fiscal_year_end: string;
    latest_quarter: Date;
    market_capitalization: number;
    ebitda: number;
    pe_ratio: number;
    peg_ratio: number;
    book_value: number;
    dividend_per_share: number;
    dividend_yield: number;
    eps: number;
    revenue_per_share_ttm: number;
    profit_margin: number;
    operating_margin_ttm: number;
    return_on_assets_ttm: number;
    return_on_equity_ttm: number;
    revenue_ttm: number;
    gross_profit_ttm: number;
    diluted_epsttm: number;
    quarterly_earnings_growth_yoy: number;
    quarterly_revenue_growth_yoy: number;
    analyst_target_price: number;
    trailing_pe: number;
    forward_pe: number;
    price_to_sales_ratio_ttm: number;
    price_to_book_ratio: number;
    ev_to_revenue: number;
    ev_to_ebitda: number;
    beta: number;
    price_52_week_high: number;
    price_52_week_low: number;
    price_50_day_moving_average: number;
    price_200_day_moving_average: number;
    shares_outstanding: number;
    dividend_date: Date;
    ex_dividend_date: Date;
}

export interface Income_statement_data_entry {
    fiscal_date_ending: Date;
    reported_currency: string;
    gross_profit: number;
    total_revenue: number;
    cost_of_revenue: number;
    costof_goods_and_services_sold: number;
    operating_income: number;
    selling_general_and_administrative: number;
    research_and_development: number;
    operating_expenses: number;
    investment_income_net: number;
    net_interest_income: number;
    interest_income: number;
    interest_expense: number;
    non_interest_income: number;
    other_non_operating_income: number;
    depreciation: number;
    depreciation_and_amortization: number;
    income_before_tax: number;
    income_tax_expense: number;
    interest_and_debt_expense: number;
    net_income_from_continuing_operations: number;
    comprehensive_income_net_of_tax: number;
    ebit: number;
    ebitda: number;
    net_income: number;
}

export interface Income_statement_data {
    symbol: string;
    annual_reports: Income_statement_data_entry[];
}

export interface Balance_sheet_data_entry {
    fiscal_date_ending: Date;
    reported_currency: string;
    total_assets: number;
    total_current_assets: number;
    cash_and_cash_equivalents_at_carrying_value: number;
    cash_and_short_term_investments: number;
    inventory: number;
    current_net_receivables: number;
    total_non_current_assets: number;
    property_plant_equipment: number;
    accumulated_depreciation_amortization_ppe: number;
    intangible_assets: number;
    intangible_assets_excluding_goodwill: number;
    goodwill: number;
    investments: number;
    long_term_investments: number;
    short_term_investments: number;
    other_current_assets: number;
    other_non_current_assets: number;
    total_liabilities: number;
    total_current_liabilities: number;
    current_accounts_payable: number;
    deferred_revenue: number;
    current_debt: number;
    short_term_debt: number;
    total_non_current_liabilities: number;
    capital_lease_obligations: number;
    long_term_debt: number;
    current_long_term_debt: number;
    long_term_debt_noncurrent: number;
    short_long_term_debt_total: number;
    other_current_liabilities: number;
    other_non_current_liabilities: number;
    total_shareholder_equity: number;
    treasury_stock: number;
    retained_earnings: number;
    common_stock: number;
    common_stock_shares_outstanding: number;
}

export interface Balance_sheet_data {
    symbol: string;
    annual_reports: Balance_sheet_data_entry[];
}

export interface Cash_flow_data_entry {
    fiscal_date_ending: Date;
    reported_currency: string;
    operating_cashflow: number,
    payments_for_operating_activities: number,
    proceeds_from_operating_activities: number,
    change_in_operating_liabilities: number,
    change_in_operating_assets: number,
    depreciation_depletion_and_amortization: number,
    capital_expenditures: number,
    change_in_receivables: number,
    change_in_inventory: number,
    profit_loss: number,
    cashflow_from_investment: number,
    cashflow_from_financing: number,
    proceeds_from_repayments_of_short_term_debt: number,
    payments_for_repurchase_of_common_stock: number,
    payments_for_repurchase_of_equity: number,
    payments_for_repurchase_of_preferred_stock: number,
    dividend_payout: number,
    dividend_payout_common_stock: number,
    dividend_payout_preferred_stock: number,
    proceeds_from_issuance_of_common_stock: number,
    proceeds_from_issuance_of_long_term_debt_and_capital_securities_net: number,
    proceeds_from_issuance_of_preferred_stock: number,
    proceeds_from_repurchase_of_equity: number,
    proceeds_from_sale_of_treasury_stock: number,
    change_in_cash_and_cash_equivalents: number,
    change_in_exchange_rate: number,
    net_income: number,
}

export interface Cash_flow_data {
    symbol: string;
    annual_reports: Cash_flow_data_entry[];
}

export interface Listing_status_entry {
    symbol: string;
    name: string;
    exchange: string;
    asset_type: string;
    ipo_date: Date;
    delisting_date: Date | null;
    status: string;
}
