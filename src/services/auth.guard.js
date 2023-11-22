import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthService from './auth.server';

const AuthGuard = () => {

  const currentUser = AuthService.getCurrentUser();

  return currentUser ? <Outlet /> : <Navigate to={'/'} replace />;
};

export default AuthGuard;
