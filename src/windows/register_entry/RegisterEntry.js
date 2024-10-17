import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { makeStyles } from "@material-ui/core/styles";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { useParams } from "react-router-dom";
import Home from "../home/Home.js";
import { validate } from "./validation.js";
import TextInput from "../Custom/TextInput.js";
import { keybind_form } from "../../hooks/keybind.js";
import { validate_int, validate_required } from "../Custom/validate.js";
import Notification from "../Custom/Notification.js";
import { base } from "../../proxy_url.js";
import "./Register_entry.css";

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

const SAMPLE_DATA = {
  bill_number: 1,
  amount: 10,
  party: { id: 1, name: "RED" },
  register_date: "2024-12-1",
  supplier: { id: 1, name: "JOHN" },
};

const SAMPLE_SUPPLIER = [
  { id: 0, name: "RAJESH" },
  { id: 1, name: "JOHN" },
  { id: 2, name: "KUMAR" },
];
const SAMPLE_PARTIES = [
  { id: 0, name: "BLUE" },
  { id: 1, name: "RED" },
  { id: 2, name: "ORANGE" },
];

export default function RegisterEntry() {
  const uploadInputRef = useRef();

  const { type, supplier: supplierFromParams } = useParams();

  // Determine `selectSupplier` based on `type`
  const selectSupplier = type === "select";
  const supplierParsed = selectSupplier ? null : JSON.parse(supplierFromParams);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    control,
  } = useForm();
  const [suppliers, setSuppliers] = useState(SAMPLE_SUPPLIER);
  const [parties, setParties] = useState(SAMPLE_PARTIES);
  const [error, setError] = useState(validate);
  const [status, setStatus] = useState({
    status: "okay",
    message: "Register Entry Added",
  });
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [initialRender, setInitialRender] = useState(true);
  const date = getDate();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);

  // Function to handle file input change
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const validImageFiles = files.filter(file => file && file.type.startsWith("image/"));
  
    const uploadPromises = validImageFiles.map((file) => {
      const imageURL = URL.createObjectURL(file);
  
      const formData = new FormData();
      formData.append('image', file);
  
      return fetch(`${base}/parse_register_entry`, {
        method: 'POST',
        body: formData
      })
        .then(response => response.json())
        .then(parsedData => ({
          imageURL,
          data: parsedData
        }))
        .catch(error => {
          console.error('Error:', error);
          return {
            imageURL,
            data: {}
          };
        });
    });
  
    Promise.all(uploadPromises).then(filesArr => {
      setUploadedFiles(filesArr);
      setSelectedImgIndex(0); // Reset to the first image
    });
  };

  useEffect(() => {
    setKeyBinds();
    document.getElementById("bill_number").focus();

    if (selectSupplier) {
      fetch(`${base}/supplier_names_and_ids`)
        .then((response) => response.json())
        .then((data) => setSuppliers(data))
        .catch((err) => console.log("Error Reading data " + err));
    } else if (supplierParsed) {
      setValue("supplier", supplierParsed);
    }

    fetch(`${base}/party_names_and_ids`)
      .then((response) => response.json())
      .then((data) => setParties(data))
      .catch((err) => console.log("Error Reading data " + err));
  }, [selectSupplier]);

  useEffect(() => {
    if (uploadedFiles.length > 0) {
      const {
        bill_number,
        amount,
        party_name,
        supplier_name,
        register_date,
        date
      } = uploadedFiles[selectedImgIndex].data;
  
      setValue("amount", amount);
      setValue("bill_number", bill_number);
      setValue("register_date", date || register_date);
  
      // Find the supplier and party objects from the names
      const supplier = suppliers.find(s => s.name === supplier_name);
      const party = parties.find(p => p.name === party_name);
  
      setValue("supplier", supplier || null);
      setValue("party", party || null);
    }
  }, [uploadedFiles, selectedImgIndex, suppliers, parties]);

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
      const supplierId = selectSupplier
        ? data.supplier.id
        : supplierParsed.id;
      const requestData = {
        bill_number: data.bill_number,
        amount: data.amount,
        supplier_id: supplierId,
        party_id: data.party.id,
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

  const handleNextPhoto = () => {
    if (uploadedFiles.length === 1) return;
    let index = selectedImgIndex;
    if (index === uploadedFiles.length - 1) {
      setSelectedImgIndex(0);
    } else setSelectedImgIndex(index + 1);
  };

  const classes = useStyles();
  return (
    <>
      <Home />
      <div className="register-entry-wrapper">
        <div className="form-wrapper">
          <div>
            <div
              className="box-title"
              style={{ margin: "0 auto", width: "fit-content" }}
            >
              {selectSupplier ? (
                <h3 style={{ display: "inline" }}>Register Entry</h3>
              ) : (
                <h3 style={{ display: "inline" }}>
                  Supplier Name: {supplierParsed?.name}
                </h3>
              )}
            </div>
            <div className="form-box">
              <form onSubmit={handleSubmit(OnSubmit)}>
                <div className="form-box">
                  <div>
                    <Controller
                      name="bill_number"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <TextInput
                          label="Bill Number"
                          type="number"
                          id="bill_number"
                          errorText={error.bill_number.message}
                          errorState={error.bill_number.error}
                          {...field}
                        />
                      )}
                    />
                  </div>
                  <div>
                    <Controller
                      name="register_date"
                      control={control}
                      defaultValue={date}
                      render={({ field }) => (
                        <TextInput
                          label="Bill Date"
                          type="date"
                          errorState={false}
                          errorText="Invalid Date"
                          {...field}
                        />
                      )}
                    />
                  </div>
                  {selectSupplier && (
                    <Controller
                      name="supplier"
                      control={control}
                      defaultValue={null}
                      render={({ field }) => (
                        <Autocomplete
                          {...field}
                          options={suppliers}
                          getOptionLabel={(option) => option.name}
                          onChange={(event, value) => {
                            field.onChange(value);
                          }}
                          value={field.value}
                          autoHighlight
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              document.getElementById("parties").focus();
                              e.preventDefault();
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
                    />
                  )}
                  <div>
                    <Controller
                      name="party"
                      control={control}
                      defaultValue={null}
                      render={({ field }) => (
                        <Autocomplete
                          {...field}
                          options={parties}
                          getOptionLabel={(option) => option.name}
                          onChange={(event, value) => {
                            field.onChange(value);
                          }}
                          value={field.value}
                          autoHighlight
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              document.getElementById("amount").focus();
                              e.preventDefault();
                            }
                          }}
                          renderInput={(params) => (
                            <TextInput
                              label="Party Name"
                              props={params}
                              errorState={error.party?.error}
                              errorText={error.party?.message}
                            />
                          )}
                        />
                      )}
                    />
                  </div>
                  <div>
                    <Controller
                      name="amount"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <TextInput
                          label="Amount"
                          id="amount"
                          type="number"
                          errorState={error.amount.error}
                          errorText={error.amount.message}
                          {...field}
                        />
                      )}
                    />
                  </div>
                  <input type="submit" className="button" />
                </div>
              </form>
            </div>
          </div>
        </div>
        {selectSupplier && <div className="centered-line"></div>}
        {selectSupplier && (
          <div
            className={`upload-box ${uploadedFiles.length ? "" : "align-center"}`}
          >
            {uploadedFiles.length === 0 && (
              <button
                className="general-btn"
                onClick={() => uploadInputRef.current.click()}
              >
                Upload Photos
              </button>
            )}
            <input
              className="input-hide"
              ref={uploadInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
            />
            {uploadedFiles.length > 0 && (
              <div className="img-uploaded">
                <div className="box-title" style={{ margin: "0 auto" }}>
                  <h3 style={{ display: "inline" }}>Bill Photo</h3>
                </div>
                <div className="image-count">
                  {`image ${selectedImgIndex + 1} of ${uploadedFiles.length}`}
                </div>
                <div style={{ margin: "15px 0" }}>
                  <img
                    src={uploadedFiles[selectedImgIndex].imageURL}
                    width="601"
                    height="710"
                    alt="Uploaded"
                  />
                </div>
                <div className="next-photo-btn">
                  <button className="general-btn" onClick={handleNextPhoto}>
                    Next Photo
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
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
