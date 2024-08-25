import {base} from '../proxy_url'

export const deleteData = (entity, table_name, setStatus) => {

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entity),
    };
    fetch(base + `/delete/${table_name}`, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        setStatus(data);
      });
  };