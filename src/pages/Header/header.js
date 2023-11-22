import React from "react";
import './header.css';
import AuthService from '../../services/auth.server';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";

const Header = () => {
    const navigate = useNavigate();
    const{t, i18n} = useTranslation();

    const handleLogout = () => {
        AuthService.logout();
        navigate('/');
      };

      const changeLanguage = (language) => {
        i18n.changeLanguage(language);
      }

    return (
        <div className="header">
            <button onClick={()=>changeLanguage("en")}>En</button>
            <button onClick={()=>changeLanguage("ru")}>Ru</button>
            <div className='link'>
                <a href='/home'>Logo</a>
            </div>
            <div className='link'>
                <a href='/profile'>Profile</a>
            </div>
            <div className='logout'>
                <button onClick={handleLogout}>logout</button>
            </div>
        </div>
    );
};

export default Header;