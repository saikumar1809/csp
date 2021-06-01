import "@babel/polyfill";
// import { login } from "../../controllers/viewController";
import { signup } from "./signup";
import { login } from "./login";
//DOM ELEMENTS
const donarSignupForm = document.querySelector(".registerBtn");
const loginForm = document.querySelector(".loginBtn");
//VALUES

if (donarSignupForm) {
  donarSignupForm.addEventListener("click", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;
    const conformPassword = document.getElementById("conformPassword").value;
    signup(name, email, phone, password, conformPassword);
  });
}
if (loginForm) {
  loginForm.addEventListener("click", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login(email, password);
  });
}
