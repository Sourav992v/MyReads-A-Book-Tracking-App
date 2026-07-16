import "./App.css";
import { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import * as BooksAPI from "./BooksAPI";

const Book = ({ book, onMove }) => {
  const shelf = book.shelf ? book.shelf : "none";

  return (
    <li>
      <div className="book">
        <div className="book-top">
          <div
            className="book-cover"
            style={{
              width: 128,
              height: 193,
              backgroundImage: `url(${
                book.imageLinks ? book.imageLinks.thumbnail : ""
              })`,
            }}
          ></div>
          <div className="book-shelf-changer">
            <select value={shelf} onChange={(e) => onMove(book, e.target.value)}>
              <option value="none" disabled>
                Move to...
              </option>
              <option value="currentlyReading">Currently Reading</option>
              <option value="wantToRead">Want to Read</option>
              <option value="read">Read</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>
        <div className="book-title">{book.title}</div>
        <div className="book-authors">
          {book.authors ? book.authors.join(", ") : ""}
        </div>
      </div>
    </li>
  );
};

const Bookshelf = ({ title, books, onMove }) => {
  return (
    <div className="bookshelf">
      <h2 className="bookshelf-title">{title}</h2>
      <div className="bookshelf-books">
        <ol className="books-grid">
          {books.map((book) => (
            <Book key={book.id} book={book} onMove={onMove} />
          ))}
        </ol>
      </div>
    </div>
  );
};

function App() {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    BooksAPI.getAll().then((books) => {
      setBooks(books);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (query) {
      setLoading(true);
      BooksAPI.search(query).then((results) => {
        if (results.error) {
          setSearchResults([]);
        } else {
          const updatedResults = results.map((resultBook) => {
            const bookOnShelf = books.find((b) => b.id === resultBook.id);
            return bookOnShelf ? bookOnShelf : { ...resultBook, shelf: "none" };
          });
          setSearchResults(updatedResults);
        }
        setLoading(false);
      });
    } else {
      setSearchResults([]);
    }
  }, [query, books]);

  const moveBook = (book, shelf) => {
    BooksAPI.update(book, shelf).then(() => {
      // If the book is not on any shelf, add it.
      const updatedBook = { ...book, shelf };

      // Update the main books list
      setBooks((prevBooks) => {
        const bookIndex = prevBooks.findIndex((b) => b.id === book.id);
        if (bookIndex !== -1) {
          // If book exists, update it
          return prevBooks.map((b) => (b.id === book.id ? updatedBook : b));
        } else {
          // If book is new, add it
          return [...prevBooks, updatedBook];
        }
      });

      // Also update the search results to reflect the change immediately
      setSearchResults((prevResults) =>
        prevResults.map((b) =>
          b.id === book.id ? { ...b, shelf } : b
        )
      );
    });
  };

  const shelves = {
    currentlyReading: "Currently Reading",
    wantToRead: "Want to Read",
    read: "Read",
  };

  return (
    <div className="app">
      <Routes>
        <Route
          path="/search"
          element={
            <div className="search-books">
              <div className="search-books-bar">
                <Link to="/" className="close-search">
                  Close
                </Link>
                <div className="search-books-input-wrapper">
                  <input
                    type="text"
                    placeholder="Search by title, author, or ISBN"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="search-books-results">
                {loading ? (
                  <div className="loader">Loading...</div>
                ) : (
                  <ol className="books-grid">
                    {searchResults.map((book) => (
                      <Book key={book.id} book={book} onMove={moveBook} />
                    ))}
                  </ol>
                )}
              </div>
            </div>
          }
        />
        <Route
          path="/"
          element={
            <div className="list-books">
              <div className="list-books-title">
                <h1>MyReads</h1>
              </div>
              <div className="list-books-content">
                {loading ? (
                  <div className="loader">Loading...</div>
                ) : (
                  <div>
                    {Object.keys(shelves).map((shelf) => (
                      <Bookshelf
                        key={shelf}
                        title={shelves[shelf]}
                        books={books.filter((book) => book.shelf === shelf)}
                        onMove={moveBook}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="open-search">
                <Link to="/search"></Link>
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
