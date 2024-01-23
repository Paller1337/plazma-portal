import Router, { useRouter } from 'next/router'
import { useState } from 'react'
import { ReactSVG } from 'react-svg'
import { TOrderStatus } from 'types/order'

interface IndexNavButtonProps {
    isHelpButton?: boolean
    isOrderButton?: boolean
    title?: string
    desc?: string
    status?: string
    svgName?: string
    orderStatus?: TOrderStatus
    link?: string
}

export default function IndexNavButton(props: IndexNavButtonProps) {
    const router = useRouter()
    let orderStatus = '#fff'

    switch (props.orderStatus) {
        case 'new':
            orderStatus = '#228be6'
            break;

        case 'inwork':
            orderStatus = '#228be6'
            break;

        case 'delivered':
            orderStatus = '#fd7e14'
            break;

        case 'done':
            orderStatus = '#40c057'
            break;

        default:
            orderStatus = '#fff'
            break;
    }



    return (<>
        <div className={`index-nav__button ${props.isHelpButton ? 'index-nav__button_help' :
            props.isOrderButton ? 'index-nav__button_order' : ''}`} style={props.isOrderButton ?
                { border: `1px solid ${orderStatus}` } : {}}
            onClick={props.link ? () => Router.push(props.link) : () => { }}>
                
            <div className='index-nav__logo'>
                <ReactSVG src={`/svg/nav/${props.svgName}.svg`} />
            </div>
            <span className='index-nav__title'>{props.title}</span>
            <div className='index-nav__desc-row'>
                <span className='index-nav__desc'>{props.desc}</span>
                {props.status || props.orderStatus ?
                    <div className='index-nav__desc-status' style={{ backgroundColor: `${props.status ? props.status : orderStatus}` }} /> :
                    <></>
                }
            </div>

            {props.isHelpButton ?
                <div className='index-nav__inner-btn'>
                    Новая заявка
                </div>

                : <></>
            }

            {props.isOrderButton ?
                <div className='index-nav__inner-btn index-nav__inner-btn_dark'
                    onClick={() => router.push('/order/history')}>
                    Мои заказы
                </div>

                : <></>
            }

            <div className='index-nav__bg-logo'>
                <ReactSVG src={`/svg/nav/${props.svgName}-light.svg`} />
            </div>
        </div>
    </>)
}