import { telegramSendCode } from './telegram'

export const sendAuthCode = async (phone: string) => {
    const code = function generateSmsCode() {
        let code = '';
        for (let i = 0; i < 4; i++) {
            code += Math.floor(Math.random() * 10);
        }
        return code;
    }()

    await telegramSendCode(code, phone)

    return code
}