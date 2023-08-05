import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"
import styles from "./header.module.css"
import { Button } from "react-bootstrap"

// The approach used in this component shows how to build a sign in and sign out
// component that works on pages which support both client and server side
// rendering, and avoids any flash incorrect content on initial page load.
export default function Header() {
  const { data: session, status } = useSession()
  const loading = status === "loading"

  return (
    <header>
      <noscript>
        <style>{`.nojs-show { opacity: 1; top: 0; }`}</style>
      </noscript>
      <div className={styles.signedInStatus}>
        <div
          className={`nojs-show ${
            !session && loading ? styles.loading : styles.loaded
          }`}
        >
          {!session && (
            <div className={styles.notSignedInContainer}>
              <div className={styles.title}>
                Coinr0n
              </div>
              <Button 
              className="styles.signInButton"
              onClick={(e) => {
                  e.preventDefault()
                  signIn('coinbase')
                }}>Sign In</Button>
            </div>
          )}
          {session?.user && (
            <div className={styles.signInContainer}>
              <div className={styles.title}>
                Coinr0n
              </div>


                <span className={styles.signedInText}>
                  <strong>{session.user.email ?? session.user.name}</strong>
                </span>

              <a
                href={`/api/auth/signout`}
                className={styles.signInButton}
                onClick={(e) => {
                  e.preventDefault()
                  signOut()
                }}
              >
                Sign out
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
