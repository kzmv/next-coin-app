import NextAuth, { NextAuthOptions } from "next-auth"
import CoinbaseProvider from "next-auth/providers/coinbase"


const scopes = ["wallet:user:email", "wallet:user:read", "wallet:accounts:read", "wallet:buys:create"];

async function refreshAccessToken(token: any) {
  try {
    if (process.env.COINBASE_CLIENT_ID && process.env.COINBASE_CLIENT_SECRET && token.refreshToken) {
      const url =
        "https://www.coinbase.com/oauth/token?" +
        new URLSearchParams({
          client_id: process.env.COINBASE_CLIENT_ID,
          client_secret: process.env.COINBASE_CLIENT_SECRET,
          grant_type: "refresh_token",
          refresh_token: token.refreshToken,
        })

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
      })

      const refreshedTokens = await response.json()

      if (!response.ok) {
        throw refreshedTokens
      }

      return {
        ...token,
        accessToken: refreshedTokens.access_token,
        accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
        refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
      }
    }
  } catch (error) {
    console.log(error)

    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export const authOptions: NextAuthOptions = {
  // https://next-auth.js.org/configuration/providers/oauth
  providers: [
    CoinbaseProvider({
      clientId: process.env.COINBASE_CLIENT_ID,
      clientSecret: process.env.COINBASE_CLIENT_SECRET,
      authorization:
        `https://www.coinbase.com/oauth/authorize?scope=${scopes.join("+")}`,
    })
  ],
  callbacks: {
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token from a provider.
      if (token) {
        session.user = token.user;
        session.accessToken = token.accessToken
      }
      if(token.error) {
        session.error = token.error
      }
      return session
    },
    async jwt({ token, account, user }) {
      // Persist the OAuth access_token to the token right after signin
      if (account && user) {
        return {
          accessToken: account.accessToken,
          accessTokenExpires: Date.now() + (account as any).expires_in * 1000,
          refreshToken: account.refresh_token,
          user,
        }
      }

      // Return previous token if the access token has not expired yet
      if (token?.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token)
    },
  },
}

export default NextAuth(authOptions)
