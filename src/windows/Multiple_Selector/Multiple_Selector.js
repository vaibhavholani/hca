import React, {useState, useEffect, useRef} from 'react'
import Autocomplete from '@material-ui/lab/Autocomplete'
import TextField from '@material-ui/core/TextField'
import Home from "../home/Home"
import {useParams, useHistory} from 'react-router-dom'
import {Button, ButtonGroup} from '@material-ui/core'
import {base} from '../../proxy_url'
import { ReportGenerator } from '../Reports/ReportGenerator';

const loadOptions = (mode)=> {
    
    var link;
    if (mode === "suppliers") {
        link = base + "/supplier_names_and_ids"
    }
    else {link = base + "/party_names_and_ids"}

    return (fetch(link).then(response => {
        return response.json();
      }))
}



export default function Multiple_Selector() {
    
    const {report, mode, to, from, suppliers} = useParams();
    const [selected, setSelected] = useState([])
    const [options, setOptions] = useState([])
    const validate = {error: false, message: `No ${mode} selected`}
    const [error, setError] = useState(validate)
    const history = useHistory();
    const [val, setVal] = useState([])

    useEffect(()=>{
        const data = loadOptions(mode)
        data.then(val => setOptions(val))
        document.getElementById("selector").focus();
    }, [mode])

    const addAll = () => {
        setSelected([...options])
        setVal([...options])
    }

    const clearAll = () => {
        setVal([])
    }

    const submit = () => {
        setVal([])
        setError(validate)
        if (selected.length < 1) {
          setError(old => {return {...old, error: true}});
        }
        else {
          if (mode === "suppliers") {
            history.push(`/multiple_selector/${report}/parties/${from}/${to}/${JSON.stringify(selected)}`)
            setSelected([])
          }
            
            else {
            const requestOptions = {
                method: 'POST', 
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({suppliers: suppliers, parties: JSON.stringify(selected), report: report, from: from, to: to})
            }
            fetch(base + '/create_report', requestOptions).then(response => {
                return response.json()
            }).then(json => {
                console.log(json)
                ReportGenerator(json)
            })
            .catch(err => console.error(err));
            }
            }
        }

    return (
        <div>
            <Home></Home>
            <div class="entry_content">
                <div class="form-box">
                <h2>Choose {mode}</h2>
                </div>
                <div class='form-box'>

                    <Autocomplete 
                        key={mode}
                        id="selector"
                        options={options} 
                        style={{width: 300, margin: 10}}
                        value = {val}
                        getOptionLabel = {(options) => options.name}
                        onChange={(event, value) => {setSelected(value); setVal(value)}}
                        autoHighlight 
                        multiple
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                            submit();
                            }}
                            }
                        renderInput= {(params) => <TextField style={{overflowY: 'scroll', maxHeight: 300}} helperText={error.error ? error.message: null} error={error.error}{...params} variant="outlined" />}   />
                    <div style={{marginTop: "10px"}}>
                    <ButtonGroup color="primary" aria-label="outlined primary button group">
              <Button color="primary" onClick={addAll} >
                Add All
              </Button>
              <Button color="primary" onClick={clearAll} >
                Clear
              </Button>
            </ButtonGroup>

                    </div>
              
            <button onClick={submit} class="button">Submit</button>
            
            
            </div>
            </div>
        </div>
    )
}