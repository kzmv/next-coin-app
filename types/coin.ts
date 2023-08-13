export interface Account {
    "uuid": string,
    "name": string,
    "currency": string,
    "available_balance": { "value": number, "currency": string },
    "default": boolean, "active": boolean,
    "created_at": Date;
    "updated_at": Date,
    "deleted_at": Date,
    "type": "ACCOUNT_TYPE_FIAT" | "ACCOUNT_TYPE_CRYPTO",
    "ready": boolean,
    "hold": { "value": string, "currency": string }
}

// export type StringNumber = `{}.{}`

export type ProductType = 'BTC' | 'SOL' | 'MATIC' | 'ETH' |
    'USDT' | 'DOGE' | 'ADA' | 'SNX' |
    'LTC' | '1INCH' | 'MASK' | 'GRT' |
    'USDC' | 'SHIB' | 'ALGO' | 'ANKR' |
    'FIL' | 'ICP' | 'LINK' | 'BCH' |
    'ETC' | 'CHZ' | 'DOT' | 'CRV' |
    'NMR' | 'SUSHI' | 'AAVE' | 'BAND' |
    'SKL' | 'ATOM' | 'REQ' | 'RAD' |
    'XTZ' | 'RLY' | 'OMG' | 'FORTH' |
    'UNI' | 'CGLD' | 'NKN' | 'UMA' |
    'BTRST' | 'CLV' | 'BNT' | 'MIR'

export type FiatCurrency = 'GBP' | 'USD' | 'EUR';

export type PairTypes = `${ProductType}-${FiatCurrency}`

export interface LimitOrder {
    client_order_id: string;
    productId: PairTypes;
    side: 'BUY' | 'SELL',
    order_configuration: {
        market_market_ioc?: {
            quote_size: string;
        },
        limit_limit_gtc?: {
            base_size: string;
            limit_price: string;
            post_only: boolean;
        }

    }
}

export interface Product {
    product_id: PairTypes;
    price: string;
    price_percentage_change_24h: string;
    volume_24h: string;
    volume_percentage_change_24h: string;
    base_increment: string;
    quote_increment: string;
    quote_min_size: string;
    quote_max_size: string;
    base_min_size: string;
    base_max_size: string;
    base_name: string;
    quote_name: string;
    watched: boolean;
    is_disabled: boolean;
    new: boolean;
    status: string;
    cancel_only: boolean;
    limit_only: boolean;
    post_only: boolean;
    trading_disabled: boolean;
    auction_mode: boolean;
    product_type: string;
    quote_currency_id: string;
    base_currency_id: string;
    fcm_trading_session_details: any;
    mid_market_price: string,
    alias: string,
    alias_to: string[],
    base_display_symbol: string,
    quote_display_symbol: string
}

export type PortfolioWithNumber = { ticker: PairTypes; amount: number, isLocked: boolean }[];
export type PortfolioWithString = { ticker: PairTypes; amount: string, isLocked: boolean }[];


export type PortfolioToProduct = { [k in PairTypes]?: Product };



export function isDefined<T>(val: T | undefined | null): val is T {
    return val !== undefined && val !== null;
}