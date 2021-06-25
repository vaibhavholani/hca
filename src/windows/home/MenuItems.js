

const EntryItems = [
    {
        title: 'Register Entry',
        url: '/hca/#/selector/Supplier/register_entry/none',
        cName: 'entry-links links register'
    }, 
    {
        title: 'Memo Entry',
        url: '/hca/#/selector/Supplier/memo_entry/none',
        cName: 'entry-links links'
    }
]

const ReportItems = [
    {
        title: 'Khata Report',
        url: '/hca/#/date_select/khata_report',
        cName: 'report-links links khata'
    }, 
    {
        title: 'Supplier Register',
        url: '/hca/#/date_select/supplier_register',
        cName: 'report-links links'
    },
    {
        title: 'Payment List',
        url: '/hca/#/date_select/payment_list',
        cName: 'report-links links'
    }, 
    {
        title: 'Payment List Summary',
        url: '/hca/#/date_select/payment_list_summary',
        cName: 'report-links links'
    },
    
    {
        title: 'Grand Total List',
        url: '/hca/#/date_select/grand_total_list',
        cName: 'report-links links'
    }, 
    {
        title: 'Legacy Payment List',
        url: '/hca/#/date_select/legacy_payment_list',
        cName: 'report-links links'
    }
    
    
]

const NewItems = [
    {
        title: 'Supplier',
        url: '/hca/#/new/supplier',
        cName: 'new-links links supplier'
    }, 
    {
        title: 'Party',
        url: '/hca/#/new/party',
        cName: 'new-links links'
    }, 
    {
        title: 'Bank',
        url: '/hca/#/new/bank',
        cName: 'new-links links'
    }, 
    {
        title: 'Transporter',
        url: '/hca/#/new/transporter',
        cName: 'new-links links'
    }

]

export const MenuItems = [
    {
        title: 'Entry', 
        url: '/hca/#/',
        links: EntryItems,
        cName: 'entry-tag nav-links '
    },
    {
        title: 'Reports', 
        url: '/hca/#/',
        links: ReportItems,
        cName: 'nav-links report-tag'
    },
    {
        title: 'New', 
        url: '/hca/#/',
        links: NewItems,
        cName: 'nav-links new-tag'
    }



]