import { useEffect, useState } from 'react';

function useIsPwa() {
    const [isPwa, setIsPwa] = useState<boolean>(false)

    useEffect(() => {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
            ('standalone' in window.navigator && (window.navigator as any).standalone as boolean)
        
        setIsPwa(isStandalone)
    }, [])

    return isPwa
}

export default useIsPwa;
