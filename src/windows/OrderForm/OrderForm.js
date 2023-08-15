import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Home from "../home/Home";
import { validate as orderFormValidation } from "./orderFormValidation.js";
import TextInput from "../Custom/TextInput";
import Notification from "../Custom/Notification";
import {getDate} from '../register_entry/Register_entry'
import { base } from "../../proxy_url";

const OrderFormEntry = () => {
  const [parties, setParties] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedParty, setSelectedParty] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [error, setError] = useState(orderFormValidation);
  const [status, setStatus] = useState({
    status: "okay",
    message: "Order Form Added",
  });
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [initialRender, setInitialRender] = useState(true);
  
  const { register, handleSubmit, reset } = useForm();

  const date = getDate();


  useEffect(() => {
    // Fetch party data from API
    fetch(`${base}/party_names_and_ids`)
      .then((response) => response.json())
      .then((data) => setParties(data))
      .catch((err) => console.log("Error Reading data " + err));

    // Fetch supplier data from API
    fetch(`${base}/supplier_names_and_ids`)
      .then((response) => response.json())
      .then((data) => setSuppliers(data))
      .catch((err) => console.log("Error Reading data " + err));
  }, []);

  const onSubmit = (data) => {
    setError(orderFormValidation);

    const requestData = {
      order_form_number: data["order_form_number"],
      supplier_id: selectedSupplier ? selectedSupplier.id : null,
      party_id: selectedParty ? selectedParty.id : null,
      register_date: data["register_date"],
    };

    fetch(`${base}/add/order_form`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => response.json())
      .then((data) => setStatus(data))
      .catch((err) => console.log("Error Reading data " + err));
  };

  return (
    <>
      <Home />
      <div className="entry_content">
        <div className="form-box">
          <h3>Order Form Entry</h3>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-box">
            <div>
              <Autocomplete
                options={suppliers}
                getOptionLabel={(option) => option.name}
                onChange={(event, value) => setSelectedSupplier(value)}
                renderInput={(params) => (
                  <TextInput
                    label="Supplier Name"
                    props={params}
                    custom={register("supplier")}
                    errorState={error.supplier.error}
                    errorText={error.supplier.message}
                  />
                )}
              />
            </div>
            <div>
              <Autocomplete
                options={parties}
                getOptionLabel={(option) => option.name}
                onChange={(event, value) => setSelectedParty(value)}
                renderInput={(params) => (
                  <TextInput
                    label="Party Name"
                    props={params}
                    custom={register("party")}
                    errorState={error.party.error}
                    errorText={error.party.message}
                  />
                )}
              />
            </div>
            <div>
              <TextInput
                label="Order Form Number"
                type="number"
                id="order_form_number"
                errorText={error.order_form_number.message}
                props={{ inputProps: { ...register("order_form_number") } }}
                errorState={error.order_form_number.error}
              />
            </div>
            <div>
              <TextInput
                label="Order Date"
                type="date"
                defaultValue={date}
                errorState={false}
                errorText="Invalid Date"
                props={{ inputProps: { ...register("register_date") } }}
              />
            </div>
            <input type="submit" className="button" />
          </div>
        </form>
      </div>
      <Notification
        status={status}
        setError={setError}
        notificationOpen={notificationOpen}
        setNotificationOpen={setNotificationOpen}
        initialRender={initialRender}
        setInitialRender={setInitialRender}
        reset={reset}
      />
    </>
  );
};

export default OrderFormEntry;
