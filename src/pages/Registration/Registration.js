import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { isEmail } from "validator";
import './Registration.css';
import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/auth.server';
import LanguageDropdown from '../../components/LangDropdown/LanguageDropdown';


const Registration = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [message, setMessage] = useState('');
  const [successful, setSuccessful] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const onSubmit = (data) => {
    setMessage('');
    setSuccessful(false);

    if (Object.keys(errors).length === 0) {

      if (data.password.length < 8) {
        setMessage("Password must be at least 8 characters long.");
        return;
      }
      if (data.password !== data.password_confirm) {
        setMessage("Passwords do not match.");
        return;
      }

      AuthService.register(data.username, data.email, data.password)
        .then(
          (response) => {
            setMessage(response.data.message);
            setSuccessful(true);
            navigate('/')
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
      <LanguageDropdown />
      <form onSubmit={handleSubmit(onSubmit)}>
        {!successful && (
          <div className='registration'>
            <p>{t("registration")}</p>
            <div className='right-align'>
              <div className='inputs'>
                <div className="form-group">
                  <input
                    type="text"
                    name="username"
                    placeholder={t("login")}
                    {...register('username', { required: true })}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder={t("email")}
                    name="email"
                    {...register('email', { required: true })}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    name="password"
                    placeholder={t("password")}
                    {...register('password', { required: true })}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    name="password_confirm"
                    placeholder={t("confirm_p")}
                    {...register('password_confirm', { required: true })}
                  />
                </div>
              </div>
              <div className='link'>
                <a href='/'>{t("auth")}</a>
              </div>
            </div>
            <button className="btn">{t("sign_up")}</button>
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