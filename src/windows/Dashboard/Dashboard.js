import React, {useState} from 'react'
import Home from '../home/Home'
import {backup} from './api_calls'
import './Dashboard.css'
import Notification from '../Custom/Notification'


export default function Dashboard() {

    const [successNotificationOpen, setSuccessNotificationOpen] = useState(false);


    return (
        <>
        <Home />
        <button className="button" onClick={() => {backup(setSuccessNotificationOpen)}}>Backup</button>
        
        <Notification message="Backup Successful" 
                    severity="success" 
                    notificationOpen={successNotificationOpen} 
                    setNotificationOpen={setSuccessNotificationOpen} />
        </>
    )
}
