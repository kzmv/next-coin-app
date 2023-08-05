import { LimitOrder } from './../../../types/coin';
// This is an example of to protect an API route
import axios from "axios"
import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)

  if (session && session.accessToken) {
    try {
      
      const incomingOrders: LimitOrder[] = req.body;
      const asyncOrders = incomingOrders.map(order => axios({
        method: "POST",
        url: `https://api.coinbase.com/api/v3/brokerage/orders`,
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        data: JSON.stringify(order),
      }))
      const results = await Promise.all(asyncOrders)
      
      const orders = results.map(r => r.data.orders)
      return res.send({
        orders,
      })
    } catch (e) {
      res.send({ error: e })
    }
  } else {
    res.send({
      error: "You must be signed in to view the protected content on this page.",
    })
  }
}

