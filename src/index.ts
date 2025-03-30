import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
// import { Sequelize, DataTypes } from "sequelize";
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/gql");
    console.log("Mongo DB Connected");
  } catch (err) {
    console.log("Mongo DB Connection error", err);
    process.exit(1);
  }
};

const dbSchema = new mongoose.Schema({
  title: String,
  author: String,
  published_date: String,
});

const Book = mongoose.model("Book", dbSchema);

connectDB();

//Schema
const typeDefs = `#graphql
 type Book {
    id: ID!
    title: String
    author: String
    published_date: String
  }

  type Query {
    books: [Book]
    bookById(id: ID!): Book
  }

  type Mutation {
    addBook(title: String!, author: String!): Book
    deleteBook(id: ID!): String
    updateBook(id: ID!, title: String, author: String): Book

  }
`;

// //Data
// const books = [
//   {
//     title: "The Awakening",
//     author: "Kate Chopin",
//   },
//   {
//     title: "City of Glass",
//     author: "Paul Auster",
//   },
// ];

//Resolver
const resolvers = {
  Query: {
    books: async () => await Book.find(),
    bookById: async (_, { id }) => await Book.findById(id),
  },
  Mutation: {
    addBook: async (_, { title, author }) => {
      let published_date = new Date();
      const newBook = new Book({ title, author, published_date });
      //   books.push(newBook);
      await newBook.save(); //save to  mongoDB
      return {
        id: newBook?.id, // Get the auto-generated ID
        title: newBook?.title,
        author: newBook?.author,
      };
    },
    deleteBook: async (_, { id }) => {
      const book = await Book.findById(id);
      if (!book) {
        throw new Error(`Book with ID ${id} not found`);
      }
      await book.deleteOne(); // Delete from mongoDB
      return `Book with ID ${id} deleted successfully`;
    },
    updateBook: async (_, { id, title, author }) => {
      const book = await Book.findById(id);
      if (!book) throw new Error("Book not found");

      await book.updateOne({
        title: title,
        author: author,
      });
      return book;
    },
  },
};

//Definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
