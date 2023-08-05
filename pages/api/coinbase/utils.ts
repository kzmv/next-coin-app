import axios, { AxiosRequestConfig } from "axios";

export async function makeCoinbaseAPICall<T = any>(method: string, path: string, token: string | undefined, body?: object): Promise<T> {
  const config: AxiosRequestConfig = {
      method,
      url: `https://api.coinbase.com/${path}`,
      headers: {
        'Authorization' : `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: body,
    };
  
    return (await axios(config)).data;
  }