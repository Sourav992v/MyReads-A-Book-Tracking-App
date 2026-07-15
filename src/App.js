import "./App.css";
import { useState, useEffect } from "react";
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
  const [showSearchPage, setShowSearchpage] = useState(false);
  const [books, setBooks] = useState([]);

  useEffect(() => {
    BooksAPI.getAll().then((books) => {
      setBooks(books);
    });
  }, []);

  const moveBook = (book, shelf) => {
    BooksAPI.update(book, shelf).then(() => {
      // If the book is not on any shelf, add it.
      if (book.shelf === 'none' || !book.shelf) {
        const newBook = { ...book, shelf };
        setBooks(prevBooks => [...prevBooks, newBook]);
      } else {
        // If the book is already on a shelf, update it.
        setBooks(
          books.map((b) => {
            if (b.id === book.id) {
              return { ...b, shelf };
            }
            return b;
          })
        );
      }
    });
  };

  const shelves = {
    currentlyReading: "Currently Reading",
    wantToRead: "Want to Read",
    read: "Read",
  };

  return (
    <div className="app">
      {showSearchPage ? (
        <div className="search-books">
          <div className="search-books-bar">
            <a
              className="close-search"
              onClick={() => setShowSearchpage(!showSearchPage)}
            >
              Close
            </a>
            <div className="search-books-input-wrapper">
              <input
                type="text"
                placeholder="Search by title, author, or ISBN"
              />
            </div>
          </div>
          <div className="search-books-results">
            <ol className="books-grid"></ol>
          </div>
        </div>
      ) : (
        <div className="list-books">
          <div className="list-books-title">
            <h1>MyReads</h1>
          </div>
          <div className="list-books-content">
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
          </div>
          <div className="open-search">
            <a onClick={() => setShowSearchpage(!showSearchPage)}></a>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
