import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react'
import { IikoMenu } from 'types/iiko'

interface ScrollMenuTagsProps {
    dishMenus: IikoMenu[]
    tagRefs: MutableRefObject<HTMLDivElement[]>
    activeId: string
}

export default function ScrollMenuTags(props: ScrollMenuTagsProps) {
    const [isMouseDown, setMouseDown] = useState(false)
    const [startX, setStartX] = useState(0)
    const [scrollLeft, setScrollLeft] = useState(0)

    const menuRef = useRef(null)

    const handleMouseDown = (e) => {
        setMouseDown(true)
        setStartX(e.pageX - menuRef.current.offsetLeft)
        setScrollLeft(menuRef.current.scrollLeft)
    };

    const handleMouseMove = useCallback((e) => {
        if (!isMouseDown) return
        e.preventDefault()
        const x = e.pageX - menuRef.current.offsetLeft
        const scroll = (x - startX) * 10

        // Используем requestAnimationFrame для более плавной прокрутки
        requestAnimationFrame(() => {
            menuRef.current.scrollLeft = scrollLeft - scroll
        });
    }, [isMouseDown, startX, scrollLeft]);

    const handleMouseUp = () => {
        setMouseDown(false);
    };

    const handleTagClick = (menuId) => {
        const menu = document.querySelector(`[data-menu-id="${menuId}"]`)
        if (menu) {
            console.log(menu)
            menu.scrollIntoView({ block: 'start', behavior: 'smooth' })
            // const timeout = setTimeout(() => {
            //     window.scrollBy(0, -40);
            // }, 1000);

            // return () => clearTimeout(timeout)
        }
    }

    useEffect(() => {
        const activeTagRef = props.tagRefs.current.find(ref => ref && ref.dataset.menuTagId === props.activeId.toString())
        if (activeTagRef) {
            const { left, width } = activeTagRef.getBoundingClientRect()
            const scrollContainer = menuRef.current
            const { left: scrollLeft, width: scrollWidth } = scrollContainer.getBoundingClientRect()

            if (left < scrollLeft || ((left + width > scrollLeft + scrollWidth) || left > 24)) {
                scrollContainer.scrollTo({
                    left: activeTagRef.offsetLeft - 24,
                    behavior: 'smooth',
                });
            }
        }
    }, [props.activeId, props.tagRefs]);

    return (
        <div className='menu-tags sticky no-scrollbar'
            ref={menuRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {props.dishMenus ? props.dishMenus.map(menu => menu.itemCategories.map((cat, index) => {
                if (cat.items.length > 0) {
                    return (
                        <div className={`menu-tags__item${cat.id === props.activeId ? ' active' : ''}`}
                            onClick={() => handleTagClick(cat.id.toString())}
                            data-menu-tag-id={cat.id.toString()}
                            key={index}
                            ref={el => props.tagRefs.current[index] = el}
                        >
                            {cat.name}
                        </div>
                    )
                }
            }
            ))
                : <></>}
        </div>
    )
}