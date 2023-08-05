import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from "next";
// This is an example of to protect an API route
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)

  if (session && session.accessToken) {
    try {
      const accounts = ((await axios({
        method: "GET",
        url: `https://api.coinbase.com/api/v3/brokerage/accounts?limit=250`,
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      })).data).accounts

      const productList = ((await axios({
        method: "GET",
        url: `https://api.coinbase.com/api/v3/brokerage/products`,
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      })).data).products

      return res.send({
        accounts: accounts,
        productList: productList,
      })
    } catch (e) {
      res.send({error: e})
    }
  }else {
    res.send({
      error: "You must be signed in to view the protected content on this page.",
    })
  }

  
}


