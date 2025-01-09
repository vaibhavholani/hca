import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { makeStyles } from "@material-ui/core/styles";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { useParams, useHistory } from "react-router-dom";
import Home from "../home/Home.js";
import { validate } from "./validation.js";
import TextInput from "../Custom/TextInput.js";
import { keybind_form } from "../../hooks/keybind.js";
import { validate_int, validate_required } from "../Custom/validate.js";
import Notification from "../Custom/Notification.js";
import { base } from "../../proxy_url.js";

const useStyles = makeStyles({
  root: {
    display: "inline",
  },
});

const setKeyBinds = () => {
  var elements = document.getElementsByTagName("input");
  keybind_form("Enter", "forward", elements);
};

export const getDate = () => {
  const dt = new Date();
  const year = dt.getFullYear();
  const month = (dt.getMonth() + 1).toString().padStart(2, "0");
  const day = dt.getDate().toString().padStart(2, "0");
  const date = year + "-" + month + "-" + day;
  return date;
};

export default function RegisterEntry() {
  const { type, supplier: supplierFromParams } = useParams();

  // Determine `selectSupplier` based on `type`
  const selectSupplier = type === "select";
  const supplierParsed = selectSupplier ? null : JSON.parse(supplierFromParams);

  const { register, handleSubmit, reset } = useForm();
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(
    selectSupplier ? null : supplierParsed
  );
  const [parties, setParties] = useState([]);
  const [party, setParty] = useState([]);
  const [error, setError] = useState(validate);
  const [status, setStatus] = useState({
    status: "okay",
    message: "Register Entry Added",
  });
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [initialRender, setInitialRender] = useState(true);
  const history = useHistory();
  const date = getDate();

  // Handle escape key to go back
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (type === 'select') {
          // When in select mode (selecting party), go back home
          history.push('/');
        } else {
          // When in deselect mode (after supplier selected), go back to supplier selection
          history.push('/selector/Supplier/register_entry/none');
        }
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [history, type]);

  useEffect(() => {
    setKeyBinds();
    document.getElementById("bill_number").focus();

    if (selectSupplier) {
      fetch(`${base}/supplier_names_and_ids`)
        .then((response) => response.json())
        .then((data) => setSuppliers(data))
        .catch((err) => console.log("Error Reading data " + err));
    }

    fetch(`${base}/party_names_and_ids`)
      .then((response) => response.json())
      .then((data) => setParties(data))
      .catch((err) => console.log("Error Reading data " + err));
  }, [selectSupplier]);

  const OnSubmit = (data) => {
    setError(validate);
    const { bill_number, amount } = data;
    let { err_status, update } = validate_required(data);

    if (!err_status) {
      ({ err_status, update } = validate_int({ bill_number, amount }));
    }

    if (err_status) {
      setError((old) => ({ ...old, ...update }));
    } else {
      const requestData = {
        bill_number: data.bill_number,
        amount: data.amount,
        supplier_id: selectedSupplier.id,
        party_id: party.id,
        register_date: data.register_date,
      };

      fetch(`${base}/add/register_entry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      })
        .then((response) => response.json())
        .then((data) => setStatus(data))
        .catch((err) => console.log("Error Reading data " + err));
    }
  };

  const resetRegisterEntry = () => {
    reset();
    document.getElementById("bill_number").focus();
  };

  const classes = useStyles();
  return (
    <>
      <Home />
      <div className="entry_content">
        <div className="form-box">
          {selectSupplier ? (
            <h3 style={{ display: "inline" }}>Register Entry</h3>
          ) : (
            <h3 style={{ display: "inline" }}>
              Supplier Name: {selectedSupplier?.name}
            </h3>
          )}
        </div>
        <form onSubmit={handleSubmit(OnSubmit)}>
          <div className="form-box">
            <div>
              <TextInput
                label="Bill Number"
                type="number"
                id="bill_number"
                errorText={error.bill_number.message}
                props={{ inputProps: { ...register("bill_number") } }}
                errorState={error.bill_number.error}
              />
            </div>
            <div>
              <TextInput
                label="Bill Date"
                type="date"
                defaultValue={date}
                errorState={false}
                errorText="Invalid Date"
                props={{ inputProps: { ...register("register_date") } }}
              />
            </div>
            {selectSupplier && (
              <Autocomplete
                options={suppliers}
                getOptionLabel={(option) => option.name}
                onChange={(event, value) => setSelectedSupplier(value)}
                autoHighlight
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    document.getElementById("parties").focus();
                    e.preventDefault();
                    // write your functionality here
                  }
                }}
                renderInput={(params) => (
                  <TextInput
                    label="Select Supplier"
                    props={params}
                    errorState={error.supplier?.error}
                    errorText={error.supplier?.message}
                  />
                )}
              />
            )}
            <div>
              <Autocomplete
                options={parties}
                id="parties"
                getOptionLabel={(parties) => parties.name}
                onChange={(event, value) => setParty(value)}
                autoHighlight
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    document.getElementById("amount").focus();
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
                label="Amount"
                id="amount"
                type="number"
                errorState={error.amount.error}
                errorText={error.amount.message}
                props={{ inputProps: { ...register("amount") } }}
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
        reset={resetRegisterEntry}
      />
    </>
  );
}
