import { ICSupportTicketProps } from '@/components/admin/SupportTicketCard';
import axios from 'axios'
import { DEFAULTS } from 'defaults'
import { IOrderCustomer } from 'types/order'
import { ISupportTicket, ISupportTicketMessage, TSupportTicketMessageSender, TSupportTicketStatus } from 'types/support';

export async function createSupportTicket(ticket: ISupportTicket) {
    console.log(ticket)

    try {
        const response = await axios.post(`${DEFAULTS.STRAPI.url}/api/support-tickets`, {
            data: {
                create_at: ticket.create_at || '',
                update_at: ticket.update_at || '',
                status: ticket.status || null as TSupportTicketStatus,
                previous_status: ticket.previous_status || null as TSupportTicketStatus,
                customer: ticket.customer || null as IOrderCustomer,
                messages: ticket.messages || null as ISupportTicketMessage[],
            } as ISupportTicket
        })

        return response.data
    } catch (error) {
        console.error('Ошибка во время создания заказа:', error)
        throw error // Переброс ошибки для дальнейшей обработки
    }
}

export async function getSupportTickets(): Promise<ISupportTicket[]> {
    try {
        const response = await axios.get(`${DEFAULTS.STRAPI.url}/api/support-tickets`, {
            params: {
                'sort[create_at]': `desc`,
                'populate': 'deep,4',
            }
        })

        return response.data.data;
    } catch (error) {
        console.error('Ошибка при создании аккаунта гостя:', error);
        throw error; // Переброс ошибки для дальнейшей обработки
    }
}

export async function getSupportTicketsByGuestId(id: number): Promise<ISupportTicket[]> {
    try {
        const response = await axios.get(`${DEFAULTS.STRAPI.url}/api/support-tickets`, {
            params: {
                // 'sort': "created_at:DESC",
                'filters[customer][guest_account][id][$eq]': id,
                'sort[create_at]': `desc`,
                'populate': 'deep,4',
            }
        })

        return response.data.data;
    } catch (error) {
        console.error('Ошибка при создании аккаунта гостя:', error);
        throw error; // Переброс ошибки для дальнейшей обработки
    }
}


export async function updateSupportTicketStatus(props: ICSupportTicketProps, status: TSupportTicketStatus, newStatus: TSupportTicketStatus) {
    console.log({props, status, newStatus})
    try {
        const response = await axios.put(`${DEFAULTS.STRAPI.url}/api/support-tickets/${props.id}`, {
            data: {
                // ...props.ticket, // Сохраняем все существующие поля
                // create_at: props.ticket.create_at,
                // customer: {
                //     ...props.ticket.customer,
                //     guest_account: props.ticket.customer.guest_account.id
                // },
                status: newStatus,
                previous_status: status,
            }
        })
        return response.data
    } catch (error) {
        console.error('Ошибка при обновлении статуса заказа:', error);
        throw error;
    }
}


export function supportTicketsFromRes(res): ISupportTicket[] {
    return res.map(x => {
        const customerData = x.attributes.customer
        const guestData = x.attributes.customer?.guest_account?.data

        // Добавляем проверку на существование msg и msg.attributes перед чтением свойств
        const messages = x.attributes.messages?.map(msg => ({
            message: msg.message,
            create_at: msg.createdAt,
            sender: msg.sender,
            sender_type: msg.sender_type as TSupportTicketMessageSender,
        })).filter(msg => msg !== null) || []

        return {
            id: x.id,
            create_at: x.attributes.createdAt,
            update_at: x.attributes.updatedAt,
            close_at: x.attributes.closedAt,
            status: x.attributes.status as TSupportTicketStatus,
            previous_status: x.attributes.previous_status as TSupportTicketStatus,
            customer: customerData ? {
                name: customerData?.name,
                room: customerData?.room,
                phone: customerData?.phone,
                guest_account: {
                    id: customerData.id,
                    ...guestData.attributes
                }
            } : undefined,
            messages
        } as ISupportTicket;
    });
}




export const formatTicketMessage = (ticketsCount) => {
    let orderWord = 'заявок';
    let activeWord = 'активных';

    if (ticketsCount % 10 === 1 && ticketsCount % 100 !== 11) {
        orderWord = 'заявка';
        activeWord = 'активная';
    } else if (ticketsCount % 10 >= 2 && ticketsCount % 10 <= 4 && (ticketsCount % 100 < 10 || ticketsCount % 100 >= 20)) {
        orderWord = 'заявки';
        activeWord = 'активных';
    }
    return `У вас ${ticketsCount} ${activeWord} ${orderWord}`;
}

export const ticketStatus = (s: TSupportTicketStatus) => {
    switch (s) {
        case 'new':
            return 'Заявка обрабатывается'
        case 'inwork':
            return 'Заявка передана специалистам'
        case 'closed':
            return 'Заявка закрыта'
        default:
            return ''
    }
}