import axios, { AxiosResponse } from 'axios';
import { keyBy } from "lodash";
import useSWRImmutable from 'swr';
import { Account, Product } from "../types/coin";

export interface UseProductAndAccountsOutput {
    products: Product[];
    accounts: Account[];
    joinedProductsAndAccounts: (Product & Account)[],
    error?: any
}

const fetcher = async (url: string) => await axios.get(url).then((res: AxiosResponse) => {
    return res.data
});


export function useProductAndAccounts(choseFiat: string): UseProductAndAccountsOutput {
    const {data, error}: {data: {accounts: Account[], productList: Product[]}, error: any} = useSWRImmutable("/api/coinbase/listOfAccounts", fetcher);
    if(data) {
        const {accounts, productList} = data
        const prods = productList?.filter((p) => p.product_id.includes(choseFiat));
        const mappedProducts: { [key: string]: Product } = keyBy(prods, (i: Product) => i.product_id.split('-')[0]);
        const joinedPA = (accounts ?? []).map(a => ({ ...a, ...(mappedProducts[a.currency === 'ETH2' ? "ETH" : a.currency] ?? {}) }))
        return {
            products: productList,
            accounts: accounts,
            joinedProductsAndAccounts: joinedPA,
        }
    }
    return {
        products: [],
        accounts: [],
        joinedProductsAndAccounts: [],
        error
    }


} 