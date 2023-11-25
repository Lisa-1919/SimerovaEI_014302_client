import axios from "axios";

const API_URL = "http://localhost:8080/auth/";

class AuthService {
  login(username, password) {
    return axios
      .post(API_URL + "signin", {
        username,
        password
      })
      .then(response => {
        if (response.data.accessToken) {
          localStorage.setItem("user", JSON.stringify(response.data));
        }

        return response.data;
      });
  }

  handleUpload(file) {
    const formData = new FormData();
    formData.append('image', file);

    const user = JSON.parse(localStorage.getItem('user'));
    const token = user.accessToken;

    return axios.post(API_URL + 'upload_img', formData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => {
        return response.data;
      });
  };

  logout() {
    localStorage.removeItem("user");
  }

  register(username, email, password) {
    return axios.post(API_URL + "signup", {
      username,
      email,
      password
    });
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  changePassword(username, oldPassword, newPassword) {
    return axios
      .post(API_URL + "changepassword", {
        username,
        oldPassword,
        newPassword
      })
      .then(response => {
        return response.data;
      });
  }
  

}

export default new AuthService();