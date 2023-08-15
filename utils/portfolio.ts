import { PortfolioWithNumber, PortfolioWithString } from './../types/coin';
import { LimitOrder, PairTypes, Product } from "../types/coin";
import { random } from 'lodash';
import BigNumber from 'bignumber.js';

BigNumber.config({ DECIMAL_PLACES: 2, ROUNDING_MODE: BigNumber.ROUND_DOWN });

export const generateOrderForCurrency = (product: Product, amount: string): LimitOrder => {
  const id = `${new Date().getTime() + Math.floor(random(1, 50000))}`;
  return {
    client_order_id: id,
    productId: product.product_id,
    side: 'BUY',
    order_configuration: {
      market_market_ioc: {
        quote_size: amount
      }
    }
  }
};

export function normalizePortfolio(portfolio: PortfolioWithString): PortfolioWithString {
  let total = 0;
  for (const allocation of portfolio) {
    try {
      total += parseFloat(allocation.amount)
    } catch {

    }
  }
  const factor = 1.0 / total;
  return portfolio.map(allocation => ({ ...allocation, amount: (parseFloat(allocation.amount) * factor).toFixed(2) }));
}

export function portStringToPortNumber(portfolio: PortfolioWithString): PortfolioWithNumber {
  return portfolio.map(p => ({ ...p, amount: parseFloat(p.amount) }))
}
export function portNumberToPortString(portfolio: PortfolioWithNumber): PortfolioWithString {
  return portfolio.map(p => ({ ...p, amount: p.amount.toFixed(2) }))
}


export function allocatePortfolio(normalizedPortfolio: PortfolioWithNumber, amount: number): PortfolioWithNumber {
  return normalizedPortfolio.map(p => ({ ...p, amount: p.amount * amount }));
}

export function handleChangeAmount(index: number, newAmount: number, portfolio: PortfolioWithNumber, dontConsiderLocked: boolean = false): PortfolioWithNumber {
  // if (portfolio[index].isLocked) {
  //   console.error("Cannot modify a locked entry");
  //   return portfolio;
  // }

  const difference = new BigNumber(newAmount).minus(portfolio[index].amount);
  portfolio[index].amount = newAmount;

  let totalAdjustableAmount = new BigNumber(0);
  for (let i = 0; i < portfolio.length; i++) {
    if (i !== index && (dontConsiderLocked || !portfolio[i].isLocked)) {
      totalAdjustableAmount = totalAdjustableAmount.plus(portfolio[i].amount);
    }
  }

  let excess = new BigNumber(0);  // To accumulate the excess when adjusting entries to not fall below 1
  for (let i = 0; i < portfolio.length; i++) {
    if (i !== index && (dontConsiderLocked || !portfolio[i].isLocked)) {
      const proportionChange = portfolio[i].amount / totalAdjustableAmount.toNumber() * difference.toNumber();
      const newAmountForItem = new BigNumber(portfolio[i].amount).minus(proportionChange);

      if (newAmountForItem.isLessThan(1)) {
        excess = excess.plus(newAmountForItem.minus(1));
        portfolio[i].amount = 1;
      } else {
        portfolio[i].amount = newAmountForItem.toNumber();
      }
    }
  }

  // Now distribute the excess among the other entries
  const amountToDistribute = excess.dividedBy(portfolio.length - 1);  // The -1 accounts for the current index
  for (let i = 0; i < portfolio.length; i++) {
    if (i !== index && (dontConsiderLocked || !portfolio[i].isLocked) && portfolio[i].amount !== 1) {
      portfolio[i].amount = new BigNumber(portfolio[i].amount).minus(amountToDistribute).toNumber();
    }
  }

  return portfolio;
}