import { gql } from "@apollo/client"
export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookAmount
    }
  }
`
export const SET_BORN = gql`
  mutation setBorn($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      name
      born
    }
  }
`
export const ALL_BOOKS = gql`
  query {
    allBooks {
      title
      author {
        name
      }
      published
      genres
    }
  }
`
export const ADD_BOOK = gql`
  mutation addBook(
    $title: String!
    $authorName: String!
    $published: Int
    $genres: [String!]!
  ) {
    addBook(
      title: $title
      published: $published
      genres: $genres
      authorName: $authorName
    ) {
      title
      published
      genres
    }
  }
`
export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`
