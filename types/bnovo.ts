export type TBookingExtra = {
    id: string;
    hotel_id: string;
    source_id: string;
    provider_id: any;
    source_name: any;
    source_icon: any;
    status_id: string;
    status_name: string;
    status_color: string;
    customer_id: string;
    agency_id: string;
    supplier_id: string;
    supplier_name: any;
    agency_name: any;
    agency_commission: number;
    agency_not_pay_services_commission: number;
    source_commission: any;
    ancillary_commission: any;
    number: string;
    create_date: string;
    arrival: string;
    departure: string;
    real_arrival: string;
    real_departure: string;
    original_arrival: any;
    original_departure: any;
    amount: string;
    amount_provider: string;
    is_blocked: string;
    name: string;
    surname: string;
    phone: any;
    notes: any;
    link_id: string;
    external_res_id: any;
    provider_booking_id: string;
    extra_provider: boolean;
    cancel_date: any;
    discount_type: string;
    discount_amount: string;
    discount_reason_id: string;
    discount_reason: string;
    guarantee: string;
    is_guarantee_encrypted: string;
    prices_array: any;
    prices_services_total: any;
    prices_rooms_total: any;
    payments_total: any;
    provided_total: any;
    customers_total: any;
    plan_name: any;
    initial_room_type_name: any;
    current_room: any;
    current_room_clean_status: any;
    room_name: any;
    has_linked_bookings: any;
    has_linked_cancelled_bookings: any;
    early_check_in: string;
    late_check_out: string;
    unread: string;
    uu: number;
    extra: { [key: string]: any };
    created_user: { [key: string]: any };
    created_user_id: string;
    created_user_name: any;
    created_user_surname: any;
    group_id: any;
    group_code: any;
    group_name: any;
    group_create_date: any;
    actual_price: { [key: string]: any };
    email: any;
    customer_notes: any;
    ota_info: any;
    prices: any[];
    prices_all: any[];
    client: any[];
    customer: TBnovoCustomer;
    customers: TBnovoCustomer[];
    invoices: any[];
    payments: any[];
    delivery_acts: any[];
    linked_bookings: any[];
    booking_notes: any[];
    cancel_reason: { [key: string]: any };
    discount_reason_relation: { [key: string]: any };
    marketing_data: any[];
    supplier: { [key: string]: any };
    board_nutritia: any;
    online_warranty_deadline_date: any;
    auto_booking_cancel: any;
    hotel: { [key: string]: any };
    source: { [key: string]: any };
}

export type TBooking = {
    booking_id: string;
    status_id: number;
    expiring_date_for_pending_booking: string;
    real_arrival: string;
    real_departure: string;
    real_arrival_format: string;
    real_departure_format: string;
    date: string;
    hour: number;
    days: number;
    hours: number;
    surname: string;
    name: string;
    number: string;
    css_class: string;
    balance: number;
    auto_modified: number;
    auto_modified_date: string;
    arrival_passed: boolean;
    departure_passed: boolean;
    is_early_arrival: number;
    is_late_departure: number;
    labels: string; // Это должно быть JSON строкой, представляющей массив
    adults: number;
    children: number;
    payment: string; // Строка из-за форматирования числа с пробелами
    amount: string; // Строка из-за форматирования числа с точкой и запятой
    amount_formatted: string; // Форматированная строка числа
    service_total: string; // Форматированная строка числа
    amount_total: string; // Форматированная строка числа
    need_online_payment: number;
    source_id: number;
    source_name: string;
    status_name: string;
    booking_number: string;
    email: string;
    phone: string;
    notes: string;
    board: string;
    show_board: boolean;
    customer: string;
    source: string;
    start_date: string;
    final_date: string;
    modified_plan_notification: number;
    plan: string;
    online_warranty_deadline_date: string;
    bnovobook_auto_cancel: number;
    booking_card_is_invalid: number;
    is_long: number;
    room_id: string;
    dual_roomtype_id: string;
    from_past: boolean;
    end_in_future: boolean;
    has_closure: boolean;
    unread: number;
    uu: number;
    cwd: number;
    cwh: number;
    awd: number;
    awh: number;
};

export type TBnovoCustomer = {
    id: string;
    hotel_id: string;
    country_id: string;
    country_name: string;
    citizenship_id: any;
    citizenship_name: any;
    name: string;
    surname: string;
    email: string;
    phone: string;
    birthdate: any;
    postcode: string;
    city: string;
    address: string;
    passport_num: string;
    passport_date_start: any;
    passport_date_end: any;
    notes: string;
    tags: string;
    extra: any[];
    customerstag: any[];
    files: any[];
}

export type TBnovoRoom = {
    clean_status: null
    hotel_id: number
    id: number
    name: string
    room_type: string
    room_type_id: number
    room_type_name: null
    sort_order: string
    tags: string
}