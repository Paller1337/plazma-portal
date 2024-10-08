import { useCart } from 'context/CartContext'
import { DEFAULTS } from 'defaults'
import Image from 'next/image'
import { ReactSVG } from 'react-svg'

interface OrderItemPorps {
    productId: string
    storeId: string
    title: string
    desc: string
    image: string
    count: number
    category: 'services' | 'food'
}


export default function OrderItem(props: OrderItemPorps) {
    const { dispatch } = useCart()

    const handleRemove = () => {
        dispatch({ type: 'REMOVE_ITEM', storeId: props.storeId, itemId: props.productId })
    }

    const incrementQuantity = () => {
        dispatch({ type: 'UPDATE_QUANTITY', storeId: props.storeId, itemId: props.productId, quantity: props.count + 1 })
    };

    const decrementQuantity = () => {
        if (props.count > 1) {
            dispatch({ type: 'UPDATE_QUANTITY', storeId: props.storeId, itemId: props.productId, quantity: props.count - 1 })
        }
    }

    return (
        <div className='order-item'>
            <div className='order-item__meta'>
                <Image className='order-item__image' width={60} height={60}
                    src={props.image ? props.image : '/images/no-photo-60x60.png'} alt=''
                />
                <div className='order-item__col'>
                    <span className='order-item__title'>{props.title ? props.title : 'Без названия'}</span>
                    <span className='order-item__desc'>{props.desc}</span>
                </div>
            </div>

            <div className='order-item__actions'>
                <div className='order-item__counter'>
                    <div className='order-item__counter-buttons'>
                        <ReactSVG className='order-item__counter-button' src='/svg/plus-dark.svg' onClick={incrementQuantity} />
                        <ReactSVG className='order-item__counter-button' src='/svg/minus-dark.svg' onClick={decrementQuantity} />
                    </div>
                    <div className='order-item__count'>
                        {props.count ? props.count : 1}
                    </div>
                </div>
                <ReactSVG className='order-item__delete' src='/svg/close-x48.svg' onClick={handleRemove} />
            </div>
        </div>
    )
}