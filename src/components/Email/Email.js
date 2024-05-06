import * as React from 'react';
import AuthService from '../../services/auth.server';
import { useTranslation } from "react-i18next";
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export function Email({ roomID, senderEmail, onEmailSent }) {
  const location = useLocation();
  const [emailTo, setEmail] = React.useState('');
  const [message, setMessage] = React.useState('');
  const { t } = useTranslation();
  let navigate = useNavigate();

  const sendEmail = () => {
    console.log(senderEmail);
    AuthService.sendEmail(emailTo, senderEmail,`Join the call! Room ID:${roomID}\n${message || ''}`)
      .then((response) => {
        onEmailSent(response);
        console.log(response);
      })
      .catch(error => {
        console.log(error);
      });
  };

return (
  <div style={{ backgroundColor: "white" }}>
    <div>
      <label>{t("email")}</label>
      <input type="email" value={emailTo} onChange={(e) => setEmail(e.target.value)} />
    </div>
    <div>
      <label>{t("message")}</label>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
    </div>
    <button onClick={sendEmail}>{t("send")}</button>
  </div>
);
}
