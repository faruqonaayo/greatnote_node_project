import express, { response } from "express";
import pg from "pg";
import bodyParser from "body-parser";
import env from "dotenv";
import axios from "axios";

//creating the express application that runs on the server
const app = express();
const port = 3000;
env.config();

// connect to the postgres database
const db = new pg.Client({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_DATABASE,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
});

db.connect();

// indicating to the server that all static files are located in the public folder;
app.use(express.static("public"));

// using the body parser middleware to get data passed into the input fields by the user
app.use(bodyParser.urlencoded({ extended: true }));

// setting a current user variable to keep track of our current user
let currentUser;
let filterChoice = false;

let today = new Date();

// the login.ejs page is sent to the user when user wants to get the root location
app.get("/", (req, res) => {
    res.render("login.ejs");
});

// the register.ejs page is sent to the user when user wants to get the register route
app.get("/register", (req, res) => {
    res.render("register.ejs");
});

// the index.ejs page is sent to the user when user targets the home route
app.get("/home", (req, res) => {
    res.render("index.ejs");
});

// a fuction that gets user choice
async function getAllBooks(filter) {
    if (filter == "" || filter == false) {
        const response = await db.query("SELECT * FROM gn_book WHERE gn_user_id = $1;", [currentUser.id]);
        return response
    }else if (filter == "title") {
        const response = await db.query("SELECT * FROM gn_book WHERE gn_user_id = $1 ORDER BY title ASC;", [currentUser.id]);
        return response
    }else if (filter == "rating") {
        const response = await db.query("SELECT * FROM gn_book WHERE gn_user_id = $1 ORDER BY rating DESC;", [currentUser.id]);
        return response
    }else if (filter == "date") {
        const response = await db.query("SELECT * FROM gn_book WHERE gn_user_id = $1 ORDER BY date_added ASC;", [currentUser.id]);
        return response
    }
};

//the server response when user whants to see all the books they have added to the database
app.get("/allBooks", async (req, res) => {
    try {
        const bookResponse = await getAllBooks(filterChoice);
        const bookResult = bookResponse.rows;
        for (let i = 0; i < bookResult.length; i++) {
            const coverLink = `https://covers.openlibrary.org/b/isbn/${bookResult[i].isbn}-L.jpg`
            bookResult[i].bookCover = coverLink

            try {
                const noteResponse = await db.query("SELECT * FROM gn_note WHERE gn_book_id = $1 AND gn_user_id = $2;", [bookResult[i].id, currentUser.id]);
                const noteResult = noteResponse.rows;
                console.log(noteResult);
                bookResult[i].note_detail = noteResult[0].note_detail;
            } catch (error) {
                console.log(error);
            }

        }
        console.log(bookResult);
        res.render("allbooks.ejs", { userBooks: bookResult });
    } catch (error) {
        console.log(error);
    }

})


// a function that compares user input with email and password in the database
async function checkUser(e, p) {
    const response = await db.query("SELECT * FROM gn_user WHERE email = $1 AND password = $2;", [e, p]);
    return response.rows
};

// the server action to validate user info and render the home.ejs page
app.post("/login", async (req, res) => {
    const userEmailInput = req.body["email"];
    const userPasswordInput = req.body["password"];
    try {
        const result = await checkUser(userEmailInput, userPasswordInput);
        currentUser = result[0];
        // if the emai and passeords match the user is given access to the website
        if (currentUser) {
            res.redirect("/home");
        } else {
            res.render("login.ejs", { error: "Input details not correct. Please try again or register" });
        }
        console.log("The currrent user is");
        console.log(currentUser);
    } catch (error) {
        console.log(error);
    }
});

// server's response when user post data to the register route
app.post("/register", async (req, res) => {
    const newUserFirstname = req.body["firstname"];
    const newUserLastname = req.body["lastname"];
    const newUserEmail = req.body["email"];
    const newUserPassword = req.body["password"];

    // the server inserts the user's information to the database and the new user is expected to login with the data they passed.
    try {
        const result = await db.query("INSERT INTO gn_user (firstname, lastname, email, password) VALUES($1,$2,$3,$4) RETURNING *;", [newUserFirstname, newUserLastname, newUserEmail, newUserPassword]);
        console.log(result.rows);
        res.redirect("/");
    } catch (error) {
        console.log(error);
        res.render("register.ejs", { error: " The email already exists in the database" });
    }
});


// the server adds the data of the new book added by user to the database
app.post("/note", async (req, res) => {
    const newBookTitle = req.body["book-title"];
    const newBookIsbn = req.body["book-isbn"];
    const newBookRating = parseInt(req.body["book-rating"]);
    const newBookNote = req.body["book-note"];
    const dateAdded = today.toISOString().split('T')[0];

    try {
        const bookResult = await db.query(
            "INSERT INTO gn_book (title,isbn,rating,date_added,gn_user_id) VALUES($1,$2,$3,$4,$5) RETURNING *;",
            [newBookTitle, newBookIsbn, newBookRating, dateAdded, currentUser.id]
        );
        console.log(bookResult.rows);
        const result = bookResult.rows;
        // insert into the note table using the data returned by result
        try {
            const noteResult = await db.query(
                "INSERT INTO gn_note (gn_book_id, note_detail, gn_user_id) VALUES ($1,$2,$3) RETURNING *;",
                [result[0].id, newBookNote, currentUser.id]
            );
            console.log(noteResult.rows);
            res.redirect("/home");
        } catch (error) {
            console.log(error);
        }
    } catch (error) {
        console.log(error);
    }
});

// server updating the the details of the book
app.post("/edit", async (req,res)=>{
    const bookId = parseInt(req.body["book-id"]);
    const newTitle = req.body["book-title"];
    const newIsbn = req.body["book-isbn"];
    const newRating = req.body["book-rating"];
    const newBookNote = req.body["book-note"];

    try {
        const bookResponse = await db.query("UPDATE gn_book SET title = $1, isbn = $2, rating = $3 WHERE id = $4 AND gn_user_id = $5 RETURNING *;", [newTitle, newIsbn, newRating, bookId, currentUser.id]);
        console.log(bookResponse.rows);

        const noteResponse = await db.query("UPDATE gn_note SET note_detail = $1 WHERE gn_book_id = $2 AND gn_user_id = $3 RETURNING *;", [newBookNote, bookId, currentUser.id]);
        console.log(noteResponse.rows);
        res.redirect("/allBooks");
    } catch (error) {
        console.log(error);
    }
});

// server deleting a book from server based on user choice
app.post("/delete", async (req,res)=>{
    const deleteBookId = req.body["book-id"];
    try {
            await db.query("DELETE FROM gn_note WHERE gn_book_id = $1 AND gn_user_id = $2;", [deleteBookId, currentUser.id]);
            await db.query("DELETE FROM gn_book WHERE id = $1 AND gn_user_id = $2;", [deleteBookId, currentUser.id]);
        res.redirect("/allBooks");
    } catch (error) {
        console.log(error);
    }
});

// filtering user books
app.post("/filter", (req,res)=>{
    const userFilterChoice = req.body["filt-opt"];

    if (userFilterChoice == "bytitle") {
        filterChoice = "title";
    }else if (userFilterChoice == "byrating") {
        filterChoice = "rating";
    }else if (userFilterChoice == "bydate") {
        filterChoice = "date";
    }else{
        filterChoice = false;
    }
    res.redirect("/allBooks");
});

// server signing user out of the website
app.get("/signout", (req,res)=>{
    currentUser = null;
    res.redirect("/");
});

// the server listens on port 3000
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});