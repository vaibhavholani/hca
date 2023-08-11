import React from 'react'
import {makeStyles} from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'

const useStyles = makeStyles({
    spacing: {
        padding: "5px",
        margin: "10px 0px",
        width: "300px",
        '& label.Mui-focused': {
            color: '#5f21fc',
          },
        '& .MuiInput-underline:after': {
            borderBottomColor: '#5f21fc',
            textColor: '#5f21fc'
          },
        '& .Mui-error.MuiInput-underline:after': {
            borderBottomColor: 'red'
        }, 
        '& label.Mui-error.Mui-focused': {
            color: 'red'
        }
    }
})

export default function TextInput({label, id, name, type, errorState, errorText, props, defaultValue, disabled, custom, InputProps, value, onChange, key, onKeyPress}) {

    const classes = useStyles()
    return (
        <div key={key}>
            <TextField 
                name={name}
                error = {errorState}
                id = {id}
                type = {type}
                disabled = {disabled}
                label = {<h3>{label}</h3>}
                helperText = {errorState ? errorText: undefined}
                defaultValue = {defaultValue}
                InputProps={InputProps}
                onKeyPress = {onKeyPress}
                {...props}
                value = {value}
                onChange = {onChange}
                className = {classes.spacing}
                {...custom}
            />
        </div>
    )
}
