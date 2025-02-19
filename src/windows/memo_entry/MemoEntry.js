import React, { useState, useEffect, useRef, memo } from "react";
import "./Memo_entry.css";
import Home from "../home/Home.js";
import { useForm } from "react-hook-form";
import { useParams, useHistory } from "react-router-dom";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { keybind_form } from "../../hooks/keybind.js";
import Chip from "@material-ui/core/Chip";
import AddIcon from "@material-ui/icons/AddCircle";
import IconButton from "@material-ui/core/IconButton";
import Switch from "@material-ui/core/Switch";
import TextInput from "../Custom/TextInput.js";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import CreditCardIcon from "@material-ui/icons/CreditCard";
import { validate } from "./validation.js";
import { withStyles } from "@material-ui/core/styles";
import MuiAlert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import { base } from "../../proxy_url.js";
import Notification from "../Custom/Notification.js";

import {
  update_bill_color,
  getBillNumbers,
  getBank,
  getCredit,
  getDate,
} from "./helpers.js";
import {
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import { CheckBoxOutlineBlank, CheckBox } from "@material-ui/icons";


const setKeyBinds = () => {
  var elements = document.getElementsByTagName("input");

  keybind_form("Enter", "forward", elements);
  keybind_form("ArrowDown", "forward", elements);
  keybind_form("ArrowUp", "backward", elements);

};


// Custom Style button for credit add gr, credit or deduction
const PurpleSwitch = withStyles({
  switchBase: {
    color: "#3701c2",
    "&$checked": {
      color: "#827cfc",
    },
    "&$checked + $track": {
      backgroundColor: "#827cfc",
    },
  },
  checked: {},
  track: {},
})(Switch);

// helper function to recalculate total amount
const setAmount = (bills, grAmount, partAmount = 0, deduction = 0) => {
  var total = 0;
  bills.forEach((value) => {
    total += value.pending;
  });
  total = total - grAmount - partAmount - deduction;
  return total;
};

export default function MemoEntry() {
  const [stateTracker, setStateTracker] = useState(0);
  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    setError,
    reset,
  } = useForm();
  var { party, supplier } = useParams();
  party = JSON.parse(party);
  supplier = JSON.parse(supplier);
  const [bills, setBills] = useState([]);
  const [credit, setCredit] = useState([]);
  const [selectedBills, setSelectedBills] = useState([]);
  const [bank, setBank] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [partAmount, setPartAmount] = useState(0);
  const [selectedPart, setSelectedPart] = useState({});

  const [mode, setMode] = useState({ name: "" });
  const [chequeNum, setChequeNum] = useState(0);
  const [payment, setPayment] = useState([]);
  const [creditClick, setCreditClick] = useState(false);
  const [grAmount, setGrAmount] = useState(0);
  const [useCheque, setUseCheque] = useState(false);

  // validate is used to store error messages in file validation.js
  const [error, setError2] = useState(validate);
  const [total, setTotal] = useState(0);
  // use in part payment validation
  const [maxPart, setMaxPart] = useState(0);
  const [maxGR, setMaxGR] = useState(0);

  const [deduction, setDeduction] = useState(0);
  // const [deductionList, setDeductionList] = useState(0);

  const date = getDate();

  // Notification settings
  const [status, setStatus] = useState({
    status: "okay",
    message: "Memo Entry Added",
  });
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [initialRender, setInitialRender] = useState(true); // Add initialRender flag

  const history = useHistory();

  // Handle escape key to go back to party selection
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        history.push(`/selector/Party/memo_entry/${JSON.stringify(supplier)}`);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [history, supplier]);

  useEffect(() => {
    setTotal(setAmount(selectedBills, grAmount, partAmount, deduction));
    setMaxPart(setAmount(selectedBills, grAmount, 0, deduction));
    setMaxGR(setAmount(selectedBills, 0, partAmount, deduction));
  }, [selectedBills, grAmount, partAmount, deduction]);

  // this useEffect is used to update the bills and credit amount whenever
  // a new entry is submitted to create an "alive" effect
  useEffect(() => {
    // resetting focus and keybinds
    document.getElementById("mode").focus();
    setKeyBinds();

    //getting informatin about partial amounts dynamically and updating it
    var promise = getBillNumbers(supplier["id"], party["id"]);
    promise.then((data) => {
      setBills(update_bill_color(data));
    });
    promise = getCredit(supplier["id"], party["id"]);
    promise.then((data) => {
      if (data.length > 0) {
        setCredit(data);
      } else {
        setCredit([]);
      }
    });
    // gets information about banks and updates them
    // TODO: is this required?
    promise = getBank();
    promise.then((data) => setBank(data));
  }, [stateTracker]);

  useEffect(() => {
    // everytime memo type changed, the keybinds need be to set accodingly
    // because different parts of the component are rendered
    resetMemoEntry();
    setKeyBinds();
  }, [mode]);

  useEffect(() => {
    if (selectedBank != null) {
      if (selectedBank.name.toLowerCase() === "cash") {
        setUseCheque(true);
        addPayment();
        if (mode.name === "Part") {
          document.querySelector('input[type="submit"').focus();
        }
        else {
          document.getElementById("gr_amount").focus();}
        }
      else {
        setUseCheque(false);
    }}
  }, [selectedBank]);

  const addPayment = () => {
    setError2({
      ...error,
      BankName: validate.BankName,
      ChequeNumber: validate.ChequeNumber,
    });

    // variable to determine if payment can be added
    var add = true;

    // validation checks for bank name and cheque number
    var cheque_num = document.getElementById("cheque_number").value;
    if (selectedBank == null && total !== 0) {
      add = false;
      setError2((old) => {
        return {
          ...old,
          BankName: {
            error: true,
            message: "Please Select a valid Bank Name",
          },
        };
      });
    }
    
    if (add && selectedBank.name === "Cash") {
      cheque_num = "0";
    } else if (cheque_num === "" && total !== 0) {
      add = false;
      setError2((old) => {
        return {
          ...old,
          ChequeNumber: {
            error: true,
            message: "Please enter a valid Cheque Number",
          },
        };
      });
    }

    // check if cheque number and bankid are already used
    payment.forEach((value) => {
      if (value.bank === selectedBank.name && value.cheque === cheque_num) {
        add = false;
      }
    });

    // if all validation checks are passed, add the payment
    if (add) {
      const obj = {
        bank: selectedBank.name,
        id: selectedBank.id,
        cheque: cheque_num,
      };

      setPayment((old) => {
        return [...old, obj];
      });
    }
  };

  // used to track which parts are used, if used
  const handlePartCheckBoxChange = (bill) => {
    const { memo_id, amount } = bill;

    if (selectedPart[memo_id]) {
      setPartAmount((old) => old - amount);
    } else {
      setPartAmount((old) => old + amount);
    }

    setSelectedPart((prevCheckedItems) => ({
      ...prevCheckedItems,
      [memo_id]: !prevCheckedItems[memo_id],
    }));
  };

  useEffect(() => {
    console.log(selectedPart);
  }, [selectedPart]);

  // form validation and submission
  const onSubmit = (value) => {
    var add = true;

    // library function: clear any old errors
    clearErrors();

    // reset all errors
    setError2(validate);

    // ensuring value.amount is total
    if (mode.name !== "Part") {
      value.amount = total;
    }

    // validation check to ensure there is atleast one payment method
    if (payment.length <= 0 && total !== 0) {
      add = false;
      setError2((old) => {
        return {
          ...old,
          BankName: {
            error: true,
            message: "Atleast one payment method requried",
          },
          ChequeNumber: {
            error: true,
            message: "Atleast one payment method requried",
          },
        };
      });
    }

    // checking that atlest one bill is selected
    if (selectedBills.length <= 0 && mode.name !== "Part") {
      add = false;
      setError2((old) => {
        return {
          ...old,
          BillNumbers: { error: true, message: old.BillNumbers.message },
        };
      });
    }

    // checking that memo type is selected
    if (mode.name === "") {
      add = false;
      setError2((old) => {
        return { ...old, mode: { error: true, message: old.mode.message } };
      });
    }

    // This is the maxing amount that can be entered
    const max = setAmount(selectedBills, grAmount, partAmount, deduction);

    // Just a dummy amount for the max gr that can be done
    const grMax = setAmount(selectedBills, 0, partAmount);
    const pendingMax = setAmount(bills, 0);

    // check if gr amount is valid
    if (mode.name === "Full" && grAmount > grMax) {
      add = false;
      setError("gr_amount", {
        type: "manual",
        message: `GR Amount must be less than or equal to ₹${grMax}`,
      });
    }

    // if the value is not exact equal to max, there is an error
    if (mode.name === "Full" && value.amount != max) {
      add = false;
      setError("amount", {
        type: "manual",
        message: `Amount must be less than or equal to₹${max}`,
      });
    }
    // one can't put a bigger part than the selected bill amount total
    else if (mode.name === "Partial" && value.amount > max) {
      add = false;
      setError("amount", {
        type: "manual",
        message: `Amount must be less than or equal to ₹${max}`,
      });
    }
    // you can't return more than there is to return
    else if (mode.name === "Goods Return" && value.amount > max) {
      add = false;
      setError("amount", {
        type: "manual",
        message: `GR Amount must be less than or equal to ₹${max}`,
      });
    }

    // check if mode is part then amount is less than grMax
    if (mode.name === "Part" && value.amount > pendingMax) {
      add = false;
      setError("amount", {
        type: "manual",
        message: `Amount must be less than total pending between supplier and party amount of ₹${pendingMax}`,
      });
    }

    // add the memo entry if there are no errors
    if (add) {
      // setting the correct party and supplier id
      value["party_id"] = party["id"];
      value["supplier_id"] = supplier["id"];
      // setting custom entites which I could not add in the form hook
      value["selected_bills"] = selectedBills;
      value["selected_part"] = Object.keys(selectedPart);
      value["payment"] = payment;
      value["mode"] = mode.name;
      value["deduction"] = deduction;

      // sending the data to the backend
      fetch(`${base}/add/memo_entry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(value),
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          setStatus(data);
        })
        .catch((err) => {
          // Do something for an error here
          console.log("Error Reading data " + err);
        });
    }
  };

  const resetMemoEntry = () => {
    setTotal(0);
    setGrAmount(0);
    setDeduction(0);
    setPartAmount(0);
    setCreditClick(false);
    setSelectedBills([]);
    setPayment([]);
    reset();
    setStateTracker((old) => old + 1);
  };

  // remove a payment method
  const handlePaymentDeleteClick = (event) => {
    event.preventDefault();
    payment.splice(event.target.id, 1);
    setPayment([...payment]);
  };

  return (
    <>
      <Home />
      <div class="entry_content">
        {/* top box with supplier and party name*/}
        <div class="form-box">
          <fieldset class="fieldset">
            <legend>
              <p class="section-header">Selection Information</p>
            </legend>
            <h3>Party Name: {party["name"]} </h3>
            <h3>Supplier Name: {supplier["name"]} </h3>
          </fieldset>

          {/* huge form component 
                Here handleSubmit is the library function (which can probably 
                    call a custom function)
                OnSubmit is the custom function
            */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <fieldset class="fieldset">
              {/* Bill information section contains information on Memo Type (full, part, etc) and the bill numbers to be selected */}
              <legend>
                <p class="section-header">Bill Information</p>
              </legend>
              <div class="bill_child">
                {/* The autcomplete here is from material ui class and not a custom one */}
                <Autocomplete
                  // component is not registered with mode
                  id="mode"
                  // options={[{name :"Full"}, {name :"Partial"}, {name : "Goods Return"}, {name : "Credit"}]}
                  options={[{ name: "Full" }, { name: "Part" }]}
                  getOptionLabel={(options) => options.name}
                  style={{ width: 300 }}
                  autoHighlight
                  onChange={(event, value) => {
                    // since the mode is change the errors don'e make sense anymore
                    clearErrors();
                    // changing the error displayed on memo type
                    setError2((old) => {
                      return { ...old, mode: validate.mode };
                    });

                    // error checks to ensure incorrect value is not place in memo_entry
                    if (
                      value == null ||
                      value.name === "" ||
                      typeof value === "undefined"
                    ) {
                      setMode({ name: "" });
                      setError2((old) => {
                        return {
                          ...old,
                          mode: { error: true, message: old.mode.message },
                        };
                      });
                    } else {
                      setMode(value);
                    }
                  }}
                  // adding key binds
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      // manually going to the next element
                      if (mode.name === "Part") {
                        document.getElementById("memo_number").focus();
                      } else {
                        document.getElementById("bill_numbers").focus();
                      }
                    }
                  }}
                  // Fancy memo type input rendering
                  renderInput={(params) => (
                    <TextInput
                      label="Memo Type"
                      props={params}
                      errorState={error.mode.error}
                      errorText={error.mode.message}
                    />
                  )}
                />
              </div>

              <div class="memo_bill">
                <Autocomplete
                  // this autocomplere is used to select bill numbers
                  // NOTE: this component is not registered with useForm
                  id="bill_numbers"
                  multiple={
                    mode.name === "Full" || mode.name === "Goods Return"
                      ? true
                      : false
                  }
                  // to ensure this field is updated when memo types  is changed or a memo is submitted
                  key={`${JSON.stringify(mode)} ${stateTracker}`}
                  options={bills}
                  disabled={mode.name === "Part" ? true : false}
                  getOptionLabel={(option) => option.bill_number.toString()}
                  renderOption={(option, props) => {
                    const { bill_number, color, pending, register_date } =
                      option;
                    return (
                      <span {...props} style={{ color: color }}>
                        {" "}
                        #{bill_number} | {register_date} | ₹{pending}
                      </span>
                    );
                  }}
                  onChange={(event, value) => {
                    if (value == null) {
                      setSelectedBills([]);
                    } else if (Array.isArray(value)) {
                      setError2((old) => {
                        return { ...old, BillNumbers: validate.BillNumbers };
                      });
                      setSelectedBills(value);
                    } else {
                      // TODO: why am I setting the error over here?
                      setError2((old) => {
                        return { ...old, BillNumbers: validate.BillNumbers };
                      });
                      setSelectedBills([value]);
                    }
                  }}
                  autoHighlight
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      // custom key bind
                      document.getElementById("memo_number").focus();
                    }
                  }}
                  renderInput={(params) => (
                    <TextInput
                      label="Bill Numbers"
                      errorState={error.BillNumbers.error}
                      props={params}
                      errorText={error.BillNumbers.message}
                    />
                  )}
                />
              </div>
            </fieldset>

            {/* 
                                    START OF SECTION 2:    
                -> This section contians information about Memo Number, Date and Amount. 
                -> Each Component in this section is registered with use Form
                */}
            <fieldset class="fieldset">
              <legend>
                <p class="section-header">Memo Information</p>
              </legend>
              <div>
                <TextInput
                  id="memo_number"
                  label="Memo Number"
                  type="number"
                  // Here error is set by "errors" and not "error".
                  // "errors" is the form default error validation function
                  errorState={Boolean(errors.memo_number)}
                  errorText={errors.memo_number?.message}
                  // Thus all the validation messages are added here itself
                  InputProps={{
                    inputProps: {
                      ...register("memo_number", {
                        required: "Please enter a Memo Number",
                        min: {
                          value: 0,
                          message: "Please enter a positive number",
                        },
                        valueAsNumber: true,
                      }),
                    },
                  }}
                />
              </div>
              <div>
                <TextInput
                  label="Memo Date"
                  type="date"
                  defaultValue={date}
                  // use of "errors" and not error
                  errorState={Boolean(errors.register_date)}
                  errorText={errors.register_date?.message}
                  InputProps={{
                    inputProps: {
                      ...register("register_date", {
                        required: "Please enter a Memo date",
                      }),
                    },
                  }}
                />
              </div>
              <div>
                <TextInput
                  label="Amount"
                  type="number"
                  // use of "errors" and not error
                  errorState={Boolean(errors.amount)}
                  errorText={errors.amount?.message}
                  value={total}
                  // reset when the memo is submitted
                  key={`gg${stateTracker}`}
                  defaultValue={total}
                  // TODO: ASK RG: Set it such that the memo amount cannot be filled in, can avoid multiple erros
                  onChange={(event, value) => {
                    setTotal(value);
                  }}
                  InputProps={{
                    inputProps: {
                      ...register("amount", {
                        required: "Please enter an amount",
                        min: {
                          value: 0,
                          message: "Please enter a positive number",
                        },
                        valueAsNumber: true,
                      }),
                    },
                  }}
                />
              </div>
            </fieldset>

            {/* 
                            START OF SECTION 3: Payment Information
            
            */}
            {/* Payment Information Section */}
            {mode.name !== "Goods Return" && (
              <fieldset class="fieldset">
                <legend>
                  <p class="section-header">Payment Information</p>
                </legend>
                <div class="payment_information">
                  <fieldset class="bank">
                    <legend>
                      <p class="section-header dark-purple">
                        Add Bank Information
                      </p>
                    </legend>
                    <Autocomplete
                      // since this is a auto complete, it is not registerd with the form
                      // thus the errors are going to tracked by setError
                      id="bank_name"
                      options={bank}
                      getOptionLabel={(options) => options.name}
                      autoHighlight
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          document.getElementById("cheque_number").focus();
                        }
                      }}
                      onChange={(event, value) => {
                        setSelectedBank(value);
                        
                      }}
                      renderInput={(params) => (
                        <TextInput
                          label="Bank Name"
                          type="text"
                          errorState={error.BankName.error}
                          errorText={error.BankName.message}
                          props={params}
                        />
                      )}
                    />

                    <TextInput
                      label="Cheque Number"
                      id="cheque_number"
                      disabled={useCheque}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          console.log("I am registered");
                          // manually going to the next element
                          if (mode.name === "Part") {
                            document.getElementById("memo_number").focus();
                          } else {
                            document.getElementById("bill_numbers").focus();
                          }
                        }
                      }}
                      type="number"
                      errorState={error.ChequeNumber.error}
                      errorText={error.ChequeNumber.message}
                    />

                    <IconButton onClick={addPayment}>
                      <AddIcon style={{ fontSize: 40, color: "#5f21fc" }} />
                    </IconButton>
                  </fieldset>

                  <div class="selected_payment">
                    {payment.map((element, index) => {
                      return (
                        <div class="bank_info">
                          <p>
                            <AccountBalanceIcon />
                            <b>Bank Name:</b> {element.bank}
                          </p>
                          {
                            <p>
                              <CreditCardIcon /> <b>Cheque Number:</b>{" "}
                              {element.cheque}{" "}
                            </p>
                          }
                          <button
                            id={index}
                            onClick={handlePaymentDeleteClick}
                            class="button"
                          >
                            Delete
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </fieldset>
            )}

            {/* Additional Information Section */}
            {mode.name !== "Part" && (
              <fieldset class="fieldset">
                <legend>
                  <p className="section-header">Additional Information</p>
                </legend>

                {/* Part Amount Section */}
                <fieldset className="credit">
                  <div>
                    <PurpleSwitch
                      checked={creditClick}
                      onChange={(event, value) => {
                        setCreditClick(value);
                        if (!value) {
                          setPartAmount(0);
                          setSelectedPart({});
                        }
                      }}
                    />
                    <h3 className="dark-purple">Use Part amount?</h3>
                  </div>

                  {creditClick && (
                    <div>
                      <List>
                        {credit.map((item) => (
                          <ListItem
                            key={item.memo_id}
                            button
                            onClick={() => handlePartCheckBoxChange(item)}
                          >
                            <ListItemIcon>
                              <Checkbox
                                icon={<CheckBoxOutlineBlank />}
                                checkedIcon={<CheckBox />}
                                checked={selectedPart[item.memo_id] || false}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={`Amount: ${item.amount} | Memo Number: ${item.memo_number} | Date: ${item.date}`}
                            />
                          </ListItem>
                        ))}
                      </List>

                      <TextInput
                        label="Part Amount"
                        type="number"
                        errorState={Boolean(errors.credit_amount)}
                        errorText={errors.credit_amount?.message}
                        value={partAmount}
                        InputProps={{
                          inputProps: {
                            ...register("credit_amount", {
                              required: "Fill in credit amount to be used",
                              shouldUnregister: true,
                              min: {
                                value: payment.length > 0 ? 0 : total,
                                message: `If no Bank Information is added, part amount must equal total: ₹${total}`,
                              },
                              max: {
                                value:
                                  partAmount > maxPart ? maxPart : partAmount,
                                message: `Not enough available part or part used is more than total amount ₹${maxPart}`,
                              },
                            }),
                          },
                        }}
                      />
                    </div>
                  )}
                </fieldset>

                {/* GR Amount and Deduction as normal text fields */}
                <div className="form-fields">
                  <TextInput
                    label="GR Amount"
                    type="number"
                    id="gr_amount"
                    value={grAmount}
                    onChange={(e) => setGrAmount(Number(e.target.value) || 0)}
                    InputProps = {{inputProps: {...register("gr_amount", {
                      min: {
                          value: 0,
                          message: `GR amount cannot be negative`
                      }, 
                      max: {
                          value: maxGR,
                          message: `GR amount cannot be greater than total amount: ${maxGR}`
                      }, 
                      })}}}
                  />

                  <TextInput
                    label="Deduction"
                    type="number"
                    value={deduction}
                    onChange={(e) => setDeduction(Number(e.target.value) || 0)}
                    InputProps = {{inputProps: {...register("deduction", {
                      min: {
                          value: 0,
                          message: "Please enter a positive number"
                      },
                      max:{
                          value: setAmount(selectedBills, grAmount, partAmount),
                          message: "Invalid Max Value"
                      }, 
                      valueAsNumber: true
                  })}}}
                  />
                </div>
              </fieldset>
            )}

            <input type="submit" class="button" />
          </form>
        </div>
      </div>

      <Notification
        status={status}
        setError={setError2}
        notificationOpen={notificationOpen}
        setNotificationOpen={setNotificationOpen}
        initialRender={initialRender}
        setInitialRender={setInitialRender}
        reset={resetMemoEntry}
      />
    </>
  );
}
