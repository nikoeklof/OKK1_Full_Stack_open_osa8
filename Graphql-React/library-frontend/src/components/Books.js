import { gql, useQuery, useSubscription } from "@apollo/client"

import { ALL_BOOKS, BOOK_ADDED } from "../querys"
import { useState } from "react"

const Books = (props) => {
  const queryResult = useQuery(ALL_BOOKS, {
    pollInterval: 10000,

    onError: (error) => {
      props.setError(error.graphQLErrors[0].message)
    },
  })

  const [filter, setFilter] = useState("")

  if (!props.show || queryResult.error) {
    return null
  }
  if (queryResult.loading) return <div>...Loading Books</div>

  const books = [...queryResult.data.allBooks] || []

  const filteredBooks = []

  if (filter !== "") {
    books.forEach((book) => {
      book.genres.forEach((genre) => {
        if (genre.toLowerCase().includes(filter.toLowerCase())) {
          filteredBooks.push(book)
        }
      })
    })
    return (
      <div>
        <h2>books</h2>
        <h3>Filter</h3>
        <input
          value={filter}
          onChange={({ target }) => setFilter(target.value)}
        />

        <table>
          <tbody>
            <tr>
              <th></th>
              <th>author</th>
              <th>genres</th>
              <th>published</th>
            </tr>
            {filteredBooks.map((a) => (
              <tr key={a.title}>
                <td>{a.title}</td>
                <td>{a.author}</td>
                <td>{JSON.stringify(a.genres)}</td>
                <td>{a.published}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  return (
    <div>
      <h2>books</h2>
      <h3>Filter</h3>
      <input
        value={filter}
        onChange={({ target }) => setFilter(target.value)}
      />

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>genres</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author}</td>
              <td>{JSON.stringify(a.genres)}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Books
