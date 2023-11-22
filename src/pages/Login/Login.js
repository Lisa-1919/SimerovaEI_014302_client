import AuthService from '../../services/auth.server';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import '../Registration/Registration.css';
import { useNavigate } from 'react-router-dom';


const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [message, setMessage] = useState('');
  const [successful, setSuccessful] = useState(false);
  const navigate = useNavigate();

  const onSubmit = (data) => {
    setMessage('');
    setSuccessful(false);

    if (Object.keys(errors).length === 0) {
      AuthService.login(data.username, data.password)
        .then(() => {
          navigate('/home');
        })
        .catch((error) => {
          const resMessage =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString();
          setMessage(resMessage);
          setSuccessful(false);
        });
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {!successful && (
          <div className='registration'>
            <p>Login</p>
            <div className='right-align'>
              <div className='inputs'>
                <div className="form-group">
                  <input
                    type="text"
                    name="username"
                    placeholder='Username'
                    {...register('username', { required: true })}
                  />
                  {errors.username && <p>{errors.username.message}</p>}
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    name="password"
                    {...register('password', { required: true })}
                  />
                  {errors.password && <p>{errors.password.message}</p>}
                </div>
              </div>
              <div className='link'>
                <a href='/registration'>Register</a>
              </div>
            </div>
            <button className="btn">Sign In</button>
          </div>
        )}
        {message && (
          <div className="form-group">
            <div className={successful ? 'alert alert-success' : 'alert alert-danger'} role="alert">
              {message}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default Login;
