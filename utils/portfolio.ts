import { PortfolioWithNumber, PortfolioWithString } from './../types/coin';
import { LimitOrder, PairTypes, Product } from "../types/coin";
import { random } from 'lodash';

export const generateOrderForCurrency = (product: Product, amount: string): LimitOrder => {
  const id = `${new Date().getTime() + Math.floor(random(1,50000))}`;
  return { 
  client_order_id: id,
  productId: product.product_id,
  side: 'BUY',
  order_configuration: {
    market_market_ioc: {
      quote_size: amount
    }
  }
}};

export function normalizePortfolio(portfolio: PortfolioWithString): PortfolioWithNumber {
  let total = 0;
  for (const key in portfolio) {
    if (portfolio.hasOwnProperty(key)) {
      total += parseFloat(portfolio[key as PairTypes] || '0');
    }
  }

  if (Math.abs(total - 1.0) > Number.EPSILON) {
    // Values don't add up to 1.0, so normalize the portfolio.
    const factor = 1.0 / total;
    for (const key in portfolio) {
      if (portfolio.hasOwnProperty(key)) {
        portfolio[key as PairTypes] = (parseFloat(portfolio[key as PairTypes] || '0') * factor).toFixed(6);
      }
    }
  }

  // Convert values to numbers and return the normalized portfolio.
  const normalizedPortfolio: { [k in PairTypes]: number } = {} as { [k in PairTypes]: number };
  for (const key in portfolio) {
    if (portfolio.hasOwnProperty(key)) {
      normalizedPortfolio[key as PairTypes] = parseFloat(portfolio[key as PairTypes] || '0');
    }
  }
  return normalizedPortfolio;
}


export function allocatePortfolio(normalizedPortfolio: PortfolioWithNumber, amount: number): PortfolioWithNumber {
  const allocatedPortfolio: PortfolioWithNumber = {};
  for (const key in normalizedPortfolio) {
    if (normalizedPortfolio.hasOwnProperty(key)) {
      allocatedPortfolio[key as PairTypes] = (normalizedPortfolio[key as PairTypes] ?? 0) * amount;
    }
  }
  return allocatedPortfolio;
}