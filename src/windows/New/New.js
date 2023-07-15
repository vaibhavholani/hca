import React, {useEffect, useState} from 'react'
import Home from '../home/Home'
import {useForm} from "react-hook-form"
import {useParams} from "react-router-dom"
import {keybind_form} from "../../hooks/keybind.js"
import TextInput from "../Custom/TextInput"
import {validate} from './validate'
import {validate_required} from '../Custom/validate'
import Snackbar from '@material-ui/core/Snackbar'
import {base} from '../../proxy_url'
import Notification from '../Custom/Notification'

const setKeyBinds = () => {
    // Setting enter keybinds
      var elements = document.getElementsByTagName('input');
      keybind_form("Enter", "forward", elements)
      keybind_form("ArrowDown", "forward", elements)
      keybind_form("ArrowUp", 'backward', elements)
    
    // 
}


export default function New() {

    const {register, handleSubmit, reset} = useForm();
    const {entity} = useParams();
    const [error, setError] = useState(validate);
    const [status, setStatus] = useState({status: "okay", message: "Entity Added"}); 
    const [open, setOpen] = useState(false);
    const [initialRender, setInitialRender] = useState(true); // Add initialRender flag

    useEffect(() => {
        if (!initialRender) {
            if (status.status === "okay") {
                reset()
            }
            setOpen(true)
          } else {
            setInitialRender(false);
          }
        
    }
    , [status])   

    const OnSubmit = data => {
        setError(validate);
        const {err_status, update} = validate_required(data);
        if (err_status) {
            setError(old => {return {...old, ...update}});
        }
        else {
            fetch(`${base}/add/individual/${entity}/${data["name"]}/${data["phone"]}/${data["address"]}`)
            .then(response => 
                {response.json()}).then(json => {
                    setStatus(old => {return ({...old, ...json})})
                })

        }
        
    }

    useEffect(()=> {
        setKeyBinds();
        document.getElementById("name").focus()
    })
    return (
        <>
        <Home></Home>
        <div class="entry_content">
            <div class="form-box">
            <h1> Add {entity}</h1>
            </div>
        
            <form onSubmit={handleSubmit(OnSubmit)}>
            <div class="form-box">
                <div>
                <TextInput label="Name" id="name" type="text" errorState={error.name.error} errorText={error.name.message}
                           props={register("name")} />
                </div>
                <div>
                <TextInput label="Phone" type="number" errorState={error.phone.error} errorText={error.phone.message}
                           props={register("phone")} />
                </div>
                <div>
                <TextInput label="Address" type="text" errorState={error.address.error} errorText={error.address.message}
                           props={register("address")} />
                </div>
                <div>
                    <input type="submit" class="button" />
                </div>
                {/* <TextField label="Address" type="number" InputProps={{inputProps: {...register("trial", {required: "You need to fill this out bitches"})}}} error={errors.trial} helperText={errors.trial?.message} /> */}
               
                </div>    
            </form>
            <Notification message={status.message} severity={status.status == "okay" ? "success": "error"} notificationOpen={open} setNotificationOpen={setOpen} />
           

        </div>
        
        </>
    )
}
