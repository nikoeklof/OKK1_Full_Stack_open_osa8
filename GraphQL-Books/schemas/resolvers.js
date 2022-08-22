require("dotenv").config()
const { PubSub } = require("graphql-subscriptions")
const pubsub = new PubSub()

const { UserInputError, AuthenticationError } = require("apollo-server")
const jwt = require("jsonwebtoken")
const Authors = require("./Author")
const Books = require("./Book")
const User = require("./User")
const Book = require("./Book")

const resolvers = {
  Query: {
    me: (root, args, context) => {
      return context.currentUser
    },
    bookCount: async () => Books.collection.countDocuments(),
    authorCount: async () => Authors.collection.countDocuments(),
    allBooks: async (root, args, context) => {
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
            bookQuery[i].author = authorQuery[j].name
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
          if (book.author === args.author) {
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
    allAuthors: async (root, args, context) => {
      const authors = await Authors.find({}).lean().exec()
      const books = await Books.find({}).lean().exec()
      var returnME = []
      authors.forEach((author) => {
        var fixedAuthor = { ...author, bookAmount: 0 }
        console.log(author)
        books.forEach((book) => {
          if (author._id.toString() === book.author.toString()) {
            fixedAuthor.bookAmount += 1
          }
        })
        returnME.push(fixedAuthor)
      })

      return returnME
    },
    findAuthor: async (root, args, context) => {
      return await Authors.findOne(
        { name: args.name },
        { id: 1, name: 1, born: 1 }
      )
    },
    filteredBooks: async (root, args, context) => {
      const filter = args.genreFilter
      const queryBooks = await Books.find({
        genres: { $regex: filter, $options: "i" },
      })
        .lean()
        .exec()
      const authorQuery = await Authors.find({}).lean().exec()
      queryBooks.forEach((book) => {
        for (let i = 0; i < authorQuery.length; i++) {
          if (book.author.toString() === authorQuery[i]._id.toString()) {
            book.author = authorQuery[i].name
          }
        }
      })
      console.log(queryBooks)
      return queryBooks.length > 0 ? queryBooks : null
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      const user = context.currentUser
      console.log(user)
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
      pubsub.publish("BOOK_ADDED", { bookAdded: newBook })

      return newBook
    },
    editAuthor: async (root, args, context) => {
      const user = context.currentUser
      console.log(user)
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
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(["BOOK_ADDED"]),
    },
  },
}
module.exports = resolvers
