import { gql, useQuery } from "@apollo/client"
import { graphQLResultHasError } from "@apollo/client/utilities"

import { ALL_BOOKS } from "../querys"

const Books = (props) => {
  const queryResult = useQuery(ALL_BOOKS, {
    pollInterval: 10000,
  })

  if (!props.show || queryResult.error) {
    return null
  }
  if (queryResult.loading) return <div>...Loading Books</div>

  const books = [...queryResult.data.allBooks] || []

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Books
