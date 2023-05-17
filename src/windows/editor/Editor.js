import React, {useState, useEffect} from 'react' 
import TextInput from '../Custom/TextInput'
import './Editor.css'
import AutoComplete from '@material-ui/lab/Autocomplete'
import {base} from '../../proxy_url'
import MemoBill from '../MemoBill/MemoBill'

const extractDate = (oldDate) => {
    // Setting date
    var dateParts = oldDate.split("/");
    const dt= new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
    const year  = dt.getFullYear();
    const month = (dt.getMonth() + 1).toString().padStart(2, "0");
    const day   = dt.getDate().toString().padStart(2, "0");
    const date = year +'-'+month+'-'+day;
    return date
}

const selector_auto = (names, data, setData, key, selected) => {
    return (
        <AutoComplete 
            className="autocomplete"
            options={names}
            style={{width: 300}}
            disabled = {selected.table === "memo_entry"}
            getOptionLabel = {(options) => options.name}
            onChange={(event, value)=>{   
                if (value != null) {
                    setData(old => {return {...old, [key]: value.id}})
                }       
            }}
            defaultValue = {get_names(names, data[key])}
            autoHighlight 
            renderInput= {(params) => <TextInput label={key === "supplier_id" ? `Select Supplier Name` : 'Select Party Name'} 
                           props={params} />}   />
    )
}

const get_names = (arr, val) => {
    const name_obj = arr.filter(obj => {
        return obj.id === val
    })
    
    if (name_obj.length === 0) {
        return ""
    } 
    return name_obj[0]
}


const get_memo_bills = (id) => {

    const link = base +  `/get_memo_bills/${id}`
    return (fetch(link).then(response => {
        return response.json()
    }))

}


const disabled = {"register_entry":["id", "partial_amount", "gr_amount", 
                                    "deduction", "status"], 
                "memo_entry": ["id", "supplier_id", "party_id", 
                              "amount", "gr_amount"]}



export default function Editor({data, setData, setEditorOpen, supplierNames, partyNames, selected, setOpen}) {
    
    const [memoBills, setMemoBills] = useState([])
    useEffect(()=> {
        if (selected.value === "Memo Entry") {
            const promise = get_memo_bills(data.id)
            promise.then(data => setMemoBills(data))
         }
    }, [selected, data])
    
    const setStatus = (data) => {
        if (data.status === "okay") {
            setOpen({open: true, severity: "success"})
        }
        else {
            setOpen({open: true, severity: "false"})}
    }
    const handleDeleteEntity = () => {

        setEditorOpen(false)

        const requestOptions = {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        }
        fetch(base + `/delete/${selected.table}`, requestOptions).then(response => 
            response.json()).then(data => {
                setStatus(data)
            })
    }
    

    const handleUpdateEntity = () => {

        setEditorOpen(false)

        const requestOptions = {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify(data)
        }

        fetch(base + `/update/${selected.table}`, requestOptions).then(response => 
            response.json()).then(data => setStatus(data))
    }
    return (
        <div>
            {Object.keys(data).map(key => {

                if (key === "supplier_id") {
                    return selector_auto(supplierNames, data, setData, key, selected)
                }
                if (key === "party_id") {
                    return selector_auto(partyNames, data, setData, key, selected)
                }

                if (key === "register_date") {

                    const final_date = extractDate(data[key])

                    return (
                        <TextInput  
                        label={key.toUpperCase()}
                        key={key}
                        defaultValue={final_date}
                        type={"date"}
                        onChange={(e) => {
                            const {value} = e.target
                            setData(old => {return {...old, [key]: value}})
                        }}
                    />
                    )
                }

                const table_selection = ["register_entry", "memo_entry"]
                console.log(table_selection.includes(selected.value))
                return (
                    <TextInput  
                        label={key.toUpperCase()}
                        key={key}
                        value={data[key]}
                        disabled={Object.keys(disabled).includes(selected.table) &&  disabled[selected.table].includes(key)}
                        onChange={(e) => {
                            const {value} = e.target
                            setData(old => {return {...old, [key]: value}})
                        }}
                    />
                )
                
            })}

        {selected.value === "Memo Entry" && <div className="bill_transactions">
            <MemoBill data={memoBills} setData={setMemoBills} setStatus={setStatus} />
        </div>}

        <div className="editor-buttons">
        <button class="button" onClick={()=> {handleDeleteEntity()}}> Delete </button>
        <button class="button" onClick={()=> {handleUpdateEntity()}}>Save</button>
        
        </div>
        </div>
    )
}
