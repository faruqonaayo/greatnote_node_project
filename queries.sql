DROP TABLE gn_note;
DROP TABLE gn_book;
DROP TABLE gn_user;

CREATE TABLE gn_user(
	id SERIAL PRIMARY KEY,
	firstname VARCHAR(30) NOT NULL,
	lastname VARCHAR(30),
    email VARCHAR(50) UNIQUE NOT NULL,
	password VARCHAR(20) NOT NULL
);

CREATE TABLE gn_book(
	id SERIAL PRIMARY KEY,
	title VARCHAR(100) NOT NULL,
	isbn VARCHAR(13) NOT NULL,
	rating INTEGER NOT NULL,
	date_added DATE NOT NULL,
	gn_user_id INTEGER REFERENCES gn_user(id),
	CHECK (rating < 11),
	UNIQUE (gn_user_id, isbn)
	
);

CREATE TABLE gn_note(
	gn_book_id INTEGER REFERENCES gn_book(id) PRIMARY KEY,
	note_detail VARCHAR(500),
	gn_user_id INTEGER REFERENCES gn_user(id),
    UNIQUE (gn_book_id, gn_user_id) 
);

INSERT INTO gn_user (firstname, lastname, email, password)
VALUES(
    'Test',
    'Code',
    'test@note.com',
    'password'
);