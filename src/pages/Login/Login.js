import AuthService from '../../services/auth.server';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import '../Registration/Registration.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import LanguageDropdown from '../../components/LangDropdown/LanguageDropdown';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [message, setMessage] = useState('');
  const [successful, setSuccessful] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

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
      <LanguageDropdown/>
      <form onSubmit={handleSubmit(onSubmit)}>
        {!successful && (
          <div className='registration'>
            <p>{t("auth")}</p>
            <div className='right-align'>
              <div className='inputs'>
                <div className="form-group">
                  <input
                    type="text"
                    name="username"
                    placeholder={t("login")}
                    {...register('username', { required: true })}
                  />
                  {errors.username && <p>{errors.username.message}</p>}
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    name="password"
                    placeholder={t("password")}
                    {...register('password', { required: true })}
                  />
                  {errors.password && <p>{errors.password.message}</p>}
                </div>
              </div>
              <div className='link'>
                <a href='/registration'>{t("registration")}</a>
              </div>
            </div>
            <button className="btn">{t("sign_in")}</button>
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
