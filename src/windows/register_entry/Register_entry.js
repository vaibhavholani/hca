import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { makeStyles } from "@material-ui/core/styles";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { useParams, useHistory } from "react-router-dom";
import Home from "../home/Home";
import { validate } from "./validation.js";
import TextInput from "../Custom/TextInput";
import { keybind_form } from "../../hooks/keybind";
import { validate_int, validate_required } from "../Custom/validate";
import Notification from "../Custom/Notification";
import { base } from "../../proxy_url";


const useStyles = makeStyles({
  root: {
    display: "inline",
  },
});

const setKeyBinds = () => {
  // Setting enter keybinds
  var elements = document.getElementsByTagName("input");
  keybind_form("Enter", "forward", elements);
  // keybind_form("ArrowDown", "forward", elements)
  // keybind_form("ArrowUp", 'backward', elements)

  //
};

const getDate = () => {
  // Setting date
  const dt = new Date();
  const year = dt.getFullYear();
  const month = (dt.getMonth() + 1).toString().padStart(2, "0");
  const day = dt.getDate().toString().padStart(2, "0");
  const date = year + "-" + month + "-" + day;
  return date;
};

export default function Register_entry() {
  var { supplier } = useParams();
  supplier = JSON.parse(supplier);
  const { register, handleSubmit, reset } = useForm();
  const [parties, setParties] = useState([]);
  const [party, setParty] = useState([]);
  const [error, setError] = useState(validate);
  const [submit, setSubmit] = useState(true);
  const [status, setStatus] = useState({
    status: "okay",
    message: "Register Entry Added",
  });
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [initialRender, setInitialRender] = useState(true); // Add initialRender flag
  const date = getDate();

  useEffect(() => {
    // Setting key binds
    setKeyBinds();
    document.getElementById("bill_number").focus();
    fetch(`${base}/party_names_and_ids`)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setParties(data);
      })
      .catch((err) => {
        console.log("Error Reading data " + err);
      });
  }, []);

  const OnSubmit = (data) => {
    setError(validate);
    var { err_status, update } = validate_required(data);
    const { bill_number, amount } = data;
    if (!err_status) {
      var { err_status, update } = validate_int({ bill_number, amount });
    }
    if (err_status) {
      setError((old) => {
        return { ...old, ...update };
      });
    }

    if (!err_status) {
      const requestData = {
        bill_number: data["bill_number"],
        amount: data["amount"],
        supplier_id: supplier["id"],
        party_id: party["id"],
        register_date: data["register_date"],
      };

      fetch(`${base}/add/register_entry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          setStatus(data)
        })
        .catch((err) => {
          // Do something for an error here
          console.log("Error Reading data " + err);
        });
    }
  };

  const resetRegisterEntry = () => { 
    reset();
    document.getElementById("bill_number").focus();
  }

  const classes = useStyles();
  return (
    <>
      <Home />
      <div class="entry_content">
        <div class="form-box">
          <h3 style={{ display: "inline" }}>
            Supplier Name: {supplier["name"]}
          </h3>
        </div>
        <form onSubmit={handleSubmit(OnSubmit)}>
          <div class="form-box">
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
            <div>
              <Autocomplete
                class="bind_down"
                options={parties}
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
            <input type="submit" class="button" />
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
