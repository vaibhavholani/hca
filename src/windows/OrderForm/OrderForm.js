import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Home from "../home/Home";
import { validate as orderFormValidation } from "./orderFormValidation.js";
import TextInput from "../Custom/TextInput";
import Notification from "../Custom/Notification";
import { keybind_form } from "../../hooks/keybind";
import { getDate } from "../register_entry/Register_entry";
import { base } from "../../proxy_url";

const setKeyBinds = () => {
  // Setting enter keybinds
  var elements = document.getElementsByTagName("input");
  keybind_form("Enter", "forward", elements);
  // keybind_form("ArrowDown", "forward", elements)
  // keybind_form("ArrowUp", 'backward', elements)
};

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
    // Setting key binds
    setKeyBinds();
    document.getElementById("suppliers").focus();

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

  const reset_func= () => {
    reset();
    document.getElementById("suppliers").focus();
  }

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
                id={"suppliers"}
                getOptionLabel={(option) => option.name}
                autoHighlight 
                onChange={(event, value) => setSelectedSupplier(value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    document.getElementById("parties").focus();
                    e.preventDefault();
                    // write your functionality here
                  }
                }}
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
                id={"parties"}
                getOptionLabel={(option) => option.name}
                autoHighlight 
                onChange={(event, value) => setSelectedParty(value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    document.getElementById("order_form_number").focus();
                    e.preventDefault();
                    // write your functionality here
                  }
                }}
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
        reset={reset_func}
      />
    </>
  );
};

export default OrderFormEntry;
