import React, {useState} from 'react'
import Home from '../home/Home'
import {backup} from './api_calls'
import './Dashboard.css'
import Notification from '../Custom/Notification'


export default function Dashboard() {

    const [status, setStatus] = useState({
        status: "okay",
        message: "Backup Successful",
      });
    const [successNotificationOpen, setSuccessNotificationOpen] = useState(false);
    const [initialRender, setInitialRender] = useState(true);

    return (
        <>
        <Home />
        <button className="button" onClick={() => {backup(setSuccessNotificationOpen)}}>Backup</button>
        
        <Notification message="Backup Successful" 
                    severity="success" 
                    status={status}
                    initialRender={initialRender}
                    setInitialRender={setInitialRender}
                    notificationOpen={successNotificationOpen} 
                    setNotificationOpen={setSuccessNotificationOpen} />
        </>
    )
}
