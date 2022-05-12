require("dotenv").config()
const { ApolloServer, UserInputError, gql } = require("apollo-server")
const { v1: uuid } = require("uuid")
const mongoose = require("mongoose")
const Authors = require("./schemas/Author")
const Books = require("./schemas/Book")

console.log("connecting to", process.env.MONGODB_URI)

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB")
  })
  .catch((error) => {
    console.log("error connection to MongoDB:", error.message)
  })

const typeDefs = gql`
  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [String!]
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
  }
  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book
    editAuthor(name: String!, setBornTo: Int!): Author
  }
`

const resolvers = {
  Query: {
    bookCount: async () => Books.collection.countDocuments(),
    authorCount: async () => Authors.collection.countDocuments(),
    allBooks: async (root, args) => {
      console.log(args)
      let [bookQuery, authorQuery] = await Promise.all([
        Books.find({})
          .lean()
          .then((result) => {
            return result
          }),
        Authors.find({})
          .lean()
          .then((result) => {
            return result
          }),
      ])

      for (let i = 0; i < bookQuery.length; i++) {
        for (let j = 0; j < authorQuery.length; j++) {
          if (
            bookQuery[i].author.toString() === authorQuery[j]._id.toString()
          ) {
            bookQuery[i].author = authorQuery[j]
          }
        }
      }

      if (args.title !== undefined && args.title !== null) {
        var returnME = []
        bookQuery.forEach((book) => {
          if (book.title === args.title) {
            returnME.push(book)
          }
        })
        return returnME
      }
      if (args.author !== undefined && args.author !== null) {
        var returnME = []
        bookQuery.forEach((book) => {
          if (book.author.name === args.author) {
            returnME.push(book)
          }
        })
        return returnME
      }
      if (args.genre !== undefined && args.genre !== null) {
        var returnME = []
        bookQuery.forEach((book) => {
          if (book.genres.includes(args.genre)) {
            returnME.push(book)
          }
        })
        return returnME
      }
      return bookQuery
    },
    allAuthors: async (root, args) => {
      return Authors.find({})
    },
    findAuthor: async (root, args) => {
      return Authors.findOne({ name: args.name }, { id: 1, name: 1, born: 1 })
    },
  },
  Mutation: {
    addBook: async (root, args) => {
      const newBook = { ...args, id: uuid() }
      books = books.concat(newBook)
      return newBook
    },
    editAuthor: (root, args) => {
      const authorToEdit = authors.findIndex(
        (author) => author.name === args.name
      )

      if (authorToEdit === -1) return null

      let replacedAuthor = authors[authorToEdit]

      if (!replacedAuthor.born) {
        replacedAuthor = { ...authors[authorToEdit], born: args.setBornTo }
      } else {
        replacedAuthor.born = args.setBornTo
      }
      authors.splice(authorToEdit, 1, replacedAuthor)
      return replacedAuthor
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
