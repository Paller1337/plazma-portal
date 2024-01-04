// components/CartItem.js
import { useCart } from 'context/CartContext';
import React from 'react'

const styles = {
    cartItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
        padding: '10px',
        border: '1px solid #eee',
        borderRadius: '4px',
    },
    details: {
        flex: '1 1 auto',
    },
    title: {
        margin: '0 0 10px 0',
        fontSize: '1.1em',
    },
    price: {
        margin: 0,
        color: '#666',
    },
    controls: {
        display: 'flex',
        alignItems: 'center',
    },
    button: {
        marginLeft: '5px',
        border: '1px solid #ccc',
        background: '#fff',
        padding: '5px 10px',
        borderRadius: '4px',
        cursor: 'pointer',
    },
};

const CartItem = ({ item }) => {
    const { dispatch } = useCart();

    const handleRemoveFromCart = () => {
        dispatch({
            type: 'REMOVE_ITEM',
            id: item.id,
        });
    };

    const handleDecreaseQuantity = () => {
        if (item.quantity > 1) {
            dispatch({
                type: 'DECREASE_QUANTITY',
                id: item.id,
            });
        } else {
            handleRemoveFromCart();
        }
    };

    const handleIncreaseQuantity = () => {
        dispatch({
            type: 'INCREASE_QUANTITY',
            id: item.id,
        });
    };

    return (
        <div style={styles.cartItem}>
            <div style={styles.details}>
                <h4 style={styles.title}>{item.name}</h4>
                <p style={styles.price}>{item.price} руб. × {item.quantity}</p>
            </div>
            <div style={styles.controls}>
                <button onClick={handleDecreaseQuantity} style={styles.button}>-</button>
                <span style={{
                    minWidth: '20px',
                    textAlign: 'center',
                }}>{item.quantity}</span>
                <button onClick={handleIncreaseQuantity} style={styles.button}>+</button>
                <button onClick={handleRemoveFromCart} style={styles.button}>Удалить</button>
            </div>
        </div>
    );
};


export default CartItem;
