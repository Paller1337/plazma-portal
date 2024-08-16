// OrderSendModal.tsx
import React, { CSSProperties, useCallback, useEffect, useState } from 'react'
import ReactModal from 'react-modal'
import Button from './Button'
import { ReactSVG } from 'react-svg'
import { useRouter } from 'next/router'
import axios from 'axios'
import { DEFAULTS } from 'defaults'

ReactModal.setAppElement('#__next') // Для Next.js обычно это #__next, для create-react-app это #root

const ProgressLine = ({ duration, index, current }) => {
    const [width, setWidth] = useState('0%');
    const [transition, setTransition] = useState('none');

    useEffect(() => {
        if (index < current) {
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
        <div className='Stories-Modal__progress-line' style={progressLineStyle}>
            <div style={progressStyle}></div>
        </div>
    );
};

const StoriesModal = ({ isOpen, onClose }) => {
    const [stories, setStories] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [duration, setDuration] = useState(0);
    const [start, setStart] = useState(false);

    useEffect(() => {
        // Загрузка данных из API
        const fetchStories = async () => {
            try {
                const response = await axios.get(DEFAULTS.STRAPI.url + '/api/stories', {
                    params: {
                        'populate': 'deep,3',
                    }
                });
                const s = response.data.data.sort((a,b) => a.id - b.id).sort((aa,bb) => bb.attributes.priority - aa.attributes.priority)
                // console.log('s ', s);
                setStories(s);
                setLoading(false);
                setStart(true); // Начать таймер после загрузки данных
            } catch (error) {
                console.error('Error fetching stories:', error);
            }
        };

        if (isOpen) {
            fetchStories();
        }
    }, [isOpen]);

    useEffect(() => {
        if (stories.length === 0 || !start) return;

        const currentStory = stories[currentIndex];
        const storyDuration = currentStory.attributes.duration * 1000;

        setDuration(storyDuration);

        const timer = setTimeout(() => {
            handleNext();
        }, storyDuration);

        return () => clearTimeout(timer);
    }, [currentIndex, stories, start]);

    const handleNext = useCallback(() => {
        setStart(false);
        setCurrentIndex((prevIndex) => {
            const nextIndex = (prevIndex + 1) % stories.length;
            if (nextIndex === 0) {
                onClose();
                return 0;
            }
            return nextIndex;
        });
        setTimeout(() => {
            setStart(true)
        }, 50)
    }, [stories.length, onClose])
    
    const handlePrev = useCallback(() => {
        if(currentIndex === 0) return
        setStart(false);
        setCurrentIndex((prevIndex) => (prevIndex - 1 + stories.length) % stories.length);
        setTimeout(() => {
            setStart(true)
        }, 50)
    }, [currentIndex, stories.length])

    const currentStory = stories[currentIndex];

    useEffect(() => {
        if (currentStory) {
            setDuration(currentStory.attributes.duration * 1000);
        }
    }, [currentStory]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!stories.length) {
        return <div>No stories available</div>;
    }

    const cleanState = () => {
        setStories([]);
        setCurrentIndex(0);
        setStart(false);
        setLoading(true);
    };

    const imageUrl = currentStory.attributes.media.data.attributes.url;

    return (
        <ReactModal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="Stories-Modal"
            overlayClassName="Overlay-Stories"
            onAfterClose={cleanState}
        >
            <div className="Stories-Modal__content">
                <div className='Stories-Modal__progress'>
                    {stories.map((story, i) => (
                        <ProgressLine
                            key={story.id}
                            current={currentIndex}
                            duration={duration}
                            index={i}
                        />
                    ))}
                </div>
                <div className='Stories-Modal__media'>
                    <img
                        src={DEFAULTS.STRAPI.url + imageUrl}
                        alt={currentStory.attributes.media.data.attributes.alternativeText || 'Story Image'}
                        className='Stories-Modal__media-img'
                    />
                </div>
                <div className='Stories-Modal__controls'>
                    <div className='Stories-Modal__controls-prev' onClick={handlePrev}></div>
                    <div className='Stories-Modal__controls-next' onClick={handleNext}></div>
                </div>
            </div>
        </ReactModal>
    );
};

export default StoriesModal