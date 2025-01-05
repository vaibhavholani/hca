import {base} from '../../proxy_url'

export const update_bill_color = (bills) => {

    var colour_bills = [];

    bills.forEach((item) => {
        const {amount, partial_amount, gr_amount, deduction, status, register_date} = item;
        const pending = {pending: amount - partial_amount - gr_amount - deduction} 
        var color;
        if (status === "N") {
            color = {"color": "red"}
        }
        else if (status.includes("G")) {
            color = {"color": "green"}
        }
        else {
            color = {"color": "blue"}
        }
        const obj = {...item, ...color, ...pending, register_date}
        colour_bills.push(obj);
    })
    return colour_bills;
    
}

export const getBillNumbers = (supplier_id, party_id) => {
    return fetch(`${base}/pending_bills/${supplier_id}/${party_id}`).then(response => response.json())
}

export const getCredit = (supplier_id, party_id) => {
    return fetch(`${base}/credit/${supplier_id}/${party_id}`).then(response => response.json())
}
export const getBank = () => fetch(`${base}/bank_names_and_ids`).then(response => response.json())


export const getDate = () => {
    // Setting date
    const  dt = new Date();
    const year  = dt.getFullYear();
    const month = (dt.getMonth() + 1).toString().padStart(2, "0");
    const day   = dt.getDate().toString().padStart(2, "0");
    const date = year +'-'+month+'-'+day;
    return date
}
