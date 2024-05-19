const writeBtn = document.querySelector(".write-btn");
const gbForm = document.getElementById("gb-form");
const welcome = document.getElementById("welcome");
const bookForm = document.querySelector(".book-form");
const formTitle = document.querySelector(".title");
const formIsbn = document.querySelector(".isbn");
const formRating = document.querySelector(".rating");

writeBtn.addEventListener("click", function () {
    gbForm.classList.toggle("active");
    welcome.classList.add("hidden");
})

// validating user input before sending to server
bookForm.addEventListener("submit", (event) => {
    event.preventDefault();
    
    if (formTitle.value.length > 100) {
        alert("Title is too long");
    } else if (formIsbn.value.length < 13 || formIsbn.value.length > 13) {
        alert("ISBN must be 13 characters");
    } else if (formRating.value > 10 || formRating.value < 1) {
        alert("Rating cannot be greater than 10 or less than 1");
    } else if (formTitle.value.length <= 100 && formIsbn.value.length == 13 && formRating.value <= 10) {
        bookForm.action = "/note";
        bookForm.method = "post";
        bookForm.submit();
    }
});