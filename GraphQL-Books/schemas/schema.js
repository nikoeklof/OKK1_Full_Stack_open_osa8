const { gql } = require("apollo-server")

const typeDefs = gql`
  type Book {
    title: String!
    published: Int!
    author: String!
    id: ID!
    genres: [String!]!
  }
  
  type Subscription {
    bookAdded: Book!
  }
  type Author {
    name: String!
    bookAmount: Int
    born: Int
    id: ID
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String, title: String): [Book!]
    allAuthors: [Author!]!
    findAuthor(name: String!): Author!
    filteredBooks(genreFilter: String!): [Book!]
    me: User
  }
  type Mutation {
    addBook(
      title: String!
      authorName: String!
      published: Int!
      genres: [String!]!
    ): Book
    editAuthor(name: String!, setBornTo: Int!): Author
    createUser(username: String!, favoriteGenre: String!): User
    login(username: String!, password: String!): Token
  }
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }
`
module.exports = typeDefs
