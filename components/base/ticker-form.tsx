"use client";
import {
    faPlus,
    faTrash,
    faX,
    faLock,
    faUnlock,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { Button, Form, FormControl, FormGroup } from "react-bootstrap";
import {
    PairTypes,
    PortfolioWithNumber,
    PortfolioWithString,
} from "../../types/coin";
import styles from "./ticker-form.module.css";
import FormRange from "react-bootstrap/FormRange";
import {
    portNumberToPortString,
    portStringToPortNumber,
    handleChangeAmount
} from "../../utils/portfolio";
import { min, sum } from "lodash";


interface TickerFormProps {
    tickers: PairTypes[];
    initialData: PortfolioWithString;
    onUpdateData: (updatedData: PortfolioWithNumber) => void;
}

export const TickerForm: React.FC<TickerFormProps> = ({
    tickers,
    initialData,
    onUpdateData,
}) => {
    const [formData, setFormData] = useState<PortfolioWithNumber>([]);

    useEffect(() => {
        setFormData(portStringToPortNumber(initialData));
    }, [initialData]);

    const handleToggleLock = (index: number) => {
        const updatedData = [...formData];
        updatedData[index].isLocked = !updatedData[index].isLocked;
        setFormData(updatedData);
    };

    const handleTickerChange = (index: number, selectedTicker: string) => {
        const updatedData = [...formData];
        updatedData[index].ticker = selectedTicker as PairTypes;
        setFormData(updatedData);
        onUpdateData(updatedData);
    };

    // implement function
    // take previous value
    // take all locked values
    // 
    const handleAmountChange = (index: number, newAmount: number, portfolio: PortfolioWithNumber) => {
        let updatedData = [...portfolio];

        newAmount = newAmount >= 100 ? 100 : newAmount;
        newAmount = newAmount <= 0 ? 0 : newAmount;
        const lockedTotal = sum(updatedData.filter((f,i) => i !== index && f.isLocked).map(f => f.amount));
        const maxValuePossible = (100 - lockedTotal) - (updatedData.length - 1);
        const minValuePossible = 1;
        newAmount = newAmount <= maxValuePossible ? newAmount : maxValuePossible;
        newAmount = newAmount >= minValuePossible ? newAmount : minValuePossible;
        // const totalBeforeChange = sum(updatedData.map(d => d.amount));
        const result = handleChangeAmount(index, newAmount, updatedData);
        setFormData(result);
        onUpdateData(result);
    };

    const handleAddRow = () => {
        let updatedData = [
            ...formData,
            {
                ticker: "" as any,
                amount: formData.length === 0 ? 100 : 0,
                isLocked: false,
            }
        ];
        if(updatedData.length > 1) {
            updatedData = handleChangeAmount(updatedData.length - 1, 1, updatedData, true)
        }
        setFormData(updatedData);
        onUpdateData(updatedData);
    };

    const handleDeleteRow = (index: number) => {
        const updatedData = [...formData];
        const deletedAmount = updatedData[index].amount;

        // Calculate total amount of the remaining entries excluding the one to be deleted
        const totalRemaining = updatedData.reduce(
            (total, row, i) => (i !== index ? total + row.amount : total),
            0
        );

        // Remove the entry
        updatedData.splice(index, 1);

        // If no entries remain after deletion, simply reset
        if (updatedData.length === 0) {
            setFormData([]);
            onUpdateData([]);
            return;
        }

        // Distribute the deleted amount proportionally among the remaining entries
        updatedData.forEach((row, i) => {
            if (totalRemaining === 0) {
                // If all other entries are zero, distribute evenly
                row.amount = 100 / updatedData.length;
            } else {
                const proportion = row.amount / totalRemaining;
                row.amount += proportion * deletedAmount;
            }
        });

        if(updatedData.length === 1) {
            updatedData[0].amount = 100;
        }

        setFormData(updatedData);
        onUpdateData(updatedData);
    };


    return (
        <div className={styles.tickerForm}>
            {formData.length === 0 && (
                <Button variant="outline-secondary" onClick={handleAddRow}>
                    <FontAwesomeIcon icon={faPlus} />
                </Button>
            )}
            {formData.map((row, index) => (
                <div key={index} className={styles.row}>
                    {formData.length > 1 ? (
                        <Button
                            variant="outline-danger"
                            onClick={() => handleDeleteRow(index)}
                        >
                            <FontAwesomeIcon icon={faX} />
                        </Button>
                    ) : (
                        <div></div>
                    )}
                    <Form.Select
                        value={row.ticker}
                        onChange={(e) =>
                            handleTickerChange(index, e.target.value)
                        }
                    >
                        <option value="">Select Ticker</option>
                        {tickers.map((ticker) => (
                            <option key={ticker} value={ticker}>
                                {ticker}
                            </option>
                        ))}
                    </Form.Select>
                    <FormControl
                        type="number"
                        value={row.amount}
                        onChange={(e) => {
                            let value = 0;
                            try {
                                value = parseFloat(e.target.value);
                                handleAmountChange(index, value, formData);
                            } catch (e) {}
                        }}
                    />
                    <Button
                        variant="secondary"
                        onClick={() => handleToggleLock(index)}
                    >
                        <FontAwesomeIcon
                            icon={row.isLocked ? faLock : faUnlock}
                        />
                    </Button>
                    <Form.Range
                        min={0}
                        max={100}
                        value={row.amount}
                        onChange={(e) => {
                            /**
                             * If change is from a locked value
                             * then grab all the rest lo
                             */
                            let value = 0;
                            try {
                                value = parseFloat(e.target.value);
                                handleAmountChange(index, value, formData);
                            } catch (e) {}
                        }}
                    />
                    
                    {index === formData.length - 1 ? (
                        <Button
                            variant="outline-secondary"
                            onClick={handleAddRow}
                        >
                            <FontAwesomeIcon icon={faPlus} />
                        </Button>
                    ) : (
                        <div></div>
                    )}
                </div>
            ))}
        </div>
    );
};
