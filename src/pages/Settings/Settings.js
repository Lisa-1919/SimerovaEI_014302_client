import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from "react-i18next";
import AuthService from '../../services/auth.server';
import Header from '../../components/Header/header';
import './settings.scss';
import i18n from '../../18n';
import LanguageDropdown from '../../components/LangDropdown/LanguageDropdown';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';

const Settings = () => {
    const { register: passwordRegister, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors } } = useForm();
    const { register: languageRegister, handleSubmit: handleLanguageSubmit, formState: { errors: languageErrors } } = useForm();
    const [passwordMessage, setPasswordMessage] = useState('');
    const [passwordSuccessful, setPasswordSuccessful] = useState(false);
    const [languageMessage, setLanguageMessage] = useState('');
    const [languageSuccessful, setLanguageSuccessful] = useState(false);
    const { t } = useTranslation();
    const user = AuthService.getCurrentUser();
    const navigate = useNavigate();
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [userInput, setUserInput] = useState('');
    const confirmationPhrase = `${user.username}-delete`;


    const onChangePassword = (data) => {
        setPasswordMessage('');
        setPasswordSuccessful(false);

        if (Object.keys(passwordErrors).length === 0) {
            AuthService.changePassword(user.username, data.oldPassword, data.newPassword)
                .then(
                    (response) => {
                        setPasswordMessage(data.message);
                        setPasswordSuccessful(true);
                    },
                    (error) => {
                        const resMessage = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
                        setPasswordMessage(resMessage);
                        setPasswordSuccessful(false);
                    }
                );
        }
    };

    const onChangeLanguage = (data) => {
        setLanguageMessage('');
        setLanguageSuccessful(false);
        const selectedLanguage = i18n.language;
        if (Object.keys(languageErrors).length === 0) {
            AuthService.changeLanguage(user.username, selectedLanguage)
                .then(
                    (response) => {
                        setLanguageMessage(data.message);
                        setLanguageSuccessful(true);
                    },
                    (error) => {
                        const resMessage = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
                        setLanguageMessage(resMessage);
                        setLanguageSuccessful(false);
                    }
                );
        }
    };

    const onDeleteAccount = () => {
        if (userInput === confirmationPhrase) {
            AuthService.deleteAccount()
                .then(
                    (response) => {
                        navigate("/");
                    },
                    (error) => {
                        const resMessage = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
                        setPasswordMessage(resMessage);
                        setPasswordSuccessful(false);
                    }
                );
        } else {
            alert('Confirmation phrase does not match. Account deletion canceled.');
        }
        setModalIsOpen(false);
    };

    const openModal = () => {
        setModalIsOpen(true);
    };

    return (
        <div>
            <Header />
            <div className='settings'>
                <div className='block'>
                    <form onSubmit={handlePasswordSubmit(onChangePassword)}>
                        <div className='change-password'>
                            <p>{t("change-password")}</p>
                            <div>
                                <input
                                    type="password"
                                    id="oldPassword"
                                    className="input"
                                    placeholder={t("old-password")}
                                    {...passwordRegister("oldPassword", { required: true })}
                                />
                                {passwordErrors.oldPassword && <span>{t("old-password-required")}</span>}
                            </div>
                            <div>
                                <input
                                    type="password"
                                    id="newPassword"
                                    className="input"
                                    placeholder={t("new-password")}
                                    {...passwordRegister("newPassword", { required: true })}
                                />
                                {passwordErrors.newPassword && <span>{t("new-password-required")}</span>}
                            </div>
                            <button className="btn">{t("save")}</button>
                        </div>
                        {passwordMessage && (
                            <div className={passwordSuccessful ? "success-message" : "error-message"}>
                                {passwordMessage}
                            </div>
                        )}
                    </form>
                </div>

                <div className='block'>
                    <form onSubmit={handleLanguageSubmit(onChangeLanguage)}>
                        <div className='change-password'>
                            <p>{t("select_lang")}</p>
                            <div>
                                <LanguageDropdown {...languageRegister("language")} />
                            </div>
                            <button className="btn">{t("save")}</button>
                        </div>
                        {languageMessage && (
                            <div className={languageSuccessful ? "success-message" : "error-message"}>
                                {languageMessage}
                            </div>
                        )}
                    </form>
                </div>
                <div className='block'>
                    <button className='btn' onClick={openModal}>{t("delete")}</button>
                </div>
                <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)}
                    className="Modal"
                    overlayClassName="Overlay"
                >
                    <h2>Please type the confirmation phrase to delete your account:</h2>
                    <input
                        type="text"
                        className="input"
                        placeholder={confirmationPhrase}
                        value={userInput}
                        onChange={e => setUserInput(e.target.value)}
                    />
                    <button onClick={onDeleteAccount} className="btn">Confirm</button>
                    <button onClick={() => setModalIsOpen(false)} className="btn">Cancel</button>
                </Modal>
            </div>
        </div>
    );
};

export default Settings;
