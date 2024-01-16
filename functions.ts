import { useEffect } from 'react'
import { useRouter } from 'next/router'

export const getWordEnding = (count) => {
    if (count % 10 === 1 && count % 100 !== 11) {
        return 'я'
    } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
        return 'и'
    } else {
        return 'й'
    }
}

export const useResetZoom = () => {
    const router = useRouter();

    useEffect(() => {
        const handleRouteChange = () => {
            if ('visualViewport' in window) {
                const resetZoom = () => {
                    if (window.visualViewport.scale > 1) {
                        document.body.style.setProperty('zoom', String(1 / window.visualViewport.scale));
                    } else {
                        document.body.style.removeProperty('zoom');
                    }
                };

                window.visualViewport.addEventListener('resize', resetZoom);

                // Удаляем обработчик при размонтировании
                return () => window.visualViewport.removeEventListener('resize', resetZoom);
            }
        };

        router.events.on('routeChangeComplete', handleRouteChange);

        // Удаляем обработчик при размонтировании
        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
        };
    }, [router.events]);
};
