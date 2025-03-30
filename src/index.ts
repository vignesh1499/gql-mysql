import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { Sequelize, DataTypes } from "sequelize";

//Create a new Sequelize instance
const sequelize = new Sequelize("testdb", "root", "Bluespire@9", {
  host: "localhost",
  dialect: "mysql",
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

//Create a model for DB
const Book = sequelize.define(
  "Book",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    published_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "books",
  }
);

//Sync the model with the database
sequelize.sync().then(() => {
  console.log("Database and tables created!");
});

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
    books: () => async () => await Book.findAll(),
    bookById: async (_, { id }) => await Book.findByPk(id),
  },
  Mutation: {
    addBook: async (_, { title, author }) => {
      let published_date = new Date();
      //   const newBook = { title, author };
      //   books.push(newBook);
      const newBook: any = await Book.create({ title, author, published_date }); // Insert into MySQL
      return {
        id: newBook?.id, // Get the auto-generated ID
        title: newBook?.title,
        author: newBook?.author,
      };
    },
    deleteBook: async (_, { id }) => {
      const book = await Book.findByPk(id);
      if (!book) {
        throw new Error(`Book with ID ${id} not found`);
      }
      await book.destroy();
      return `Book with ID ${id} deleted successfully`;
    },
    updateBook: async (_, { id, title, author }) => {
      const book = await Book.findByPk(id);
      if (!book) throw new Error("Book not found");

      await book.update({
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
