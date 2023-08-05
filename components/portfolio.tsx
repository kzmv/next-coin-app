"use client";
import { Session } from "next-auth";
import { useState } from "react";
import { Account, FiatCurrency, LimitOrder, Product } from "../types/coin";
import { useProductAndAccounts } from "../utils/useProductsAndAccounts";
import DataTable from 'react-data-table-component';

import AccessDenied from "./access-denied";
import styles from  "./portfolio.module.css";

const sortNumbers = (rowA: (Product & Account), rowB: (Product & Account)) => {
    const a = rowA.price ? (rowA.available_balance.value * parseFloat(rowA.price)) : rowA.available_balance.value
    const b = rowB.price ? (rowB.available_balance.value * parseFloat(rowB.price)) : rowB.available_balance.value

    if (a > b) {
        return 1;
    }

    if (b > a) {
        return -1;
    }

    return 0;
};

export default function Portfolio({ session }: { session: Session }) {
    const [choseFiat, setChosenFiat] = useState<FiatCurrency>("GBP");
    const { joinedProductsAndAccounts, error } = useProductAndAccounts(choseFiat);

    const columns = [
        { name: 'Product', selector: (row: (Product & Account)) => row.currency},
        { name: 'Amount', selector: (row: (Product & Account)) => row.available_balance.value },
        { name: 'Price', selector: (row: (Product & Account)) => row.price ? `£${row.price}` : '' },
        { 
            name: 'Change', 
            selector: (row: (Product & Account)) => `${parseFloat(row.price_percentage_change_24h).toFixed(2)}`, 
            conditionalCellStyles: [
                {
                    when: (row: (Product & Account)) => parseFloat(row.price_percentage_change_24h) !== 0 && !isNaN(parseFloat(row.price_percentage_change_24h)),
                    style: (row: (Product & Account)) => ({ color: parseFloat(row.price_percentage_change_24h) < 0 ? 'red' : 'green' })
                }
            ]
        },
        {
            name: 'Total', 
            selector: (row: (Product & Account)) => row.price ? (row.available_balance.value * parseFloat(row.price)).toFixed(2) : row.available_balance.value,
            sortFunction: sortNumbers,
            sortable: true 
        }
    ];
    if(error) {
        console.log(error)
    }
    if (session.accessToken && !error) {
        return (
            <>
                <div className={styles.gridContainer} >
                <DataTable
                    columns={columns}
                    data={joinedProductsAndAccounts.filter(a => a.available_balance.value > 0)}
                    />
                </div>
            </>
        );
    } else {
        return (
            <>
                <AccessDenied />
            </>
        );
    }
}
