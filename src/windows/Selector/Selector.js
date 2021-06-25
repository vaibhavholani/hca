import React, {useEffect, useState} from 'react'
import Home from '../home/Home'
import '../button.css'
import './Selector.css'
import TextField from '@material-ui/core/TextField'
import TextInput from '../Custom/TextInput'
import Autocomplete from '@material-ui/lab/Autocomplete';
import {useParams, useHistory} from 'react-router-dom'
import {useForm} from 'react-hook-form'
import {base} from '../../proxy_url'


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

export default function Selector() {
    
    
    const {mode, type, supplier} = useParams();
    
    
    const history = useHistory();
    const [options, setOptions] = useState([]);
    const [selected, setSelected]= useState(null)
    const [error, setError] = useState({error: false, message: `Please choose a ${mode}`});

    useEffect(()=>{
        const promise = loadOptions(mode);
        promise.then(data => 
            {console.log(data)
            setOptions(data)})

        document.getElementById("selection").focus();
    }, [mode])

    
    const OnSubmit = () => {
        
        var add = true; 
        if (selected == null) {
            setError (old => {return {...old, error: true}});
            return;
        }

        if (type === "register_entry")
        {history.push(`/${type}/${JSON.stringify(selected)}`)}
        else {
            if (mode === "Supplier") {
                history.push(`/selector/Party/${type}/${JSON.stringify(selected)}`)
            }
            else{
                history.push(`/memo_entry/${JSON.stringify(selected)}/${supplier}`)
            }
        }
        setError(old => {return {...old, error: false}})
       
    }


    return (
        <>
        <div>
        <Home></Home>
        </div>
        <div class="entry_content">
        <div class="form-box shadow">
        <Autocomplete 
                key={mode}
                id="selection"
                className="autocomplete"
                options={options}
                style={{width: 300}}
                getOptionLabel = {(options) => options.name}
                onChange={(event, value)=>{setSelected(value);}}
                onKeyPress = {(event) => {
                    if (event.key === "Enter") {
                        OnSubmit()
                    }
                }}
                autoHighlight 
                renderInput= {(params) => <TextInput label={`Select ${mode} name`} errorState={error.error} errorText={error.message} props={params} />}   />
        <button class="button" onClick={OnSubmit}> Submit </button>       
        </div>
        </div>
        </>
    )
}
