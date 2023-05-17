import React, {useState, useEffect} from 'react'
import AutoComplete from '@material-ui/lab/Autocomplete'
import TextInput from '../Custom/TextInput'
import {view_options} from './options.js'
import {base} from '../../proxy_url'
import Editor from '../editor/Editor'
import Home from '../home/Home'
import './View.css'
import MuiAlert from '@material-ui/lab/Alert'
import Snackbar from '@material-ui/core/Snackbar'

const loadOptions = (mode)=> {
    
    var link;
    if (mode === "Supplier") {
        link = base + "/supplier_names_and_ids"
    }
    else {link = base + "/party_names_and_ids"}

    return (fetch(link).then(response => {
        return response.json();
      }))
    
}


const get_memo_bills = (id) => {

    const link = base +  `get_memo_bills/${id}`
    return (fetch(link).then(response => {
        return response.json()
    }))
}

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }


export default function View() {
    const values_base = {select: {value:"Instance", table: "Supplier"}, 
                  entity: {id: 0}
}
    const [selected, setSelected] = useState(values_base.select);
    const [options, setOptions] = useState([])
    const [entity, setEntity] = useState({})
    const [editorOpen, setEditorOpen] = useState(false)
    const [supplierNames, setSupplierNames] = useState([]);
    const [partyNames, setPartyNames] = useState([]);
    const [open, setOpen] = useState({open: false, severity: "success"})
    
    const handleClick = () => {
        fetch(`${base}/get_all/${selected.table}`).then(response => {
            return response.json();
          }).then(data => {
            console.log(data)
            setOptions(data)
          }).catch(err => {
            console.log("Error Reading data " + err);
          });
    }

    useEffect(()=> {
        const supplier_names = loadOptions("Supplier")
        supplier_names.then(data => {setSupplierNames(data)})
        const party_names = loadOptions("Party")
        party_names.then(data => {setPartyNames(data)})

    }, [])

    useEffect (() => {
        document.getElementById("select_entity").focus()
    }, [])
    useEffect(()=> {
        handleClick()
        setEntity({})
    }, [selected])
    return (
        <>
        <Home />
        <div class="entry_content">
        <div class="heading-box">
            <h2 style={{all: "none"}}> View Menu</h2>
        </div>
        <div className="view-content">
            
            <div class="form-box">
            <AutoComplete 
                id = {"select_entity"}
                className="autocomplete"
                options={view_options}
                style={{width: 300}}
                getOptionLabel = {(options) => options.value}
                onChange={(event, value)=>{   
                    if (value == null) {
                        setSelected(values_base.select)
                    }       
                    else {setSelected(value)};
                }}
                onKeyPress = {(event) => {
                    if (event.key === "Enter") {
                        handleClick()
                        document.getElementById("select_instance").focus()
                    }
                }}
                autoHighlight 
                renderInput= {(params) => <TextInput label={`Select Entity`} 
                                           props={params} />}   />

                <button class="button" onClick={handleClick}> Select </button>
            
                <AutoComplete 
                key={selected}
                id={"select_instance"}
                options={options}
                style={{width: 300}}
                getOptionLabel = {(options) => {
                    if (selected.table === "register_entry") {
                        return (
                            `Bill Number: ${options.bill_number} | Date: ${options.register_date}`)
                    }
                    else if (selected.table === "memo_entry") {
                        return (
                            `Memo Number: ${options.memo_number} | Date: ${options.register_date}`
                        )
                    }
                    return options.name}}
                value = {entity}
                onChange={(event, value)=>{
                    if (value == null) {
                        setEntity(values_base.entity)
                    }       
                    else {setEntity(value)};}}
                onKeyPress = {(event) => {
                    if (event.key === "Enter") {
                        setEditorOpen(true)
                    }
                }}
                autoHighlight 
                renderInput= {(params) => <TextInput label={`Select ${selected.value}`} 
                                           props={params} />}   />

                <button class="button" onClick={()=> {setEditorOpen(true)}}> Select </button>
                
        </div>
        {editorOpen && <div className="form-box">
        <Editor data={entity} setData={setEntity} setEditorOpen={setEditorOpen} setOpen={setOpen} supplierNames={supplierNames} partyNames={partyNames} selected={selected} />
        </div>}

        <Snackbar open={open.open} autoHideDuration={4000} >
                <Alert  severity={open.severity}>
                    {open.severity === "success" ? "Changes Saved" : "Changes could not be saved"}
                </Alert>
                </Snackbar>
        </div>

        </div>
        </>
    )
}
