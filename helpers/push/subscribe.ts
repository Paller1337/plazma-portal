const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
};

export const useSubscribe = ({ publicKey }) => {
    const getSubscription = async () => {
        try {
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                throw { errorCode: "ServiceWorkerAndPushManagerNotSupported" };
            }

            const registration = await navigator.serviceWorker.ready;

            if (!registration.pushManager) {
                throw { errorCode: "PushManagerUnavailable" };
            }

            const existingSubscription = await registration.pushManager.getSubscription();

            if (existingSubscription) {
                throw { errorCode: "ExistingSubscription" };
            }

            const convertedVapidKey = urlBase64ToUint8Array(publicKey);

            const resReg = await registration.pushManager.subscribe({
                applicationServerKey: convertedVapidKey,
                userVisibleOnly: true,
            });

            console.log('resReg: ', resReg)
            return resReg
        } catch (error) {
            console.error('Subscription failed: ', error)
            throw error
        }
    };


    return { getSubscription }
}