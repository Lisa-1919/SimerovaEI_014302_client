import * as React from 'react';
import AuthService from '../../services/auth.server';
import { useTranslation } from "react-i18next";
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { IoRocketSharp } from "react-icons/io5";
import "./email.scss";

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
  <div className="email-form">
    <div className="email-to">
      <input type="email" value={emailTo} onChange={(e) => setEmail(e.target.value)} placeholder={t("email_to")}/>
    </div>
    <div className="message">
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t("message")}/>
    </div>
    <button className='btn-send-email' onClick={sendEmail}>
          <IoRocketSharp className='icon-send' />
        </button>
  </div>
);
}
