import React, {useEffect, useState} from 'react'
import Home from '../home/Home'
import {useForm} from "react-hook-form"
import {useParams} from "react-router-dom"
import {keybind_form} from "../../hooks/keybind.js"
import TextInput from "../Custom/TextInput"
import {validate} from './validate'
import {validate_required} from '../Custom/validate'
import MuiAlert from '@material-ui/lab/Alert'
import Snackbar from '@material-ui/core/Snackbar'
import {base} from '../../proxy_url'

const setKeyBinds = () => {
    // Setting enter keybinds
      var elements = document.getElementsByTagName('input');
      keybind_form("Enter", "forward", elements)
      keybind_form("ArrowDown", "forward", elements)
      keybind_form("ArrowUp", 'backward', elements)
    
    // 
}

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

export default function New() {

    const {register, handleSubmit} = useForm();
    const {entity} = useParams();
    const [error, setError] = useState(validate);
    const [open, setOpen] = useState(false);

    const OnSubmit = data => {
        console.log("I am here")
        setError(validate);
        const {err_status, update} = validate_required(data);
        if (err_status) {
            setError(old => {return {...old, ...update}});
        }
        else {
            fetch(`${base}/add/individual/${entity}/${data["name"]}/${data["phone"]}/${data["address"]}`)
            setOpen(true);
            setTimeout(()=> {setOpen(false)}, 3000)
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
            <Snackbar open={open} autoHideDuration={4000} >
                <Alert  severity="success">
                    {entity} Added!
                </Alert>
                </Snackbar>
           

        </div>
        
        </>
    )
}
