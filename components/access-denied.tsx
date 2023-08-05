import { signIn } from "next-auth/react"

export default function AccessDenied() {
  return (
    <div>
      <h1>Welcome!</h1>
      <br>You must be signed in to view this page</br>
    </div>
  )
}
