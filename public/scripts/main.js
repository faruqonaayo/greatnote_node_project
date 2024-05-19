const toggleBtn = document.querySelector(".toggle-btn");
const navMenu = document.querySelector(".gn-navmenu");

toggleBtn.addEventListener("click", function () {
    toggleBtn.classList.toggle("active");
    navMenu.classList.toggle("active");
})

