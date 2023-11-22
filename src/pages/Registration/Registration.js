import './Registration.css';
import React, { useState, useRef } from 'react';
import { isEmail } from 'validator';

// import AuthService from "../../services/auth.server";

const required = value => {
  if (!value) {
    return (
      <div className="alert alert-danger" role="alert">
        This field is required!
      </div>
    );
  }
};

const email = value => {
  if (!isEmail(value)) {
    return (
      <div role="alert">
        This is not a valid email.
      </div>
    );
  }
};

const vusername = value => {
  if (value.length < 3 || value.length > 20) {
    return (
      <div role="alert">
        The username must be between 3 and 20 characters.
      </div>
    );
  }
};

const vpassword = value => {
  if (value.length < 6 || value.length > 40) {
    return (
      <div role="alert">
        The password must be between 6 and 40 characters.
      </div>
    );
  }
};
const vpasswordConfirm = (password, value) => {
  if (password !== value) {
    return (
      <div role="alert">
        The passwordConfirm must be equal password.
      </div>
    );
  }
};

function Registration() {
  const form = useRef();
  const checkBtn = useRef();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const handleRegister = (e) => {
    // register logic

    if (checkBtn.current.context._errors.length === 0) {

      console.log(username, email, password, passwordConfirm);
      // AuthService.register(username, email, password)
      //   .then(() => {
      //     // success callback
      //   })
      //   .catch(() => {
      //     // error callback 
      //   });
    }
  }

  return (
    <div className='page'>
      <div className='registration'>
        <h1>Registration</h1>
        <div className='right-align'>
          <div className='inputs'>
            <input
              type="text"
              className="form-control"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type='email'
              className="form-control"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              className="form-control"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              className="form__input"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Confirm Password" />
          </div>
          <div className='link'>
            <a href='/login'>Login</a>
          </div>
        </div>
        <div>
          <button onClick={() => handleRegister()}
           type="submit" class="btn">Sign up</button>
        </div>
      </div>
    </div>
  )
}
export default Registration;
