import { Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import Image from 'next/image'

interface PromoSliderProps {
    slides?: {
        title: string
        desc: string
        img: string
        btn?: {
            name: string
            link: string
        }
    }[]
}

export default function PromoSlider(props: PromoSliderProps) {
    return (<>
        <Swiper
            {...({
                spaceBetween: 0,
                slidesPerView: 1,
                modules: [Pagination],
                pagination: {
                    clickable: true,
                    type: 'bullets',
                },
            } as any)}
        >
            {props.slides.map((x, i) =>
                <SwiperSlide key={'col-img-' + x.img}>
                    <div className='promo-slider__slide'>
                        <div className='promo-slider__dark_opacity' />
                        <div className='promo-slider__dark_opacity-gradient' />
                        <div className='promo-slider__content'>
                            <span className='promo-slider__title'>{x.title}</span>
                            <span className='promo-slider__desc'>{x.desc}</span>
                        </div>

                        <Image className='promo-slider__image' src={x.img} height={382} width={220} alt='' />
                    </div>
                </SwiperSlide>
            )}
        </Swiper>
    </>)
}