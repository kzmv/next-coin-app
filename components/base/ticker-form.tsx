import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { Button, Form, FormControl, FormGroup } from "react-bootstrap";
import { PairTypes } from "../../types/coin";
import styles from "./ticker-form.module.css";

interface TickerFormProps {
    tickers: PairTypes[];
    initialData: { ticker: string; amount: number }[];
    onUpdateData: (updatedData: { ticker: string; amount: number }[]) => void;
}

export const TickerForm: React.FC<TickerFormProps> = ({
    tickers,
    initialData,
    onUpdateData,
}) => {
    const [formData, setFormData] = useState(initialData);

    const handleTickerChange = (index: number, selectedTicker: string) => {
        const updatedData = [...formData];
        updatedData[index].ticker = selectedTicker;
        setFormData(updatedData);
        onUpdateData(updatedData);
    };

    const handleAmountChange = (index: number, newAmount: string) => {
        const updatedData = [...formData];
        updatedData[index].amount = parseFloat(newAmount);
        setFormData(updatedData);
        onUpdateData(updatedData);
    };

    const handleAddRow = () => {
        const updatedData = [...formData, { ticker: "", amount: 0 }];
        setFormData(updatedData);
        onUpdateData(updatedData);
    };

    const handleDeleteRow = (index: number) => {
        const updatedData = [...formData];
        updatedData.splice(index, 1);
        setFormData(updatedData);
        onUpdateData(updatedData);
    };

    return (
        <div className={styles.tickerForm}>
            {formData.map((row, index) => (
                <div key={index} className={styles.row}>
                        {formData.length > 1 ? (
                            <Button
                                variant="outline-danger"
                                onClick={() => handleDeleteRow(index)}
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </Button>
                        ) : (<div></div>)}
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
                            onChange={(e) =>
                                handleAmountChange(index, e.target.value)
                            }
                        />
                        {index === formData.length - 1 ? (
                            <Button
                                variant="outline-secondary"
                                onClick={handleAddRow}
                            >
                                <FontAwesomeIcon icon={faPlus} />
                            </Button>
                        ) : (<div></div>)}
                        
                </div>
            ))}
        </div>
    );
};
