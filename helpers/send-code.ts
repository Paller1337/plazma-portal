import axios from 'axios';
import { telegramSendCode } from './telegram'
import { axiosInstance } from './axiosInstance';

const sendSMS = async (code, phone, isDebug) => {
    try {
        const response = await axiosInstance.post('/api/sms-auth/send-code', {
            phoneNumber: phone,
            message: `Код для входа в Гостевой Портал: ${code}`,
        });

        if (response.data.success) {
            if (isDebug) console.log('SMS sent successfully:', response.data.data);
        } else {
            if (isDebug) console.error('Failed to send SMS:', response.data.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

export const sendAuthCode = async (phone: string, isDebug) => {
    const code = function generateSmsCode() {
        let code = '';
        for (let i = 0; i < 4; i++) {
            code += Math.floor(Math.random() * 10);
        }
        return code;
    }()

    await sendSMS(code, phone, isDebug)
    await telegramSendCode(code, phone)

    return code
}