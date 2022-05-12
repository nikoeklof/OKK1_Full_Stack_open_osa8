import { gql, useMutation, useQuery } from "@apollo/client"
import { useState } from "react"
import Select from "react-select"
const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookAmount
    }
  }
`
const SET_BORN = gql`
  mutation setBorn($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      name
    }
  }
`
const Authors = (props) => {
  const queryResult = useQuery(ALL_AUTHORS)
  const [birthYear, setBirthYear] = useState("")
  const [selectedAuthor, setSelectedAuthor] = useState(null)
  const [editAuthor] = useMutation(SET_BORN, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  })
  if (!props.show) {
    return null
  }
  if (queryResult.loading) return <div>...Loading</div>
  const authors = [...queryResult.data.allAuthors]
  console.log(queryResult.data)

  const options = []
  authors.forEach((author) => {
    options.push({ value: author.name, label: author.name })
  })
  console.log(options)

  const setBornTo = async (e) => {
    e.preventDefault()
    const born = parseInt(birthYear)
    editAuthor({
      variables: {
        name: selectedAuthor.value,
        setBornTo: born,
      },
    })
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookAmount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <form onSubmit={setBornTo}>
          <h3>Change birthdate</h3>
          <Select
            value={selectedAuthor}
            onChange={setSelectedAuthor}
            options={options}
          />
          <br></br>
          <input
            placeholder="Set birth year..."
            onChange={({ target }) => setBirthYear(target.value)}
          />
          <br></br>
          <button type="submit">Set</button>
        </form>
      </div>
    </div>
  )
}

export default Authors
