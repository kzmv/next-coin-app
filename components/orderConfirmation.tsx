"use client";
import Button from "react-bootstrap/Button";
import { LimitOrder } from "../types/coin";
import styles from "./orderConfirmation.module.css";
import DataTable from "react-data-table-component";
import { useEffect, useState } from "react";
import { sumBy } from "lodash";

export default function OrderConfirmation(
    props
: {
    ordersList: LimitOrder[];
}) {
    const [ordersToConfirm, setOrdersToConfirm] = useState<LimitOrder[]>([]);

    useEffect(() => {
        setOrdersToConfirm([
            ...(props?.ordersList ?? []), 
        {order_configuration :{market_market_ioc: {quote_size: `${sumBy(props?.ordersList ?? [], (o) => parseFloat(o?.order_configuration?.market_market_ioc?.quote_size ?? "0"))}` }}} as any
    ])
    },[props])

    const columns = [
        { name: "Product", selector: (row: LimitOrder) => row.productId },
        { name: "Side", selector: (row: LimitOrder) => row.side },
        { name: "Fee", selector: (row: LimitOrder) => (parseFloat(row?.order_configuration?.market_market_ioc?.quote_size ?? "0")*0.01).toFixed(3)},
        {
            name: "Amount",
            selector: (row: LimitOrder) =>
                row.order_configuration?.market_market_ioc?.quote_size
                    ? `£${(parseFloat(row?.order_configuration?.market_market_ioc?.quote_size ?? "0")*0.99).toFixed(3)}`
                    : "",
        },
        {
            name: "Actions",
            cell: (row: LimitOrder) =>
                !row.productId && !row.side ? (
                    <Button
                        className={styles.submitButton}
                        variant="primary"
                        type="submit"
                        disabled={ordersToConfirm.length < 2}
                        onClick={() => confirmAll()}
                    >
                        Confrim All
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        type="submit"
                        onClick={() => confirmOrder(row)}
                    >
                        Confrim
                    </Button>
                ),
        },
    ];

    const confirmAll = async () => {
        const { orders, error } = await (
            await fetch("/api/coinbase/makeOrders", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(ordersToConfirm.filter(o => !!o.client_order_id)),
            })
        ).json();
        setOrdersToConfirm([])

        if (error) {
            console.error(error);
        } 
    };

    const confirmOrder = async (order: LimitOrder) => {
        const { orders } = await (
            await fetch("/api/coinbase/makeOrders", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify([order]),
            })
        ).json();
        setOrdersToConfirm(ordersToConfirm.filter(o => o.client_order_id !== order.client_order_id))
    };
    
    return (
        <div className="{styles.list-contianer}">
            <div className={styles.gridContainer}>
                <DataTable columns={columns} data={ordersToConfirm} />
            </div>
            <div className={styles.orderSubmitButtonContainer}></div>
        </div>
    );
}
