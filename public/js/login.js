/* eslint-disable */
import axios from "axios";
import { showAlert } from "./alerts";

export const login = async (email, password) => {
  let url = "";
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/users/login",
      data: {
        email,
        password,
      },
    });
    console.log(res);

    if (res.data.status === "success") {
      showAlert("success", "Logged in successfully!");
      if (res.data.data.user.role === "student") {
        url = "/api/v1/users/student";
      } else if (res.data.data.user.role === "cohort-lead") {
        url = "/api/v1/users/cohortLead";
      } else if (res.data.data.user.role === "mentor") {
        url = "/api/v1/users/mentor";
      } else if (res.data.data.user.role === "donor") {
        url = "/api/v1/users/donor";
      } else if (res.data.data.user.role === "coordinator") {
        url = "/api/v1/users/coordinator";
      }
      window.setTimeout(() => {
        console.log(url);
        location.assign(url);
      }, 1500);
    }
  } catch (err) {
    // alert(err.response);
    // console.error(response);
    // console.log(err.response.data);
    // showAlert("error", err.response.data.message);
    showAlert("error", "Invalid email or password");
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: "GET",
      url: "/api/v1/users/logout",
    });
    if (res.data.status === "success") location.replace("/");
  } catch (err) {
    console.log(err.response.data);
    showAlert("error", "Error logging out! Try again.");
  }
};
