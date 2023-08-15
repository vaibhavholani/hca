import React, { useEffect, useState } from "react";
import Home from "../home/Home";
import { set, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { keybind_form } from "../../hooks/keybind.js";
import TextInput from "../Custom/TextInput";
import { validate } from "./validate";
import { validate_required } from "../Custom/validate";
import { base } from "../../proxy_url";
import Notification from "../Custom/Notification";

const setKeyBinds = () => {
  // Setting enter keybinds
  var elements = document.getElementsByTagName("input");
  keybind_form("Enter", "forward", elements);
  keybind_form("ArrowDown", "forward", elements);
  keybind_form("ArrowUp", "backward", elements);

  //
};

export default function New() {
  const { register, handleSubmit, reset } = useForm();
  const { entity } = useParams();
  const [error, setError] = useState(validate);
  const [status, setStatus] = useState({
    status: "okay",
    message: "Entity Added",
  });
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [initialRender, setInitialRender] = useState(true); // Add initialRender flag

  const OnSubmit = (data) => {
    setError(validate);
    const { err_status, update } = validate_required(data);
    if (err_status) {
      setError((old) => {
        return { ...old, ...update };
      });
    } else {
      data["entity"] = entity;

      fetch(`${base}/add/individual`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => {
          setStatus(data);
        });

      
    }
  };

  useEffect(() => {
    setKeyBinds();
    document.getElementById("name").focus();
  });

  return (
    <>
      <Home></Home>
      <div class="entry_content">
        <div class="form-box">
          <h1> Add {entity}</h1>
        </div>

        <form onSubmit={handleSubmit(OnSubmit)}>
          <div class="form-box">
            <div>
              <TextInput
                label="Name"
                id="name"
                type="text"
                errorState={error.name.error}
                errorText={error.name.message}
                props={register("name")}
              />
            </div>
            <div>
              <TextInput
                label="Phone Number"
                type="number"
                errorState={error.phone_number.error}
                errorText={error.phone_number.message}
                props={register("phone_number")}
              />
            </div>
            <div>
              <TextInput
                label="Address"
                type="text"
                errorState={error.address.error}
                errorText={error.address.message}
                props={register("address")}
              />
            </div>
            <div>
              <input type="submit" class="button" />
            </div>
          </div>
        </form>
        <Notification
          status={status}
          setError={setError}
          notificationOpen={notificationOpen}
          setNotificationOpen={setNotificationOpen}
          initialRender={initialRender}
          setInitialRender={setInitialRender}
          reset={reset}
        />
      </div>
    </>
  );
}
