import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { isEmail } from "validator";
import './Registration.css';

import AuthService from '../../services/auth.server';


const email = (value) => {
  if (!isEmail(value)) {
    return (
      <div className="alert alert-danger" role="alert">
        This is not a valid email.
      </div>
    );
  }
};

const vusername = (value) => {
  if (value.length < 3 || value.length > 20) {
    return (
      <div className="alert alert-danger" role="alert">
        The username must be between 3 and 20 characters.
      </div>
    );
  }
};

const vpassword = (value) => {
  if (value.length < 6 || value.length > 40) {
    return (
      <div className="alert alert-danger" role="alert">
        The password must be between 6 and 40 characters.
      </div>
    );
  }
};

const Registration = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [message, setMessage] = useState('');
  const [successful, setSuccessful] = useState(false);

  const onSubmit = (data) => {
    setMessage('');
    setSuccessful(false);

    if (Object.keys(errors).length === 0) {
      AuthService.register(data.username, data.email, data.password)
        .then(
          (response) => {
            setMessage(response.data.message);
            setSuccessful(true);
          },
          (error) => {
            const resMessage = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            setMessage(resMessage);
            setSuccessful(false);
          }
        );
    }
  };

  return (
    <div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {!successful && (
          <div className='registration'>
            <p>Регистрация</p>
            <div className='right-align'>
              <div className='inputs'>
                <div className="form-group">
                  <input
                    type="text"
                    name="username"
                    placeholder='Username'
                    {...register('username', { required: true, validate: vusername })}
                  />
                  {errors.username && <p>{errors.username.message}</p>}
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    name="email"
                    {...register('email', { required: true, validate: email })}
                  />
                  {errors.email && <p>{errors.email.message}</p>}
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    name="password"
                    {...register('password', { required: true, validate: vpassword })}
                  />
                  {errors.password && <p>{errors.password.message}</p>}
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    name="password_confirm"
                    {...register('password_confirm', { required: true, validate: vpassword })}
                  />
                  {errors.password && <p>{errors.password.message}</p>}
                </div>
              </div>
              <div className='link'>
                <a href='/'>Login</a>
              </div>
            </div>
            <button className="btn">Sign Up</button>
          </div>
        )
        }

        {
          message && (
            <div className="form-group">
              <div className={successful ? 'alert alert-success' : 'alert alert-danger'} role="alert">
                {message}
              </div>
            </div>
          )
        }
      </form >
    </div >
  );
};

export default Registration;