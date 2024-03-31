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

export const useFooterBottomPadding = (pb: number) => {
    useEffect(() => {
        const footer = document.getElementsByClassName('footer')[0] as HTMLDivElement
        if (footer) {
            footer.style.marginBottom = `${pb}px`;
        }
    }, [pb]); // Зависимость от pb гарантирует, что эффект сработает при его изменении
};