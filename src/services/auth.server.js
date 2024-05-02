import axios from "axios";
import i18n from "../18n";

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
          i18n.changeLanguage(response.data.language);
        }

        return response.data;
      });
  }


  logout() {
    // const user = JSON.parse(localStorage.getItem('user'));
    // const token = user.accessToken;

    // return axios
    //   .post(API_URL + "logout",  {
    //     headers: {
    //       'Authorization': `Bearer ${token}`,
    //     },
    //   })
    //   .then(response => {
    //     return response.data;
    //     localStorage.removeItem("user");
    //   });    
    localStorage.removeItem("user");
  }

  deleteAccount() {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user.accessToken;

    return axios
      .post(API_URL + "delete", null, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      .then(response => {
        localStorage.removeItem("user");
        return response.data;
      })
      .catch(error => {
        throw error;
      });
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
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user.accessToken;

    return axios
      .post(API_URL + "change-password", {
        username,
        oldPassword,
        newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      .then(response => {
        return response.data;
      });
  }

  sendEmail (emailTo, senderEmail, message) {
    const options = {
      method: 'POST',
      url: 'https://mail-sender-api1.p.rapidapi.com/',
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': '459c909060msh259d284d0105b54p151393jsnbb0570bf2901',
        'X-RapidAPI-Host': 'mail-sender-api1.p.rapidapi.com'
      },
      data: {
        sendto: emailTo,
        name: 'Voiceger',
        replyTo: senderEmail,
        ishtml: 'false',
        title: 'Call',
        body: message
      }
    };
  
    return axios.request(options)
      .then(response => response.data)
      .catch(error => error);
  };



  changeLanguage(username, language) {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user.accessToken;
    return axios
      .post(API_URL + "changelanguage", {
        username,
        language
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      .then(response => {
        return response.data;
      });
  }

  uploadImage(image) {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user.accessToken;
    console.log(token);
    const formData = new FormData();
    formData.append('image', image);

    return axios.post(API_URL + "upload_img", formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => {
        return response.data;
      });
  }

  saveCall(startTime, endTime) {
    console.log(startTime);
    console.log(endTime);
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