import React, {useEffect, useState} from 'react'
import TextField from '@material-ui/core/TextField'
import Home from '../home/Home'
import {useParams, useHistory} from 'react-router-dom'
import {useForm} from 'react-hook-form'
import {keybind_form} from '../../hooks/keybind.js'
import TextInput from '../Custom/TextInput'
import {validate} from './validate'
import {validate_required} from '../Custom/validate'


const setKeyBinds = () => {
    var elements = document.getElementsByTagName('input');
      keybind_form("Enter", "forward", elements)
      keybind_form("ArrowDown", "forward", elements)
      keybind_form("ArrowUp", 'backward', elements)
}

export const getDate = (old) => {
    // Setting date
    const  dt = new Date();
    var year  = dt.getFullYear();
    const month = (dt.getMonth() + 1).toString().padStart(2, "0");
    const day   = dt.getDate().toString().padStart(2, "0");
    if (old) {
        year = year - 1
    }
    const date = year +'-'+month+'-'+day;
    return date
}

export default function Report_Date() {

    const {report} = useParams();
    const {register, handleSubmit} = useForm();
    const history = useHistory();
    const [error, setError] = useState(validate)
    const new_date = getDate(false)
    const old_date = getDate(true)


    const onSubmit = (value) => {

        console.log(value)
        setError(validate)
        const {err_status, update} = validate_required(value);
        if (err_status) {
            setError(old => {return {...old, ...update}})
        }

        if (!err_status) {
            const {from, to} = value
            const from_date = new Date(from);
            const to_date = new Date(to);
            if (from_date <= to_date) {
                history.push(`/multiple_selector/${report}/suppliers/${from}/${to}/[]`)
            }
            else {
                setError(old => {return {...old, from: {error: true, message: old.from.message}, 
                    to: {error: true, message: old.to.message}
                }})
            }
        }
        
        
    }

    useEffect(()=> {
        setKeyBinds();
        document.getElementById('from').focus()

    }, [])

    return (
        <div>
            <Home></Home>
            <div class="entry_content">
                <div class="form-box">
                <h2> Date Selector</h2>
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                <div class="form-box">
            
           
                <TextInput label="From:" id="from" type="date" defaultValue={old_date} errorState={error.from.error} errorText={error.from.message}
                            props = {register("from") }/>
                
                <TextInput label="To:" id="from" type="date" defaultValue={new_date} errorState={error.to.error} errorText={error.to.message}
                            props = {register("to")} />


                <input type="submit" class="button"/>
                </div>
            </form>
            
            </div>
        </div>
    )
}
