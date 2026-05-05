export enum Pages {
    HOME = '/',
    ADMIN = '/admin',
    CHECKOUT = '/checkout',
    ACCOUNT = '/account',
    CONTACTO = '/contact'
    //AccountsPage
    //AdminsPage
}

export enum AccountsPage {
    SUBSCRIPTION = '/subscription',
    ORDERS = '/orders',
    ORDER = '/orders${order.id}'
}

export enum AdminsPage {
//CouponsPage
//PostsPage
//OrdersPage
}

export enum CouponsPage { //admin/
    COUPONS = '/coupons',
    NEW_COUPONS = '/coupons/new',
    EDIT_COUPONS = '/coupons/edit/${coupon.id}'
}

export enum PostsPage { //admin/
    NEW_POST = '/new-post',
    EDIT_POST = '/edit-post${post.slug}'
}

export enum OrdersPage { ///admin/
    ORDERS = '/orders',
    ORDER_DETAILS = '/orders/${order.id}?path=${encodeURIComponent(order.path || "") '
}

export enum ProductsPage {

}
//... Link href