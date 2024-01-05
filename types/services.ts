// types.ts
export interface ServiceImage {
    id: number
    attributes: {
        url: string
        width: number
        height: number
    }
}

export interface Service {
    id: number
    attributes: {
        title: string
        price: number
        images: {
            data: ServiceImage[]
        }
    }
}

export interface ServicesResponse {
    data: Service[]
}
