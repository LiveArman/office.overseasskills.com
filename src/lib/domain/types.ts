export type Role = 'super_admin' | 'admin' | 'franchise_owner' | 'operator'
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded'
export type DashboardSummary = { sales:number; completedOrders:number; activeCenters:number; pendingPayouts:number }
export type Franchise = { code:string; name:string; location:string; status:'active'|'pending'|'suspended'; sales:number; orders:number; commission:number }
export type Order = { id:string; student:string; center:string; amount:number; status:OrderStatus; date:string }
