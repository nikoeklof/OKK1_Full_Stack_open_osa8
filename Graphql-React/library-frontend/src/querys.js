import { gql } from "@apollo/client"

const AUTHOR_DETAILS = gql`
  fragment AuthorDetails on Author {
    name
    born
  }
`
const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    author
    published
    title
    genres
  }
`
export const ALL_AUTHORS = gql`
  query allAuthors {
    allAuthors {
      ...AuthorDetails
    }
  }
  ${AUTHOR_DETAILS}
`

export const SET_BORN = gql`
  mutation setBorn($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      ...AuthorDetails
    }
  }
  ${AUTHOR_DETAILS}
`
export const ALL_BOOKS = gql`
  query allBooks {
    allBooks {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`
export const ADD_BOOK = gql`
  mutation addBook(
    $title: String!
    $authorName: String!
    $published: Int!
    $genres: [String!]!
  ) {
    addBook(
      title: $title
      authorName: $authorName
      published: $published
      genres: $genres
    ) {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`
export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`
export const ME = gql`
  query Me {
    me {
      username
      favoriteGenre
      id
    }
  }
`
export const FILTERED_BOOKS = gql`
  query filteredBooks($genreFilter: String!) {
    filteredBooks(genreFilter: $genreFilter) {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`
export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }

  ${BOOK_DETAILS}
`
