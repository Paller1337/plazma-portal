import Button from './Button'
import { useEffect, useMemo, useState } from 'react'
import { DEFAULTS } from 'defaults'
import { DateTime, Settings } from 'luxon'
import { Flex, LoadingOverlay } from '@mantine/core'
import Router from 'next/router'
import { ISupportTicket } from 'types/support'

interface SupportTicketItemProps {
    ticket?: ISupportTicket
}



export default function SupportTicketItem(props: SupportTicketItemProps) {
    const [visibleLoadingOverlay, setVisibleLoadingOverlay] = useState(false)
    const [statusStyle, setStatusStyle] = useState({
        '--status-color': '#000'
    } as React.CSSProperties)

    const status = useMemo(() => {
        switch (props.ticket.status) {
            case 'new':
                return {
                    text: 'Новая',
                    color: '#228be6'
                };
            case 'inwork':
                return {
                    text: 'В работе',
                    color: '#fd7e14'
                };
            case 'closed':
                return {
                    text: 'Готова',
                    color: '#868e96',
                };
            default:
                return {
                    text: 'Не определен',
                    color: '#000'
                };
        }
    }, [props.ticket.status]);

    useEffect(() => {
        setStatusStyle({
            '--status-color': status.color
        } as React.CSSProperties);
    }, [status])

    useEffect(() => console.log(`ticket ${props.ticket.id}`, props.ticket))
    Settings.defaultLocale = 'ru'
    const createAt = DateTime.fromISO(props.ticket.create_at).toFormat('dd MMMM, HH:mm')

    return (
        <div className='guest-order__wrapper'>
            <div className='guest-order'>
                <LoadingOverlay
                    visible={visibleLoadingOverlay}
                    zIndex={1000}
                    overlayProps={{ radius: 'sm', blur: 2 }}
                    loaderProps={{ color: 'gray', type: 'oval' }}
                />

                <div className='guest-order__header'>
                    <span className='guest-order__date'>{createAt}</span>
                    <span className='guest-order__status guest-order__status--active' style={statusStyle}>{status.text}</span>
                </div>


                <div className='guest-order__info'>
                    <span className='guest-order__number'>№ {props.ticket.id}</span>
                </div>

                <div className='guest-order__comment'>
                    <span className='guest-order__comment-title'>Комментарий:</span>
                    <span className='guest-order__comment-text'>{props.ticket.messages[0].message}</span>
                </div>

                <div className='guest-order__total'>
                </div>

                <div className='guest-order__buttons'>
                    <Button text='Позвонить' stretch onClick={() => window.location.href = `tel:${DEFAULTS.PHONE_NUMBERS.reception}`} />
                </div>
            </div>
        </div>
    )
}