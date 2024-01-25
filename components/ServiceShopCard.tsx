import { useCart } from 'context/CartContext'
import { DEFAULTS } from 'defaults'
import Image from 'next/image'
import { useEffect } from 'react'
import { ReactSVG } from 'react-svg'
import { ServiceImage } from 'types/services'

interface ServiceShopCardProps {
    productId: string
    title: string
    price: number
    image: ServiceImage[]
}

export default function ServiceShopCard(props: ServiceShopCardProps) {
    const { dispatch } = useCart()
    const image = props.image && props.image.length > 0 ? props.image[0].attributes : {
        height: 120,
        width: 120,
        url: '/images/room-services/not-found.png'
    }

    const imageUrl = DEFAULTS.STRAPI_URL.prod + image.url
    // Функция добавления товара в корзину

    useEffect(() => {
        console.log(props.image)
    }, )
    const handleAdd = () => {
        dispatch({
            type: 'ADD_ITEM', category: 'services', item: {
                id: props.productId,
                title: props.title,
                price: props.price,
                imageUrl: imageUrl,
                quantity: 1,
            }
        })
    }


    return (<>
        <div className='room-service'>
            <div className='room-service__name'>
                {props.title}
            </div>
            <Image className='room-service__image' src={imageUrl} height={image.height} width={image.width} alt='' unoptimized={true} />
            <div className='room-service__footer'>
                <span className='room-service__price'>
                    {props.price} руб.
                </span>

                <div className='room-service__add-btn' onClick={handleAdd}>
                    <ReactSVG src='/svg/plus.svg' />
                </div>
            </div>
        </div>
    </>)
}