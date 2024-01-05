import { useCart } from 'context/CartContext'
import Image from 'next/image'
import { ReactSVG } from 'react-svg'

interface ServiceShopCardProps {
    productId: string
    title: string
    price: number
    image: string
}

export default function ServiceShopCard(props: ServiceShopCardProps) {
    const { dispatch } = useCart()

    // Функция добавления товара в корзину


    const handleAdd = () => {
        dispatch({
            type: 'ADD_ITEM', category: 'services', item: {
                id: props.productId,
                title: props.title,
                price: props.price,
                imageUrl: props.image,
                quantity: 1,
            }
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

                <div className='room-service__add-btn' onClick={handleAdd}>
                    <ReactSVG src='/svg/plus.svg' />
                </div>
            </div>
        </div>
    </>)
}