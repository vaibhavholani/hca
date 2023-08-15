import {base} from '../../proxy_url'

export const loadIndividuals = (mode, setData)=> {
    
    let link = ""
    if (mode.toLowerCase() === "supplier") {
        link = base + "/supplier_names_and_ids"
    }
    else {link = base + "/party_names_and_ids"}

    fetch(link).then(response => {
        return response.json();
      }).then(data => {
        setData(data)})
    }


export const loadOptions = (filters, setData) => {

    const link = base +  `/get_all`
    return fetch(link, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters)
    }).then(response => {
        return response.json();
    }).then(data => {
        setData(data)
    })
    .catch((err) => {
        console.log("Error Reading data " + err);
      });;
}
