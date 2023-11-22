import React from "react";
import './header.css';
import AuthService from '../../services/auth.server';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        AuthService.logout();
        navigate('/');
      };

    return (
        <div className="header">
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