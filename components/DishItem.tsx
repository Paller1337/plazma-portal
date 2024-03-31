import { useCart } from 'context/CartContext'
import toast from 'react-hot-toast'
import { ReactSVG } from 'react-svg'
import { IikoMenuItem } from 'types/iiko'


interface DishItemProps {
    item: IikoMenuItem
}
export default function DishItem(props: DishItemProps) {
    const { dispatch } = useCart()
    // Функция добавления товара в корзину

    const handleAdd = () => {
        if (props.item.itemSizes[0].prices[0].price !== 0) {
            dispatch({
                type: 'ADD_ITEM', category: 'food', item: {
                    id: props.item.itemId,
                    title: props.item.name,
                    price: props.item.itemSizes[0].prices[0].price || 0,
                    imageUrl: props.item.itemSizes[0].buttonImageUrl,
                    quantity: 1,
                }
            })
        } else{
            toast.error('Ошибка')
        }
    }


    return (
        <div className='menu-item' key={props.item.itemId}>
            <div className='menu-item__image'>
                {props.item.itemSizes[0].buttonImageUrl ?
                    <img src={props.item.itemSizes[0].buttonImageUrl} alt='' />
                    : <></>}
            </div>

            <div className='menu-item__info'>
                <span className='menu-item__title'>{props.item.name}</span>
                <div className='menu-item__footer'>
                    <span className='menu-item__price'>{props.item.itemSizes[0].prices[0].price || 0} ₽</span>
                    <div className='menu-item__btn' onClick={handleAdd}>
                        <ReactSVG src='/svg/plus.svg' />
                    </div>

                </div>
            </div>
        </div>
    )
}