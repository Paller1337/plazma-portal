import React, { useEffect } from 'react'
import ReactModal from 'react-modal'
import Button from './Button'
import { ReactSVG } from 'react-svg'
import { useRouter } from 'next/router'
import { DEFAULTS } from 'defaults'
import { useCart } from 'context/CartContext'
import { ItemCategory, ItemMenuV2, Product } from 'helpers/iiko/IikoApi/types'
import { Image } from '@mantine/core'
import { IStoreStatus } from 'utils/storeStatus'

ReactModal.setAppElement('#__next'); // Для Next.js обычно это #__next, для create-react-app это #root

interface IProps {
    isOpen: boolean,
    onClose: () => void,
    storeId?: string,
    product?: ItemMenuV2
    category?: ItemCategory
    productNomenclature?: Product
    storeStatus?: IStoreStatus
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

    useEffect(() => {
        console.log({ propsProduct: props})
    }, [props])

    const price = props.product?.itemSizes[0].prices[0].price
    const itemData = props.product?.itemSizes[0]

    return (
        <ReactModal
            isOpen={props.isOpen}
            onRequestClose={props.onClose}
            className="Product-Modal"
            overlayClassName="Overlay"
            bodyOpenClassName='ReactModal__Eat-Body--open'
        // shouldCloseOnOverlayClick={false}
        >
            <div className="Product-Modal__content">
                {itemData?.buttonImageUrl ? <div className='Product-Modal__image'>
                    <Image src={`${itemData?.buttonImageUrl}`} alt='' fallbackSrc='/images/fallback.png' />
                </div>
                    : <></>}

                <ReactSVG className={`Product-Modal__close${itemData?.buttonImageUrl ? ' white' : ' dark'}`} src='/svg/modal-close.svg' onClick={props.onClose} />

                <div className='Product-Modal__info'>
                    {props.category?.name ? <span className='Product-Modal__info-memo'>{props.category?.name}</span> : <></>}
                    {props.productNomenclature?.seoTitle ? <span className='Product-Modal__info-title'>{props.productNomenclature?.seoTitle}</span> : <></>}
                    {props.category?.description ? <span className='Product-Modal__info-warning_text'>{props.category?.description}</span> : <></>}
                    {props.productNomenclature?.seoDescription ? <span className='Product-Modal__info-description'>{props.productNomenclature?.seoDescription}</span> : <></>}
                    {price && price > 0 ? <span className='Product-Modal__info-price'>{price} руб.</span> : <></>}
                </div>
                <div className="Product-Modal__actions">
                    <Button text={props.storeStatus.isOpen ? 'Добавить' : 'До открытия ' + props.storeStatus.untilOpen}
                        stretch bgColor='#56754B' color='#fff' onClick={handleAddToCart} disabled={!props.storeStatus.isOpen}
                    />
                </div>
            </div>
        </ReactModal>
    );
};

export default ProductEatModal
