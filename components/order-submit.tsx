"use client";
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
    Product,
} from "../types/coin";
import {
    allocatePortfolio,
    generateOrderForCurrency,
    normalizePortfolio,
    portNumberToPortString,
    portStringToPortNumber,
} from "../utils/portfolio";
import { useProductAndAccounts } from "../utils/useProductsAndAccounts";
import { TickerForm } from "./base/ticker-form";
import OrderConfirmation from "./orderConfirmation";

import styles from "./order-submit.module.css";
import { useLocalStorage } from "usehooks-ts";
import { compact } from "lodash";

const PORT_LOCAL_STORE = "portfolio";
const AMOUN_LOCAL_STORE = "amount";

export default function OrderSubmit({ session }: { session: Session }) {
    const availableCurrencies = ["GBP"];
    const [chosenFiat, setChosenFiat] = useState<FiatCurrency>("GBP");
    const [amount, setAmount] = useState<number>(0);

    const [portfolioJSON, setPortfolioJSON] = useState<PortfolioWithString>([
        { ticker: "BTC-GBP", amount: "35", isLocked: false },
        { ticker: "ETH-GBP", amount: "55", isLocked: false },
        { ticker: "MATIC-GBP", amount: "10", isLocked: false },
    ]);
    const [isAmountValid, setAmountValid] = useState<boolean>(true);

    const [orders, setOrders] = useState<LimitOrder[]>([]);
    const { products, accounts } = useProductAndAccounts(chosenFiat);

    useEffect(() => {
        console.log("On load");
        let port;
        // Get the value from local storage if it exists
        port = JSON.parse(localStorage.getItem(PORT_LOCAL_STORE) ?? "[]");

        setPortfolioJSON(port);
        setAmount(parseFloat(localStorage.getItem(AMOUN_LOCAL_STORE) ?? "0"));
    }, []);

    const updateAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
        const amount = event.target.value;

        const availableBalance = parseFloat(
            accounts.find((a) => a.name === "GBP Wallet")?.available_balance
                .value as any
        );

        try {
            setAmount(parseFloat(amount));
            localStorage.setItem(AMOUN_LOCAL_STORE, amount ?? 0);
            setAmountValid(true);
            if (availableBalance < parseFloat(amount)) {
                setAmountValid(false);
            }
        } catch (e) {
            setAmount(parseFloat(amount));
            localStorage.setItem(AMOUN_LOCAL_STORE, amount ?? 0);
            setAmountValid(false);
        }
    };

    const handleUpdateData = (d: PortfolioWithNumber) => {
        const port = portNumberToPortString(d);
        console.log("Saving to store", port);
        localStorage.setItem(PORT_LOCAL_STORE, JSON.stringify(port));
        setPortfolioJSON(port);
    };

    const generateOrders = async (
        portfolioWithStrings: PortfolioWithString,
        productList: Product[],
        amount: number
    ) => {
        if (isAmountValid && amount > 0) {
            const portfoliowithAmounts = allocatePortfolio(
                portStringToPortNumber(
                    normalizePortfolio(portfolioWithStrings)
                ),
                amount
            );

            const productsMap: PortfolioToProduct = productList
                .filter(
                    (p) =>
                        !!portfoliowithAmounts.find(
                            (a) => a.ticker === p.product_id
                        )
                )
                .reduce((a, v) => ({ ...a, [v.product_id]: v }), {});

            const orders: LimitOrder[] = compact(portfoliowithAmounts.map((a) => {
                const product = productsMap[a.ticker];
                return isDefined(product)
                    ? generateOrderForCurrency(
                          product,
                          a.amount.toFixed(2)
                      )
                    : undefined;
            }));
            setOrders(orders);
        }
    };

    return (
        <>
            <Form>
                <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlInput1"
                >
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
                    {!isAmountValid && (
                        <div className={styles.errorText}>
                            Amount too big or incorrect
                        </div>
                    )}
                </Form.Group>
                <TickerForm
                    tickers={
                        products
                            ?.filter((p) => p.product_id.includes(chosenFiat))
                            ?.map((p) => p.product_id) ?? []
                    }
                    initialData={portfolioJSON}
                    onUpdateData={handleUpdateData}
                />
            </Form>
            <div className={styles.orderSubmitButtonContainer}>
                <Button
                    className={styles.submitButton}
                    variant="primary"
                    type="submit"
                    disabled={!amount && amount === 0}
                    onClick={() =>
                        generateOrders(portfolioJSON, products, amount)
                    }
                >
                    Prepare Orders
                </Button>
            </div>
            <OrderConfirmation ordersList={orders}></OrderConfirmation>
        </>
    );
}
