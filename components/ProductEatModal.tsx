import React, { useEffect } from 'react'
import ReactModal from 'react-modal'
import Button from './Button'
import { ReactSVG } from 'react-svg'
import { useRouter } from 'next/router'
import { DEFAULTS } from 'defaults'
import { useCart } from 'context/CartContext'
import { ItemMenuV2 } from 'helpers/iiko/IikoApi/types'
import { Image } from '@mantine/core'

ReactModal.setAppElement('#__next'); // Для Next.js обычно это #__next, для create-react-app это #root

interface IProps {
    isOpen: boolean,
    onClose: () => void,
    storeId?: string,
    product?: ItemMenuV2
}


const ProductEatModal = (props: IProps) => {
    const router = useRouter()
    const { dispatch, state } = useCart()

    const addToCart = () => {
        dispatch({
            type: 'ADD_ITEM',
            storeId: props.storeId,
            item: {
                id: props.product.itemId.toString(),
                quantity: 1
            },
        });
    };

    const handleAddToCart = () => {
        addToCart()
        props.onClose()
    }

    
    const price = props.product?.itemSizes[0].prices[0].price
    const itemData = props.product?.itemSizes[0]

    return (
        <ReactModal
            isOpen={props.isOpen}
            onRequestClose={props.onClose}
            className="Product-Modal"
            overlayClassName="Overlay"
        // shouldCloseOnOverlayClick={false}
        >
            <div className="Product-Modal__content">
                <div className='Product-Modal__image'>
                    <Image src={`${itemData?.buttonImageUrl}`} alt='' fallbackSrc='/images/fallback.png' />
                </div>
                <ReactSVG color='#fff' className='Product-Modal__close' src='/svg/modal-close.svg' onClick={props.onClose} />

                <div className='Product-Modal__info'>
                    {/* {props.product?.memo_text ? <span className='Product-Modal__info-memo'>{props.product?.memo_text}</span> : <></>} */}
                    {props.product?.name ? <span className='Product-Modal__info-title'>{props.product?.name}</span> : <></>}
                    {/* {props.product?.warning_text ? <span className='Product-Modal__info-warning_text'>{props.product?.warning_text}</span> : <></>} */}
                    {props.product?.description ? <span className='Product-Modal__info-description'>{props.product?.description}</span> : <></>}
                    {price && price > 0 ? <span className='Product-Modal__info-price'>{price} руб.</span> : <></>}
                </div>
                <div className="Product-Modal__actions">
                    <Button text='Добавить' stretch bgColor='#56754B' color='#fff' onClick={handleAddToCart} />
                </div>
            </div>
        </ReactModal>
    );
};

export default ProductEatModal
