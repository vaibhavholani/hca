import {base} from '../proxy_url'

export const addData = (data, setStatus) => {
    
    fetch(`${base}/add/entry`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => setStatus(data))
      .catch((err) => console.log("Error Reading data " + err));
  };