import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getPortalSettings, IPortalSettings } from 'helpers/getPortalSettings';
import Script from 'next/script';
import OrderPaymentModal from '@/components/OrderPaymentModal';

declare global {
    interface Window {
        YooMoneyCheckoutWidget?: new (options: Record<string, any>) => any;
        YooKassaWidget?: new (options: Record<string, any>) => any;
    }
}

export interface IYookassaContext {
    yooWidgetIsLoaded?: boolean
    yooWidgetIsError?: boolean
    initializeWidget?: (
        confirmationToken: string,
        returnUrl?: string
    ) => Promise<void>
    destroyWidget?: () => void;
}
interface PortalContextType {
    portalSettings?: IPortalSettings
    yookassa?: IYookassaContext;
}


const PortalContext = createContext<PortalContextType>(null!);

export const usePortal = () => useContext(PortalContext)

export const PortalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const router = useRouter();
    const [portalSettings, setPortalSettings] = useState<IPortalSettings>(null)
    const [yooWidgetIsLoaded, setYooWidgetIsLoaded] = useState<boolean>(false)
    const [yooWidgetIsError, setYooWidgetIsError] = useState<boolean>(false)
    const [checkoutInstance, setCheckoutInstance] = useState<any>(null)
    const [paymentModalIsOpen, setPaymentModalIsOpen] = useState<boolean>(false)

    useEffect(() => {
        const fetchPortalSettings = async () => {
            const ps = await getPortalSettings();
            setPortalSettings(ps);
        };
        fetchPortalSettings();
    }, [])

    // useEffect(() => {
    //     return () => {
    //         if (checkoutInstance?.destroy) {
    //             checkoutInstance.destroy()
    //             setCheckoutInstance(null)
    //         }
    //     };
    // }, [checkoutInstance])


    const initializeWidget = async (
        confirmationToken: string,
        returnUrl: string,
    ) => {
        const containerId = 'payment-form'
        if (!yooWidgetIsLoaded) {
            throw new Error('Виджет не загружен.');
        }

        // if (checkoutInstance?.destroy) {
        //     checkoutInstance.destroy(); // Удаляем предыдущий виджет
        // }

        const widget = new window.YooMoneyCheckoutWidget({
            confirmation_token: confirmationToken,
            return_url: returnUrl,
            error_callback: (error: any) => console.error('Ошибка виджета:', error),
        });

        setCheckoutInstance(widget);
        openPaymentModal()

        // if (paymentModalIsOpen) {
        //     // Отображаем платежную форму
        //     await widget.render(containerId);
        // }
        console.log('Платежная форма загружена.');
    };

    // Метод для удаления виджета
    const destroyWidget = () => {
        if (checkoutInstance?.destroy) {
            checkoutInstance.destroy();
            setCheckoutInstance(null);
        }
    }

    const openPaymentModal = () => {
        setPaymentModalIsOpen(true)
    }

    const closePaymentModal = () => {
        destroyWidget()
        setPaymentModalIsOpen(false)
    }

    const onAfterOpenPaymentModal = () => {
        checkoutInstance.render('payment-form')
    }
    return (
        <PortalContext.Provider
            value={{
                portalSettings,
                yookassa: {
                    yooWidgetIsLoaded,
                    yooWidgetIsError,
                    initializeWidget,
                    destroyWidget,
                },
            }}
        >
            <Script
                src="https://yookassa.ru/checkout-widget/v1/checkout-widget.js"
                strategy="afterInteractive"
                onLoad={() => setYooWidgetIsLoaded(true)}
                onError={() => setYooWidgetIsError(true)}
            />
            <OrderPaymentModal isOpen={paymentModalIsOpen} onClose={closePaymentModal} onAfterOpen={onAfterOpenPaymentModal} />

            {children}
        </PortalContext.Provider>
    );
};