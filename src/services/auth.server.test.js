import axios from 'axios';
import AuthService from './auth.server';

jest.mock('axios');

describe('AuthService', () => {
  test('should send an email with the correct data', async () => {
    const emailTo = 'recipient@example.com';
    const senderEmail = 'sender@example.com';
    const message = 'Hello, this is a test email!';

    const expectedOptions = {
      method: 'POST',
      url: 'https://mail-sender-api1.p.rapidapi.com/',
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': '459c909060msh259d284d0105b54p151393jsnbb0570bf2901',
        'X-RapidAPI-Host': 'mail-sender-api1.p.rapidapi.com'
      },
      data: {
        sendto: emailTo,
        name: 'Voiceger',
        replyTo: senderEmail,
        ishtml: 'false',
        title: 'Call',
        body: message
      }
    };

    const expectedResponse = { status: 'success' };

    axios.request.mockResolvedValueOnce({ data: expectedResponse });

    const response = await AuthService.sendEmail(emailTo, senderEmail, message);

    expect(axios.request).toHaveBeenCalledWith(expectedOptions);
    expect(response).toEqual(expectedResponse);
  });
});
