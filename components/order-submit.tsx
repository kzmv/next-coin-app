'use client'
import { Session } from "next-auth";
import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import {
    FiatCurrency,
    isDefined,
    LimitOrder,
    PairTypes,
    PortfolioToProduct,
    PortfolioWithNumber,
    PortfolioWithString,
    Product
} from "../types/coin";
import {
    allocatePortfolio,
    generateOrderForCurrency,
    normalizePortfolio
} from "../utils/portfolio";
import { useProductAndAccounts } from "../utils/useProductsAndAccounts";
import { TickerForm } from "./base/ticker-form";
import OrderConfirmation from "./orderConfirmation";

import styles from "./order-submit.module.css";
import { useLocalStorage } from "usehooks-ts";

const PORT_LOCAL_STORE = "portfolioJson";
const AMOUN_LOCAL_STORE = "amount";

export default function OrderSubmit({ session }: { session: Session }) {
    const availableCurrencies = ["GBP"];
    const [chosenFiat, setChosenFiat] = useState<FiatCurrency>("GBP");
    const [amount, setAmount] = useState<number>(0);
    const [portfolioJSON, setPortfolioJSON] = useState<PortfolioWithString>({
        "BTC-GBP": "1.0",
        "ETH-GBP": "2.0",
        "MATIC-GBP": "0.3"
    });
    const [isAmountValid, setAmountValid] = useState<boolean>(true);

    const [orders, setOrders] = useState<LimitOrder[]>([])
    const { products, accounts } = useProductAndAccounts(chosenFiat);

    useEffect(() => {
        console.log("On load")
        let port;
        // Get the value from local storage if it exists
        port = JSON.parse(localStorage.getItem(PORT_LOCAL_STORE) ?? "{}") 
        console.log(port);
        setPortfolioJSON(port)
        setAmount(parseFloat(localStorage.getItem(AMOUN_LOCAL_STORE) ?? "0"))
      }, [])

    const updateAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
        const amount = event.target.value;

        const availableBalance =  parseFloat(accounts.find(a => a.name === 'GBP Wallet')?.available_balance.value as any)

        try {
            
            setAmount(parseFloat(amount));
            localStorage.setItem(AMOUN_LOCAL_STORE, amount ?? 0)
            setAmountValid(true);
            if(availableBalance < parseFloat(amount)) {
                setAmountValid(false);
            }
        } catch (e) {
            setAmount(parseFloat(amount))
            localStorage.setItem(AMOUN_LOCAL_STORE, amount ?? 0)
            setAmountValid(false);
        }
    };

    const handleUpdateData = (d: { ticker: string; amount: number }[]) => {
        const port = d.reduce((acc, { ticker, amount }) => {
            acc[ticker] = amount.toString();
            return acc;
          }, {} as any);
        console.log("Saving to store", port)
        localStorage.setItem(PORT_LOCAL_STORE,JSON.stringify(port));
        setPortfolioJSON(port)

    }

    

    const generateOrders = async (
        portfolioWithStrings: PortfolioWithString,
        productList: Product[],
        amount: number
    ) => {
        if (isAmountValid && amount > 0) {
            const portfoliowithAmounts = allocatePortfolio(
                normalizePortfolio(portfolioWithStrings),
                amount
            );
            // setPortfoliowithAmounts(portfoliowithAmounts);
            const productsMap: PortfolioToProduct = productList
                .filter((p) => !!portfoliowithAmounts[p.product_id])
                .reduce((a, v) => ({ ...a, [v.product_id]: v }), {});

            const result: LimitOrder[] = [];
            for (const key in portfoliowithAmounts) {
                const k: PairTypes = key as PairTypes;
                const am = portfoliowithAmounts[k];
                const product = productsMap[k];
                if (isDefined(am) && isDefined(product) && am > 0) {
                    const order = generateOrderForCurrency(
                        product,
                        am.toFixed(2)
                    );
                    result.push(order);
                }
            }
            setOrders(result);
        }
    };

    return (
        <>
        <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Label>Currency</Form.Label>
                <Form.Select onChange={(e: any) => setChosenFiat(e)}>
                    {availableCurrencies.map((c) => (
                        <option key={c} value="{c}">
                            {c}
                        </option>
                    ))}
                </Form.Select>
                <Form.Label>Amount</Form.Label>
                <InputGroup className="mb-3">
                    <InputGroup.Text>£</InputGroup.Text>
                    <Form.Control
                        aria-label="Amount"
                        value={amount}
                        onChange={(e: any) => updateAmount(e)}
                    />
                </InputGroup>
                {!isAmountValid && <div className={styles.errorText}>Amount too big or incorrect</div>}
            </Form.Group>
            <TickerForm tickers={products?.filter(p => p.product_id.includes(chosenFiat))?.map(p => p.product_id) ?? []} initialData={portfolioJSON} onUpdateData={handleUpdateData} />

        </Form>
        <div className={styles.orderSubmitButtonContainer}>
            <Button
                    className={styles.submitButton}
                    variant="primary"
                    type="submit"
                    disabled={!amount && amount === 0}
                    onClick={() => generateOrders(portfolioJSON, products, amount)}
                >
                    Prepare Orders
            </Button>
        </div>
        <OrderConfirmation ordersList={orders}></OrderConfirmation>
        </>
    );
}
