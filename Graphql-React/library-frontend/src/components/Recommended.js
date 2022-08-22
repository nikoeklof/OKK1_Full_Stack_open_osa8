import { gql, useLazyQuery, useQuery } from "@apollo/client"
import { useState, useEffect } from "react"
import { FILTERED_BOOKS, ME } from "../querys"

const Recommended = (props) => {
  const result = useQuery(ME)
  const [getFilteredBooks, queryResult] = useLazyQuery(FILTERED_BOOKS)
  const [favoriteGenre, setFavoriteGenre] = useState("")
  useEffect(() => {
    if (result.data && result.data.me) {
      setFavoriteGenre(result.data.me.favoriteGenre)
      getFilteredBooks({
        variables: { genreFilter: result.data.me.favoriteGenre },
      })
    }
  }, [result.data, getFilteredBooks])

  if (!props.show) {
    return null
  }

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>genres</th>
            <th>published</th>
          </tr>
          {queryResult.data.filteredBooks.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{JSON.stringify(a.genres)}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export default Recommended
