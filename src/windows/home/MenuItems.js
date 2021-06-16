

const EntryItems = [
    {
        title: 'Register Entry',
        url: '/selector/Supplier/register_entry/none',
        cName: 'entry-links links'
    }, 
    {
        title: 'Memo Entry',
        url: '/selector/Supplier/memo_entry/none',
        cName: 'entry-links links'
    }
]

const ReportItems = [
    {
        title: 'Khata Report',
        url: '/date_select/khata_report',
        cName: 'report-links links'
    }, 
    {
        title: 'Supplier Register',
        url: '/date_select/supplier_register',
        cName: 'report-links links'
    },
    {
        title: 'Payment List',
        url: '/date_select/payment_list',
        cName: 'report-links links'
    }, 
    {
        title: 'Payment List Summary',
        url: '/date_select/payment_list_summary',
        cName: 'report-links links'
    },
    
    {
        title: 'Grand Total List',
        url: '/date_select/grand_total_list',
        cName: 'report-links links'
    }, 
    {
        title: 'Legacy Payment List',
        url: '/date_select/legacy_payment_list',
        cName: 'report-links links'
    }
    
    
]

const NewItems = [
    {
        title: 'Supplier',
        url: '/new/supplier',
        cName: 'new-links links'
    }, 
    {
        title: 'Party',
        url: '/new/party',
        cName: 'new-links links'
    }, 
    {
        title: 'Bank',
        url: '/new/bank',
        cName: 'new-links links'
    }, 
    {
        title: 'Transporter',
        url: '/new/transporter',
        cName: 'new-links links'
    }

]

export const MenuItems = [
    {
        title: 'Entry', 
        url: '/',
        links: EntryItems,
        cName: 'nav-links entry-tag'
    },
    {
        title: 'Reports', 
        url: '/',
        links: ReportItems,
        cName: 'nav-links report-tag'
    },
    {
        title: 'New', 
        url: '/',
        links: NewItems,
        cName: 'nav-links new-tag'
    }



]