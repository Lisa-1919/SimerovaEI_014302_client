import React from "react";
import './header.css';
import AuthService from '../../services/auth.server';
import { useNavigate } from 'react-router-dom';
import LanguageDropdown from "../LangDropdown/LanguageDropdown";
import { useTranslation } from "react-i18next";

const Header = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const handleLogout = () => {
        AuthService.logout();
        navigate('/');
    };


    return (
        <div className="header">
            <div className='logo'>
                <a href='/home'>Logo</a>
            </div>
            <div className="user">
                <LanguageDropdown />
                <div className='link'>
                    <a href='/settings'>Settings</a>
                </div>
                <div className='logout'>
                    <button onClick={handleLogout}>logout</button>
                </div>
            </div>
        </div>
    );
};

export default Header;