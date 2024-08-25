import React, { useEffect } from "react";
import MuiAlert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function Notification({
  status,
  setError,
  notificationOpen,
  setNotificationOpen,
  initialRender,
  setInitialRender,
  reset
}) {
  
  useEffect(() => {
    if (!initialRender) {
      setNotificationOpen(true);
      if (status.status === "error") {
        setError &&
        setError((old) => {
          return { ...old, ...status.input_errors};
      })}
      else {
        // if reset is not null, call the function
        reset && reset();
      }
    }
    else {
      setInitialRender(false);
    }
  }, [status]);

  useEffect(() => {
    if (notificationOpen) {
      setTimeout(() => {
        setNotificationOpen(false);
      }, 4000);
    }
  }, [notificationOpen]);

  return (
    <Snackbar open={notificationOpen} autoHideDuration={4000}>
      <Alert severity={status.status == "okay" ? "success" : "error"}>
        {status.message}
      </Alert>
    </Snackbar>
  );
}
