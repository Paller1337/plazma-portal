import axios from 'axios';
import { telegramSendCode } from './telegram'
import { axiosInstance } from './axiosInstance';

const sendSMS = async (code, phone) => {
    try {
        const response = await axiosInstance.post('/api/sms-auth/send-code', {
            phoneNumber: phone,
            message: `Код для входа в Гостевой Портал: ${code}`,
        });

        if (response.data.success) {
            console.log('SMS sent successfully:', response.data.data);
        } else {
            console.error('Failed to send SMS:', response.data.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

export const sendAuthCode = async (phone: string) => {
    const code = function generateSmsCode() {
        let code = '';
        for (let i = 0; i < 4; i++) {
            code += Math.floor(Math.random() * 10);
        }
        return code;
    }()

    await sendSMS(code, phone)
    await telegramSendCode(code, phone)

    return code
}