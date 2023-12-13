import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { isEmail } from "validator";
import './Registration.css';
import { useTranslation } from "react-i18next";

import AuthService from '../../services/auth.server';
import LanguageDropdown from '../../components/LangDropdown/LanguageDropdown';


const email = (value) => {
  if (!isEmail(value)) {
    return (
      <div className="alert alert-danger" role="alert">
        {/* {t("v_email")} */}
      </div>
    );
  }
};

const vusername = (value) => {
  if (value.length < 3 || value.length > 20) {
    return (
      <div className="alert alert-danger" role="alert">
        {/* {t("v_login")} */}
      </div>
    );
  }
};

const vpassword = (value) => {
  if (value.length < 6 || value.length > 40) {
    return (
      <div className="alert alert-danger" role="alert">
        {/* {t("v_password")} */}
      </div>
    );
  }
};

const vpassword_confirm = (value) => {
  if (value.length < 6 || value.length > 40) {
    return (
      <div className="alert alert-danger" role="alert">
        {/* {t("v_confirm_p")} */}
      </div>
    );
  }
};

const Registration = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [message, setMessage] = useState('');
  const [successful, setSuccessful] = useState(false);
  const { t, i18n } = useTranslation();

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
      <LanguageDropdown/>
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
                    {...register('username', { required: true, validate: vusername })}
                  />
                  {errors.username && <p>{errors.username.message}</p>}
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    placeholder={t("email")}
                    name="email"
                    {...register('email', { required: true, validate: email })}
                  />
                  {errors.email && <p>{errors.email.message}</p>}
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    name="password"
                    placeholder={t("password")}
                    {...register('password', { required: true, validate: vpassword })}
                  />
                  {errors.password && <p>{errors.password.message}</p>}
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    name="password_confirm"
                    placeholder={t("confirm_p")}
                    {...register('password_confirm', { required: true, validate: vpassword })}
                  />
                  {errors.password && <p>{errors.password.message}</p>}
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