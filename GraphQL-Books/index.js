require("dotenv").config()
const {
  ApolloServer,
  UserInputError,
  gql,
  AuthenticationError,
} = require("apollo-server")
const { v1: uuid } = require("uuid")
const mongoose = require("mongoose")
const Authors = require("./schemas/Author")
const Books = require("./schemas/Book")
const User = require("./schemas/User")
const jwt = require("jsonwebtoken")

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

const resolvers = {
  Query: {
    me: (root, args, context) => {
      return context.currentUser
    },
    bookCount: async () => Books.collection.countDocuments(),
    authorCount: async () => Authors.collection.countDocuments(),
    allBooks: async (root, args) => {
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
      return await Authors.find({})
    },
    findAuthor: async (root, args) => {
      return await Authors.findOne(
        { name: args.name },
        { id: 1, name: 1, born: 1 }
      )
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      const user = context.currentUser
      if (!user) {
        throw new AuthenticationError("not authenticated")
      }
      let newBook
      let query = await Authors.find({ name: args.authorName }, { _id: 1 })
        .lean()
        .then((result) => {
          newBook = {
            title: args.title,
            published: args.published,
            author: result[0]._id,
            genres: args.genres,
          }
          Books.insertMany(newBook)
        })
        .catch((err) => {
          console.log(err)
          return err
        })

      return newBook
    },
    editAuthor: async (root, args, context) => {
      const user = context.currentUser
      if (!user) {
        throw new AuthenticationError("not authenticated")
      }
      const authorToEdit = Authors.findOneAndUpdate(
        { name: args.name },
        { born: args.setBornTo }
      )

      return await authorToEdit
    },
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      })

      return user.save().catch((error) => {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user) {
        throw new UserInputError("User not found.")
      }
      if (!(args.password === "secret")) {
        throw new UserInputError("Invalid credentials")
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,

  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null

    if (auth && auth.toLowerCase().startsWith("bearer ")) {
      const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET)
      const currentUser = await User.findById(decodedToken.id)

      return { currentUser }
    }
  },
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
