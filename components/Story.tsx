import React, { CSSProperties, useCallback, useEffect, useRef, useState } from 'react'
import ReactModal from 'react-modal'
import { DEFAULTS } from 'defaults'
import Image from 'next/image'
import { useSwipeable } from 'react-swipeable'
ReactModal.setAppElement('#__next'); // Для Next.js обычно это #__next

const ProgressLine = ({ duration, index, current }) => {
    const [width, setWidth] = useState('0%');
    const [transition, setTransition] = useState('none');

    useEffect(() => {
        if (index < current) {
            console.log({ index, current })
            setWidth('100%');
            setTransition('none');
        } else if (index === current) {
            setWidth('0%');
            setTransition('none');
            setTimeout(() => {
                setWidth('100%');
                setTransition(`width ${duration}ms linear`);
            }, 20); // Небольшая задержка для запуска анимации
        } else {
            setWidth('0%');
            setTransition('none');
        }
    }, [current, index, duration]);

    const progressLineStyle: CSSProperties = {
        position: 'relative',
        height: '3px',
        width: '100%',
        borderRadius: '4px',
        overflow: 'hidden',
        background: '#626262',
    };

    const progressStyle: CSSProperties = {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width,
        background: '#fff',
        transition,
    };

    return (
        <div className="Stories-Modal__progress-line" style={progressLineStyle}>
            <div style={progressStyle}></div>
        </div>
    );
};

const StoriesModal = ({ isOpen, onClose, stories }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [duration, setDuration] = useState(0);
    const timerRef = useRef(null)
    const [isPaused, setIsPaused] = useState(false)

    const handlers = useSwipeable({
        onSwipedDown: eventData => {
            eventData.event.preventDefault()
            onClose()
        },
        // preventDefaultTouchmoveEvent: true,
    })

    useEffect(() => {
        if (isPaused || !isOpen || stories.length === 0) return;

        const currentStory = stories[currentIndex];
        const storyDuration = currentStory.attributes.duration * 1000;

        setDuration(storyDuration);

        // Очистка предыдущего таймера
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // Установка нового таймера
        timerRef.current = setTimeout(() => {
            handleNext();
        }, storyDuration);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [currentIndex, stories, isOpen, isPaused]);

    const handleNext = useCallback(() => {
        setCurrentIndex((prevIndex) => {
            const nextIndex = prevIndex + 1;
            if (nextIndex >= stories.length) {
                onClose();
                return 0;
            }
            return nextIndex;
        });
    }, [stories.length, onClose]);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
    }, []);

    if (!stories.length) {
        return null; // Если нет историй, не рендерим компонент
    }

    const currentStory = stories[currentIndex];
    const imageUrl = currentStory.attributes.media.data.attributes.url;

    return (
        <ReactModal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="Stories-Modal"
            overlayClassName="Overlay-Stories"
        >
            <div
                {...handlers}
                className="Stories-Modal__content"
            >
                <div className="Stories-Modal__progress">
                    {stories.map((story, i) => (
                        <ProgressLine key={story.id} current={currentIndex} duration={duration} index={i} />
                    ))}
                </div>
                <div className="Stories-Modal__media"
                    onMouseDown={() => setIsPaused(true)}
                    onMouseUp={() => setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)}
                    onTouchEnd={() => setIsPaused(false)}
                >
                    {/* <img
                        src={`${DEFAULTS.STRAPI.url}${imageUrl}`}
                        alt={
                            currentStory.attributes.media.data.attributes.alternativeText || 'Story Image'
                        }
                        className="Stories-Modal__media-img"
                    /> */}
                    <Image
                        className="Stories-Modal__media-img"
                        src={`${DEFAULTS.STRAPI.url}${imageUrl}`}
                        alt={currentStory.attributes.media.data.attributes.alternativeText || 'Story Image'}
                        layout="fill"
                        objectFit="cover"
                    />
                </div>
                <div className="Stories-Modal__controls">
                    <div className="Stories-Modal__controls-prev" onClick={handlePrev}></div>
                    <div className="Stories-Modal__controls-next" onClick={handleNext}></div>
                </div>
            </div>
        </ReactModal>
    );
};

export default StoriesModal;
