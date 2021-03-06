import { gql, useQuery } from "@apollo/client"

export const ALL_BOOKS = gql`
  query {
    allBooks {
      title
      author
      published
      genres
    }
  }
`
const Books = (props) => {
  const queryResult = useQuery(ALL_BOOKS, {

  })

  if (!props.show) {
    return null
  }
  if(queryResult.loading) return <div>...Loading Books</div>

  const books = [...queryResult.data.allBooks]

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
              <td>{a.author}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Books
