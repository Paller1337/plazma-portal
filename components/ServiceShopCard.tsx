import { useCart } from 'context/CartContext'
import Image from 'next/image'
import { ReactSVG } from 'react-svg'

interface ServiceShopCardProps {
    title: string
    price: number
    image: string
}

export default function ServiceShopCard(props: ServiceShopCardProps) {
    const { dispatch } = useCart()

    // Функция добавления товара в корзину
    const addToCart = () => {
        dispatch({
            type: 'ADD_ITEM',
            item: {
                title: props.title,
                price: props.price,
                image: props.image,
                quantity: 1, // Предполагаем, что добавляем с единицей товара
            },
        })
    }

    return (<>
        <div className='room-service'>
            <div className='room-service__name'>
                {props.title}
            </div>
            <Image className='room-service__image' src={props.image} height={120} width={120} alt='' unoptimized={true} />
            <div className='room-service__footer'>
                <span className='room-service__price'>
                    {props.price} руб.
                </span>

                <div className='room-service__add-btn' onClick={addToCart}>
                    <ReactSVG src='/svg/plus.svg' />
                </div>
            </div>
        </div>
    </>)
}