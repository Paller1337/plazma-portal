// components/CartModal.js
import React, { useState } from 'react'
import CartItem from './CartItem'
import { useCart } from 'context/CartContext';
import { ReactSVG } from 'react-svg';

const CartModal = () => {
    const [isOpen, setIsOpen] = useState(false)
    const { state } = useCart()

    const toggleModal = () => setIsOpen(!isOpen)
    const itemCount = state.items.reduce((total, item) => total + item.quantity, 0)

    return (
        <>
            <div className='room-services__cart-btn' onClick={toggleModal}>
                <ReactSVG className='room-services__cart-logo' src='/svg/cart-white.svg' />
                {itemCount} позици{(itemCount % 5) === 0  ? 'й' : 'и'}
            </div>
            {
                isOpen && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                    }}>
                        <div style={{
                            backgroundColor: '#fff',
                            padding: '20px',
                            borderRadius: '5px',
                            width: '500px',
                            maxHeight: '80vh',
                            overflowY: 'auto',
                        }}>
                            <h2>Ваша корзина</h2>
                            <button onClick={toggleModal} style={{
                                float: 'right',
                                border: 'none',
                                background: 'none',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                            }}>×</button>
                            <div style={styles.cartItems}>
                                {state.items.length > 0 ? (
                                    state.items.map(item => <CartItem key={item.id} item={item} />)
                                ) : (
                                    <p>Корзина пуста</p>
                                )}
                            </div>
                            <div style={styles.total}>Общая сумма: {state.total} руб.</div>
                        </div>
                    </div>
                )
            }
        </>
    );
};

// Простые стили для модального окна, можно настроить под свои нужды
const styles = {
    modalOverlay: {

    },
    modal: {

    },
    closeButton: {

    },
    cartItems: {
        marginBottom: '20px',
    },
    total: {
        marginTop: '20px',
        fontWeight: 'bold',
    },
};

export default CartModal;
