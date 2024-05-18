import React, {useContext} from "react";
import './header.css';
import AuthService from '../../services/auth.server';
import { useNavigate } from 'react-router-dom';
import LanguageDropdown from "../LangDropdown/LanguageDropdown";
import { useTranslation } from "react-i18next";
import { RxExit } from "react-icons/rx";
import {ThemeContext, themes} from '../../contexts/ThemeContext';
import Toggle from '../Toggle/Toggle';


const Header = () => {
    const navigate = useNavigate();
    const { t} = useTranslation();
    
    const handleLogout = () => {
        AuthService.logout();
        navigate('/');
    };
    const { theme, setTheme } = useContext(ThemeContext);
    const toggleTheme = () => {
        setTheme(theme === themes.dark ? themes.light : themes.dark);
    };


    return (
        <div className="header">
            <div className='logo'>
                <a href='/home'>Voicager</a>
            </div>
            <div className="user">
            <Toggle value={theme === themes.dark} onChange={toggleTheme} className="toggle"/>
                <LanguageDropdown />
                <div className='link'>
                    <a href='/settings'>{t("settings")}</a>
                </div>
                <div className='logout'>
                    <button onClick={handleLogout} className="btn-logout"><RxExit className="icon"/></button>
                </div>
            </div>
        </div>
    );
};

export default Header;