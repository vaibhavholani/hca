import React, {useEffect} from 'react'
import MuiAlert from '@material-ui/lab/Alert'
import Snackbar from '@material-ui/core/Snackbar'

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

export default function Notification({message, severity, notificationOpen, setNotificationOpen}) {
    useEffect(()=> {
        if (notificationOpen) {
            setTimeout(() => {
                setNotificationOpen(false)
            }, 4000)
        }
    }, [notificationOpen])
    
  return (
    <Snackbar open={notificationOpen} autoHideDuration={4000} >
    <Alert  severity={severity}>
        {message}
    </Alert>
    </Snackbar>
  )
}
