import { DEFAULTS } from 'defaults'
import { IReserveByPortal } from 'types/admin/banquets';
const url = DEFAULTS.MAIN_URL

export async function getBanquetsNow() {
    const banquets: IReserveByPortal[] = await fetch(`${url}/api/iiko/db/banquets-now`)
        .then((res) => {
            if (!res.ok) {
                throw new Error(`Банкеты не получены, ошибка ${res.status}`)
            }
            return res.json()
        })
        .then((res) => res as IReserveByPortal[])
    return banquets
}

export async function getBanquetsError() {
    const banquets: IReserveByPortal[] = await fetch(`${url}/api/iiko/db/banquets-error`)
        .then((res) => {
            if (!res.ok) {
                throw new Error(`Банкеты не получены, ошибка ${res.status}`)
            }
            return res.json()
        })
        .then((res) => res as IReserveByPortal[])
    return banquets
}

export async function getBanquetById(banquetId: string): Promise<IReserveByPortal> {
    const banquet = await fetch(`${url}/api/iiko/db/${banquetId}`)
        .then((res) => {
            if (!res.ok) {
                throw new Error(`Банкет не получен, ошибка ${res.status}`)
            }
            return res.json()
        })
        .then((res) => res)

    return {
        ...banquet,
        payments: JSON.parse(banquet.payments as string),
        banquetData: JSON.parse(banquet.banquetData as string),
    }
}

export async function patchBanquet(data: IReserveByPortal) {
    console.log('patchBanquet: ', data)
    const response = await fetch(`${url}/api/iiko/db/${data.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    })
        .then((res) => {
            if (!res.ok) {
                throw new Error(`Банкет не обновлен, ошибка ${res.status}`)
            }
            return res.json()
        })
        .then((res) => res)


    if (!response) {
        throw new Error("Banquet not found");
    } else {
        if (response.isDeleted) {
            throw new Error("Banquet is Deleted");
        }
    }

    return {
        id: data.id,
        status: "updated",
        message: "Banquet successfully updated",
    };
}

export async function getBanquetsHistory() {
    const banquets: IReserveByPortal[] = await fetch(`${url}/api/iiko/db/banquets-history`)
        .then((res) => {
            if (!res.ok) {
                throw new Error(`Банкеты не получены, ошибка ${res.status}`)
            }
            return res.json()
        })
        .then((res) => res as IReserveByPortal[])
    return banquets
}

export async function deleteBanquet(banquetId: string) {
    console.log('Удаление банкета')
    const response = await fetch(`/api/iiko/db/${banquetId}`, {
        method: 'DELETE',
    })

    if (response.status === 204) {
        console.log(`Банкет ${banquetId} успешно удален.`);
        return {
            status: true,
            text: `Банкет ${banquetId} успешно удален.`
        }
    } else if (response.status === 404) {
        console.log(`Банкет ${banquetId} не найден.`);
        return {
            status: false,
            text: `Банкет ${banquetId} не найден.`
        }
    } else {
        console.log("An error occurred.");
        return {
            status: false,
            text: 'An error occurred.'
        }
    }
}

export async function banquetStatusSent(banquetId: string) {
    // console.log('Удаление банкета')
    const response = await fetch(`/api/iiko/db/${banquetId}`, {
        method: 'PUT',
    })

    if (response.status === 204) {
        console.log(`Для банкета ${banquetId} статус успешно изменен на 'sent'.`);
        return {
            status: true,
            text: `Для банкета ${banquetId} статус успешно изменен на 'sent'.`
        }
    } else if (response.status === 404) {
        console.log(`Банкет ${banquetId} не найден.`);
        return {
            status: false,
            text: `Банкет ${banquetId} не найден.`
        }
    } else {
        console.log("An error occurred.");
        return {
            status: false,
            text: 'An error occurred.'
        }
    }
}

export async function recoverBanquet(banquetId: string) {
    console.log('Восстановление банкета')
    const response = await fetch(`/api/iiko/db/recover/${banquetId}`, {
        method: 'PATCH'
    })

    if (response.status === 204) {
        console.log(`Банкет ${banquetId} успешно восстановлен.`);
        return {
            status: true,
            text: `Банкет ${banquetId} успешно восстановлен.`
        }
    } else if (response.status === 404) {
        console.log(`Банкет ${banquetId} не найден.`);
        return {
            status: false,
            text: `Банкет ${banquetId} не найден.`
        }
    } else {
        console.log("An error occurred.");
        return {
            status: false,
            text: 'An error occurred.'
        }
    }
}

export async function recreateBanquet(banquetId: string) {
    console.log('Пересоздание банкета')
    const response = await fetch(`/api/iiko/db/recreate/${banquetId}`, {
        method: 'PATCH'
    })

    if (response.status === 204) {
        console.log(`Банкет ${banquetId} успешно пересоздан.`);
        return {
            status: true,
            text: `Банкет ${banquetId} успешно пересоздан.`
        }
    } else if (response.status === 404) {
        console.log(`Банкет ${banquetId} не найден.`);
        return {
            status: false,
            text: `Банкет ${banquetId} не найден.`
        }
    } else {
        console.log("An error occurred.");
        return {
            status: false,
            text: 'An error occurred.'
        }
    }
}


export async function getBanquetsDrafts() {
    const banquets: IReserveByPortal[] = await fetch(`${url}/api/iiko/db/banquets-now`)
        .then((res) => {
            if (!res.ok) {
                throw new Error(`Банкеты не получены, ошибка ${res.status}`)
            }
            return res.json()
        })
        .then((res) => res as IReserveByPortal[])
    return banquets
}