import { gql, useMutation } from "@apollo/client"
import { useState } from "react"
import { ALL_BOOKS, ADD_BOOK } from "../querys"

const NewBook = (props) => {
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [published, setPublished] = useState("")
  const [genre, setGenre] = useState("")
  const [genres, setGenres] = useState([])
  const [addBook] = useMutation(ADD_BOOK, {
    onError: (error) => {
      props.setError(error.graphQLErrors[0].message)
    },
    refetchQueries: [{ query: ALL_BOOKS }],
  })

  if (!props.show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()
    const year = parseInt(published)
    console.log(title, author, published, genres)
    console.log("add book...")
    await addBook({
      variables: {
        title: title,
        authorName: author,
        published: year || undefined,
        genres: genres,
      },
    })

    setTitle("")
    setPublished("")
    setAuthor("")
    setGenres([])
    setGenre("")
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre("")
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(" ")}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  )
}

export default NewBook
