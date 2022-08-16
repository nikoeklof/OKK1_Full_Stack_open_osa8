import { useState } from "react"
import Authors from "./components/Authors"
import Books from "./components/Books"
import NewBook from "./components/NewBook"
import LoginForm from "./components/Loginform"
import Notify from "./components/Notify"
import { useApolloClient } from "@apollo/client"

const App = () => {
  const [page, setPage] = useState("authors")
  const [token, setToken] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const client = useApolloClient()

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 5000)
  }
  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  console.log(token)

  if (!token) {
    return (
      <div>
        <Notify errorMessage={errorMessage} />
        <h2>Login</h2>
        <LoginForm setToken={setToken} setError={notify} logOut={logout} />
      </div>
    )
  }
  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        <button onClick={() => setPage("add")}>add book</button>
        <button onClick={() => logout()}>Logout</button>
      </div>

      <Authors show={page === "authors"} setError={notify} />

      <Books show={page === "books"} setError={notify} />

      <NewBook show={page === "add"} setError={notify} />
    </div>
  )
}

export default App
