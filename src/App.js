import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Main from './pages/Main/Main';
import Room from './pages/Room/Room';
import NotFound404 from './pages/NotFound404/NotFound404';
import Registration from './pages/Registration/Registration';
import Login from './pages/Login/Login';
import AuthGuard from './services/auth.guard';
import { I18nextProvider } from 'react-i18next';
import i18n from './18n';
import Settings from './pages/Settings/Settings';

function App() {
  return (
    <div>
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          <Routes>
            <Route exact path="/" element={<Login />} />
            <Route exact path="/registration" element={<Registration />} />
            <Route element={<AuthGuard />}>
              <Route exact path="/room/:id" element={<Room />} />
              <Route exact path="/settings" element={<Settings />} />
              <Route exact path="/home" element={<Main />} />
            </Route>
            <Route path='*' element={<NotFound404 />} />
          </Routes>
        </I18nextProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
