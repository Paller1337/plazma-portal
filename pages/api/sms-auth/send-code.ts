import axios from 'axios'
import { getPortalSettings } from 'helpers/getPortalSettings'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { phoneNumber, message } = req.body

    const clientIp =
        req.headers['x-forwarded-for']?.split(',')[0] || // Если через прокси
        req.socket.remoteAddress

    if (!phoneNumber || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const smsUrl = 'https://sms.ru/sms/send';
    const phoneInt = parseInt(phoneNumber)
    const params = {
        api_id: 'C8E1F44E-0F49-7B86-8AEC-75A25B58DA29',
        to: phoneInt,
        msg: message,
        ip: clientIp,
        json: 1,
    };

    try {
        console.log({ phoneInt, message })
        console.log({ smsUrl, params })
        const portalSettings = await getPortalSettings()
        console.log({ portalSettings })

        if (portalSettings && !portalSettings.isDisableSMSAuth) {
            const response = await axios.get(smsUrl, { params })
            if (response.data.status === 'OK') {
                console.log({ status: 'sent' })
                return res.status(200).json({ success: true, data: response.data });
            } else {
                console.log({ status: 'not sent', error: response.data.status_text })
                return res.status(400).json({ success: false, error: response.data.status_text });
            }
        } else {
            return res.status(400).json({ success: false, error: 'SMS авторизация отключена' });
        }

    } catch (error) {
        console.error('Error sending SMS:', error);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}
