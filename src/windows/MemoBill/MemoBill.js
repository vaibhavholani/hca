import React from 'react'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton'
import {base} from '../../proxy_url'
import './MemoBill.css'


const types = {
    "P" : "Partial Payment", 
    "F" : "Full Payment", 
    "G" : "Goods Return", 
    "C" : "Credit Payment",
    "D" : "Deduction", 
    "PG": "MISC"
}

export default function MemoBill({data, setData, setStatus}) {

    const handleDelete = (id) => {

        const delete_data = data.filter(item => item.id == id)[0]
        handleDeleteEntity(delete_data)
        setData(old => old.filter(item => item.id !== id))
    }


    const handleDeleteEntity = (delete_data) => {
        const requestOptions = {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(delete_data)
        }
        fetch(base + `/delete/memo_bills`, requestOptions).then(response => 
            response.json()).then(data => setStatus(data))
    }

    return (
        <div>
            <h3> Memo Bills </h3>
            <List>
                {data.map(bill => {
                    const {id, bill_number, type, amount} = bill
                    return (
                        <div className="wrapper">
                            <ListItem>
                            <ListItemText> <p><b>Bill Number: </b> {bill_number}</p> 
                                            <p><b>Type: </b> {types[type]}</p>
                                            <p><b>Amount: </b> {amount}</p>
                            </ListItemText>
                            <ListItemSecondaryAction>
                                <IconButton onClick={() => {handleDelete(id)}}>
                                    <DeleteIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                        </div>
                        
                    )
                })}
            </List>
        </div>
    )
}
