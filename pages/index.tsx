import { GetServerSidePropsContext } from "next"
import { getServerSession } from "next-auth"
import { useSession } from "next-auth/react"
import AccessDenied from "../components/access-denied"
import Layout from "../components/layout"
import OrderSubmit from "../components/order-submit"
import Portfolio from "../components/portfolio"
import { authOptions } from "./api/auth/[...nextauth]"
import 'bootstrap/dist/css/bootstrap.min.css';

export default function IndexPage() {
  const { data: session, status } = useSession()
  // As this page uses Server Side Rendering, the `session` will be already
  // populated on render without needing to go through a loading stage.

  if (!session || status != "authenticated" || session?.error === "RefreshAccessTokenError") {
    return (
      <Layout>
        <AccessDenied />
      </Layout>
    )
  }

  // await fetch('/api/coinbase/listOfAccounts')

  return (
    <Layout>
      <Portfolio session={session}></Portfolio>
      <OrderSubmit session={session}></OrderSubmit>
    </Layout>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);
  return {
    props: {
      session,
    },
  }
}
