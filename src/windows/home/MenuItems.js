import {router_base} from '../../proxy_url'

const EntryItems = [
    {
        title: 'Register Entry',
        url: `${router_base}/selector/Supplier/register_entry/none`,
        cName: 'entry-links links register'
    }, 
    {
        title: 'Memo Entry',
        url: `${router_base}/selector/Supplier/memo_entry/none`,
        cName: 'entry-links links'
    },
    {
        title: 'Order Form',
        url: `${router_base}/order_form`,
        cName: 'entry-links links'
    }
]

const ReportItems = [
    {
        title: 'Khata Report',
        url: `${router_base}/date_select/khata_report`,
        cName: 'report-links links khata'
    }, 
    {
        title: 'Supplier Register',
        url: `${router_base}/date_select/supplier_register`,
        cName: 'report-links links'
    },
    {
        title: 'Payment List',
        url: `${router_base}/date_select/payment_list`,
        cName: 'report-links links'
    }, 
    {
        title: 'Order Form',
        url: `${router_base}/date_select/order_form`,
        cName: 'report-links links'
    }, 

    // {
    //     title: 'Payment List Summary',
    //     url: `${router_base}/date_select/payment_list_summary`,
    //     cName: 'report-links links'
    // },
    
    // {
    //     title: 'Grand Total List',
    //     url: `${router_base}/date_select/grand_total_list`,
    //     cName: 'report-links links'
    // }, 
    // {
    //     title: 'Legacy Payment List',
    //     url: `${router_base}/date_select/legacy_payment_list`,
    //     cName: 'report-links links'
    // }
    
    
]

const NewItems = [
    {
        title: 'Supplier',
        url: `${router_base}/new/supplier`,
        cName: 'new-links links supplier'
    }, 
    {
        title: 'Party',
        url: `${router_base}/new/party`,
        cName: 'new-links links'
    }, 
    {
        title: 'Bank',
        url: `${router_base}/new/bank`,
        cName: 'new-links links'
    }, 
    {
        title: 'Transporter',
        url: `${router_base}/new/transport`,
        cName: 'new-links links'
    }

]

export const MenuItems = [
    {
        title: 'Entry', 
        url: `${router_base}`,
        links: EntryItems,
        cName: 'entry-tag nav-links '
    },
    {
        title: 'Reports', 
        url: `${router_base}`,
        links: ReportItems,
        cName: 'nav-links report-tag'
    },
    {
        title: 'New', 
        url: `${router_base}`,
        links: NewItems,
        cName: 'nav-links new-tag'
    }



]