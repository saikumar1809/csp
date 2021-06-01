import axios from "axios";
import { showAlert } from "./alerts";

export const signup = async (
  name,
  email,
  phoneNo,
  password,
  passwordConfirm
) => {
  console.log(email, password);
  const role = "donar";
  try {
    const res = await axios({
      method: "POST",
      url: "http://127.0.0.1:8000/api/v1/users/signup",
      data: {
        name,
        email,
        role,
        phoneNo,
        password,
        passwordConfirm,
      },
    });

    if (res.data.status === "success") {
      showAlert("success", "team CSP welcomes you!");

      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
    console.log(res);
  } catch (err) {
    showAlert("error", err.response.data.message);
    console.log(err.response);
  }
};
