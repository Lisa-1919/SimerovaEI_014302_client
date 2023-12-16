import * as React from 'react';
import axios from 'axios';
import { useTranslation } from "react-i18next";
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


export function Email() {
    const location = useLocation();
    const { senderEmail, roomID } = location.state;
    const [emailTo, setEmail] = React.useState('');
    const [message, setMessage] = React.useState('');
    const { t } = useTranslation();
    let navigate = useNavigate();

  const sendEmail = async () => {
    const options = {
      method: 'POST',
      url: 'https://rapidprod-sendgrid-v1.p.rapidapi.com/mail/send',
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': '459c909060msh259d284d0105b54p151393jsnbb0570bf2901',
        'X-RapidAPI-Host': 'rapidprod-sendgrid-v1.p.rapidapi.com'
      },
      data: {
        personalizations: [
          {
            to: [
              {
                email: emailTo
              }
            ],
            subject: 'Voicager'
          }
        ],
        from: {
          email: senderEmail
        },
        content: [
          {
            type: 'text/plain',
            value: `Join the call! Room ID:${roomID}\n${message || ''}`
          }
        ]
      }
    };
    console.log(senderEmail);
    console.log(options.data.content);

    try {
      const response = await axios.request(options);
      navigate('/room');
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
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
