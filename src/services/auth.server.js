import axios from "axios";

const API_URL = "http://localhost:8080/";


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
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    })
      .then(response => {
        return response.data;
      });
  };
  

  // handleUpload(file) {
  //   const formData = new FormData();
  //   formData.append('image', file);

  //   const user = JSON.parse(localStorage.getItem('user'));
  //   const token = user.accessToken;

  //   return axios.post(API_URL + 'upload_img', formData, {
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //       "Content-Type": "multipart/form-data",
  //       credentials: true,            //access-control-allow-credentials:true
  //       optionSuccessStatus: 200,
  //     },
  //     formData
  //   })
  //     .then(response => {
  //       return response.data;
  //     });
  // };

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
      .post(API_URL + "change-password", {
        username,
        oldPassword,
        newPassword
      })
      .then(response => {
        return response.data;
      });
  }

  saveCall(callInfo) {
    console.log(callInfo);
    // const user = JSON.parse(localStorage.getItem('user'));
    // const token = user.accessToken;

    // return axios.post(API_URL + 'save-call', callInfo, {
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //   },
    // })
    //   .then(response => {
    //     return response.data;
    //   });
  }
}

export default new AuthService();