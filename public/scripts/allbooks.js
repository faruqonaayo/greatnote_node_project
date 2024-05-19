const viewBtn = document.querySelectorAll(".view-btn");
const editBtn = document.querySelectorAll(".edit-btn");
const backBtn = document.querySelectorAll(".back-btn");
const bookItem = document.querySelectorAll(".book-item");
const editBook = document.querySelectorAll(".edit-book");
const filterChoice = document.querySelector(".filter-choice");
const filterForm = document.querySelector(".filter-form");

filterChoice.addEventListener("change", ()=>{
    filterForm.submit();
})

viewBtn.forEach(btn => {
    btn.addEventListener("click", (event) => {
        event.preventDefault();
        const bookId = btn.value;
        console.log(bookId);
        const bookNote = document.querySelector(`.note${bookId}`);
        bookNote.classList.toggle("active");
        bookItem.forEach(item => {
            item.style.display = "none";
        });
    })
});

// the edit button displays the edit form
editBtn.forEach(btn => {
    btn.addEventListener("click", (event) => {
        event.preventDefault();
        const bookId = btn.value;
        console.log(bookId);
        const editForm = document.querySelector(`.form${bookId}`);
        editForm.classList.toggle("active");

        // hide the note section
        const bookNote = document.querySelector(`.note${bookId}`);
        bookNote.classList.remove("active");
        bookItem.forEach(item => {
            item.style.display = "none";
        });
    })
});


backBtn.forEach(btn => {
    btn.addEventListener("click", (event) => {
        event.preventDefault();
        const bookId = btn.value;
        console.log(bookId);
        const editForm = document.querySelector(`.form${bookId}`);
        editForm.classList.remove("active");
        const bookNote = document.querySelector(`.note${bookId}`);
        bookNote.classList.remove("active");
        bookItem.forEach(item => {
            item.style.display = "flex";
        });
    })
});

// validating user input before sending to server to make edit
for (let i = 0; i < editBook.length; i++) {
    editBook[i].addEventListener("submit", (event) => {
        event.preventDefault();
        const allBookId = document.querySelectorAll(".book-id");
        const bookId = allBookId[i].value;
        console.log(bookId);
        const formTitle = document.querySelector(".title" + bookId);
        const formRating = document.querySelector(".rating" + bookId);
        const formIsbn = document.querySelector(".isbn" + bookId);

        if (formTitle.value.length > 100) {
            alert("Title is too long");
        } else if (formIsbn.value.length < 13 || formIsbn.value.length > 13) {
            alert("ISBN must be 13 characters");
        } else if (formRating.value > 10 || formRating.value < 1) {
            alert("Rating cannot be greater than 10 or less than 1");
        } else if (formTitle.value.length <= 100 && formIsbn.value.length == 13 && formRating.value <= 10) {
            editBook[i].action = "/edit";
            editBook[i].method = "post";
            editBook[i].submit();
        }
    });

}