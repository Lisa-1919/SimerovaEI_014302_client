import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from "react-i18next";
import authServer from '../../services/auth.server';
import Header from '../../components/Header/header';
import './settings.css';

const Settings = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [message, setMessage] = useState('');
    const [successful, setSuccessful] = useState(false);
    const { t } = useTranslation();
    const user = authServer.getCurrentUser();

    const onSubmit = (data) => {
        setMessage(data.message);
        setSuccessful(false);

        if (Object.keys(errors).length === 0) {
            authServer.changePassword(user.username, data.oldPassword, data.newPassword)
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
            <Header />
            <div className='settings'>
                <form onSubmit={handleSubmit(onSubmit)}>
                    {!successful && (
                        <div className='change-password'>
                            <p>{t("change-password")}</p>
                            <div>
                                <input
                                    type="password"
                                    id="oldPassword"
                                    placeholder={t("old-password")}
                                    {...register("oldPassword", { required: true })}
                                />
                                {errors.oldPassword && <span>{t("old-password-required")}</span>}
                            </div>
                            <div>
                                <input
                                    type="password"
                                    id="newPassword"
                                    placeholder={t("new-password")}
                                    {...register("newPassword", { required: true })}
                                />
                                {errors.newPassword && <span>{t("new-password-required")}</span>}
                            </div>
                            <button className="btn">{t("save")}</button>
                        </div>
                    )}
                </form>
                {message && (
                    <div className={successful ? "success-message" : "error-message"}>
                        {message}
                    </div>
                )}
            </div>
        </div>

    );
};

export default Settings;
