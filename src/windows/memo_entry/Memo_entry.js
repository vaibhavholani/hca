import React, {useState, useEffect, useRef, memo} from 'react'
import './Memo_entry.css'
import Home from '../home/Home'
import {useForm} from 'react-hook-form'
import {useParams} from 'react-router-dom'
import Autocomplete from '@material-ui/lab/Autocomplete';
import {keybind_form} from '../../hooks/keybind.js'
import Chip from '@material-ui/core/Chip'
import AddIcon from '@material-ui/icons/AddCircle';
import IconButton from '@material-ui/core/IconButton';
import Switch from '@material-ui/core/Switch'
import TextInput from '../Custom/TextInput'
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import CreditCardIcon from '@material-ui/icons/CreditCard'
import {validate} from './validation'
import {withStyles} from '@material-ui/core/styles'
import MuiAlert from '@material-ui/lab/Alert'
import Snackbar from '@material-ui/core/Snackbar'
import {base} from '../../proxy_url'


import {update_bill_color, getBillNumbers, getBank, getCredit, getDate} from './helpers'

const setKeyBinds = () => {
    var elements = document.getElementsByTagName('input');
      keybind_form("Enter", "forward", elements)
      keybind_form("ArrowDown", "forward", elements)
      keybind_form("ArrowUp", 'backward', elements)
}

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

// Custom Style button for credit add gr, credit or deduction
const PurpleSwitch = withStyles({
    switchBase: {
      color: "#3701c2",
      '&$checked': {
        color: '#827cfc',
      },
      '&$checked + $track': {
        backgroundColor: '#827cfc',
      },
    },
    checked: {},
    track: {},
  })(Switch);

// helper function to recalculate total amount
const setAmount = (bills, grAmount) => {
    var total = 0;
    bills.forEach(value => {
        total += value.pending;
    })
    total= total - grAmount;
    return total
}

export default function Memo_entry() {
    
    const [stateTracker, setStateTracker] = useState(0);
    const {register, handleSubmit, formState: {errors}, clearErrors, setError} = useForm();
    var {party, supplier} = useParams();
    party= JSON.parse(party);
    supplier = JSON.parse(supplier);
    const [bills, setBills] = useState([])
    const [credit, setCredit] = useState(0)
    const [selectedBills, setSelectedBills] = useState([])
    const [bank, setBank] = useState([])
    const [selectedBank, setSelectedBank] = useState(null);
    const [memo_type, setMemoType] = useState({name: ""});
    const [chequeNum, setChequeNum] = useState(0);
    const [payment, setPayment] = useState([])
    const [creditClick, setCreditClick] = useState(false);
    const [deductClick, setDeductClick] = useState(false);
    const [grClick, setGrClick] = useState(false);
    const [grAmount, setGrAmount] = useState(0);
    const [useCheque, setUseCheque] = useState(false);
    
    // validate is used to store error messages in file validation.js
    const [error, setError2] = useState(validate);
    const [total, setTotal] = useState(0);
    const [deduction, setDeduction] = useState(false);
    const [deductionValue, setDeductionValue] = useState(0);
    const date = getDate();
    
    const [successNotificationOpen, setSuccessNotificationOpen] = useState(false);
   

    useEffect(()=> {
        setTotal(setAmount(selectedBills, grAmount));
        
    }, [selectedBills, grAmount])

    // this useEffect is used to update the bills and credit amount whenever 
    // a new entry is submitted to create an "alive" effect
    useEffect(()=>{

        // resetting focus and keybinds
        document.getElementById("memo_type").focus()
        setKeyBinds();

        //getting informatin about partial amounts dynamically and updating it
        var promise = getBillNumbers(supplier["id"], party["id"])
        promise.then(data => {setBills(update_bill_color(data))})
        promise = getCredit(supplier["id"], party["id"])
        promise.then(data => {
            console.log(data)
            // if (data.length > 0) {
            //     const partial = data[0].partial_amount
            //     setCredit(partial)
            // }
            // else {
            //     setCredit(0)
            // }
        })
        // gets information about banks and updates them
        // TODO: is this required?
        promise= getBank()
        promise.then(data => setBank(data))
        
    }, [stateTracker])

    useEffect(()=> {
        // everytime memo type changed, the keybinds need be to set accodingly 
        // because different parts of the component are rendered
        setKeyBinds();
    }, [memo_type])

    const addPayment = () => {

        setError2({...error, BankName: validate.BankName, ChequeNumber: validate.ChequeNumber})
        
        // variable to determine if payment can be added
        var add = true;

        // validation checks for bank name and cheque number
        var cheque_num = document.getElementById('cheque_number').value
        if (selectedBank == null) {
            add = false;
            setError2(old => {
                return {...old, BankName: {
                    error: true, 
                    message: "Please Select a valid Bank Name"
                }}
            })
        }
        if (add && selectedBank.name === "Cash") {
            cheque_num = "0"
        }
        else if (cheque_num === "") {
            add = false;
            setError2(old => {
                return {...old, ChequeNumber: {
                    error: true,
                    message: "Please enter a valid Cheque Number"
                }
            }
        }) }
        
        // if all validation checks are passed, add the payment
        if (add) {
            const obj = {
                bank: selectedBank.name, 
                id: selectedBank.id,
                cheque: cheque_num
            }
    
            setPayment(old =>{return [...old, obj]})
        }
        
    }

    // form validation and submission
    const onSubmit = (value) => {

        var add = true;

        // library function: clear any old errors
        clearErrors();

        // reset all errors
        setError2(validate);

        // validation check to ensure there is atleast one payment method
        if (payment.length <= 0 && memo_type.name !== "Goods Return") {
            add = false;
            setError2(old => {
                return {...old, BankName: {
                    error: true, 
                    message: "Atleast one payment method requried"
                }, 
                ChequeNumber: {
                    error: true,
                    message: "Atleast one payment method requried"
                }
            }
            })
        }

        // checking that atlest one bill is selected
        if (selectedBills.length <= 0 && memo_type.name !== "Part") {
            add = false;
            setError2(old => {return {...old, BillNumbers: {error: true, message: old.BillNumbers.message}}})
        } 

        // checking that memo type is selected
        if (memo_type.name === "") {
            add = false;
            setError2(old => {return {...old, memo_type:{error: true, message: old.memo_type.message}}})
        }

        // if the the %method is picked in deduction, the deduction value is calculated
        if (deduction && deductClick) {
            const d_percent = (value.deduction)/100
            value.deduction = Math.ceil(value.amount*(d_percent))   
        }

        // This is the maxing amount that can be entered
        const max = setAmount(selectedBills, grAmount);

        // Just a dummy amount for the max gr that can be done
        const grMax = setAmount(selectedBills, 0);
        const pendingMax = setAmount(bills, 0);

        
        // check if gr amount is valid
        if (memo_type.name === "Full" && grAmount > grMax) {
            add= false;
            setError('memo_gr_amount', {type: "manual", message: `GR Amount must be less than or equal to ₹${grMax}`})}
        
        // if the value is not exact equal to max, there is an error
        if (memo_type.name === "Full" && value.amount != max) {
            add = false;
            setError('amount', {type: "manual", message: `Amount must be less than or equal to₹${max}`})
        }
        // one can't put a bigger part than the selected bill amount total
        else if (memo_type.name === "Partial" && value.amount > max) {
            add = false;
            setError('amount', {type: "manual", message: `Amount must be less than or equal to ₹${max}`})
        }
        // you can't return more than there is to return
        else if (memo_type.name === "Goods Return" && value.amount > max) {
            add = false;
            setError('amount', {type: "manual", message: `GR Amount must be less than or equal to ₹${max}`})
        }

        // check if memo_type is part then amount is less than grMax
        if (memo_type.name === "Part" && value.amount > pendingMax) {
            setError('amount', {type: "manual", message: `Amount must be less than total pending between supplier and party amount of ₹${grMax}`})
        }
        
        // add the memo entry if there are no errors
        if (add) {
            // setting the correct party and supplier id
            value["party_id"] = party["id"];
            value["supplier_id"] = supplier["id"];

            // setting custom entites which I could not add in the form hook
            value["selected_bills"] = selectedBills;
            value["payment"] = payment
            value["memo_type"] = memo_type.name
            
            fetch(`${base}/add/memo_entry/${JSON.stringify(value)}`).then(response => {
                return response.json();
            }).then(data => {
                const {status, ...err} = data;
                // setting an error if one is found in the backend
                if (status === "error") {
                    Object.keys(err).forEach(value => {
                        setError(value, {type: "manual", message: err[value].message})
                    })
                }
                else {
                // else showing the success badge
                setSuccessNotificationOpen(true)
                }

            }).catch(err => {
                // Do something for an error here
                console.log("Error Reading data " + err);
            });

            // resetting values
            setTotal(0)
            setGrAmount(0)
            setGrClick(false)
            
            // updating state to give the alive effect and closing the success window
            setTimeout(()=> {setStateTracker(old => old + 1); setSuccessNotificationOpen(false)}, 1500)
            
        }
        
    }

    // remove a payment method
    const handlePaymentDeleteClick = (event) => {
        event.preventDefault();
        payment.splice(event.target.id, 1)
        setPayment([...payment])
    }

    return (
        <>
        <Home />
        <div class="entry_content">
            
            {/* top box with supplier and party name*/}
            <div class= "form-box">
                <fieldset class="fieldset">
                    <legend><p class="section-header">Selection Information</p></legend>
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
                    <legend><p class="section-header">Bill Information</p></legend>
                    <div class="bill_child">
                        {/* The autcomplete here is from material ui class and not a custom one */}
                        <Autocomplete 
                            // component is not registered with memo_type
                            id="memo_type"
                            // options={[{name :"Full"}, {name :"Partial"}, {name : "Goods Return"}, {name : "Credit"}]} 
                            options={[{name :"Full"}, {name : "Part"}]} 
                            getOptionLabel = {(options) => options.name}
                            style={{width: 300}}
                            autoHighlight 
                            onChange = {(event, value) => {
                                // since the mode is change the errors don'e make sense anymore
                                clearErrors()
                                // changing the error displayed on memo type
                                setError2(old => {return {...old, memo_type: validate.memo_type}})

                                // error checks to ensure incorrect value is not place in memo_entry
                                if (value == null || value.name === "" || typeof value === 'undefined') {
                                    setMemoType({name: ""})
                                    setError2(old => {return {...old, memo_type:{error: true, message: old.memo_type.message}}})
                                }
                                else {
                                    setMemoType(value);
                                }
                            }}
                            // adding key binds
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                e.preventDefault()
                                // manually going to the next element
                                if (memo_type.name === "Part") {
                                    document.getElementById("memo_number").focus()
                                } else {
                                    document.getElementById("bill_numbers").focus()
                                }
                                }}}
                            
                            // Fancy memo type input rendering
                            renderInput= {(params) => <TextInput label="Memo Type" props={params} errorState={error.memo_type.error} errorText={error.memo_type.message} 
                             /> } />
                    </div>

                    <div class="memo_bill">
                        <Autocomplete 
                            // this autocomplere is used to select bill numbers
                            // NOTE: this component is not registered with useForm 
                            id="bill_numbers"
                            multiple={(memo_type.name === "Full" || memo_type.name === "Goods Return") ? true: false}
                            // to ensure this field is updated when memo types  is changed or a memo is submitted
                            key={`${JSON.stringify(memo_type)} ${stateTracker}`}
                            options={bills}
                            disabled={memo_type.name==="Part" ? true : false}
                            getOptionLabel = {(option) => option.bill_number.toString()}
                            renderOption={(option, props) => {
                                const {bill_number, color, pending} = option
                                return (
                                <span {...props} style={{color: color }}> #{bill_number} | Pending Amount: ₹{pending}</span>
                                )
                            }}

                            onChange = {(event, value) => {
                                if (value == null) {
                                    setSelectedBills([]);
                                }
                                else if (Array.isArray(value)) {
                                    setError2(old => {return {...old, BillNumbers: validate.BillNumbers}})
                                    setSelectedBills(value)
                                }
                                else {
                                    // TODO: why am I setting the error over here?
                                    setError2(old => {return {...old, BillNumbers: validate.BillNumbers}})
                                    setSelectedBills([value])
                                }
                                
                            }}
                            autoHighlight
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                e.preventDefault()
                                // custom key bind
                                document.getElementById("memo_number").focus()
                                
                                }}}
                            renderInput= {(params) => <TextInput label="Bill Numbers" errorState = {error.BillNumbers.error}
                            props={params} 
                            errorText={error.BillNumbers.message}/>}   />
                    </div> 
                    </fieldset> 
                
                {/* 
                                    START OF SECTION 2:    
                -> This section contians information about Memo Number, Date and Amount. 
                -> Each Component in this section is registered with use Form
                */}
                <fieldset class="fieldset">
                    <legend><p class="section-header">Memo Information</p></legend>
                    <div>
                    <TextInput id="memo_number" label="Memo Number" type="number" 
                            // Here error is set by "errors" and not "error". 
                            // "errors" is the form default error validation function
                            errorState={Boolean(errors.memo_number)} 
                            errorText={errors.memo_number?.message}
                            // Thus all the validation messages are added here itself
                            InputProps={{inputProps: {...register("memo_number", {required: "Please enter a Memo Number",
                                                                                min: {
                                                                                    value: 0,
                                                                                    message: "Please enter a positive number"
                                                                                }, 
                                                                                valueAsNumber: true
                        })}}}
                />
                    </div>
                    <div>
                        <TextInput label="Memo Date" type="date" defaultValue={date} 
                            // use of "errors" and not error
                            errorState={Boolean(errors.memo_date)} 
                            errorText={errors.memo_date?.message}
                            InputProps = {{inputProps: {...register("memo_date", {required: "Please enter a Memo date"})}}} />
                    </div>
                    <div>
                    <TextInput label="Amount" type="number" 
                            // use of "errors" and not error
                            errorState={Boolean(errors.amount)} 
                            errorText={errors.amount?.message}
                            value = {total}
                            // reset when the memo is submitted
                            key = {`gg${stateTracker}`}
                            defaultValue = {total}
                            // TODO: ASK RG: Set it such that the memo amount cannot be filled in, can avoid multiple erros
                            onChange = {(event, value) => {setTotal(value)}}
                            InputProps = {{inputProps: {...register("amount", {required: "Please enter an amount",
                                                                                min: {
                                                                                    value: 0,
                                                                                    message: "Please enter a positive number"
                                                                                }, 
                                                                                valueAsNumber: true
                            })}}} /> 
                    </div>
                </fieldset>

             {/* 
                            START OF SECTION 3: Payment Information
            
            */}
            {(memo_type.name !== "Goods Return") && <fieldset class="fieldset">
                <legend><p class="section-header">Payment Information</p></legend>            
                <div class="payment_information">
                    <fieldset class="bank" >
                        <legend><p class="section-header dark-purple">Add Bank Information</p></legend>
                        <Autocomplete 
                        // since this is a auto complete, it is not registerd with the form
                        // thus the errors are going to tracked by setError
                        id="bank_name"
                        options={bank} 
                        getOptionLabel = {(options) => options.name}
                        autoHighlight 
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                            e.preventDefault()
                            document.getElementById("cheque_number").focus()
                            }}}
                        
                        onChange={(event, value) => {
                            setSelectedBank(value);
                            if (value != null) {
                                if (value.name === "Cash") {
                                    setUseCheque(true)
                                } else {
                                    setUseCheque(false)
                                }
                            }
                            
                        }}
                        renderInput= {(params) => <TextInput label="Bank Name" type="text" errorState={error.BankName.error} errorText={error.BankName.message} props={params}   />} />

                        
                        <TextInput label="Cheque Number" id="cheque_number"
                            disabled={useCheque}
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    addPayment()
                                    document.getElementById("bank_name").focus()
                                }
                            }}
                            type="number" errorState={error.ChequeNumber.error} errorText={error.ChequeNumber.message} />
                        

                        <IconButton onClick={addPayment}><AddIcon style={{fontSize: 40, color: "#5f21fc"}} /></IconButton>
                    </fieldset>
                
                    <div class="selected_payment">

                    {payment.map((element, index) => {
                        return (
                                    <div class="bank_info">
                                        
                                        <p><AccountBalanceIcon /><b>Bank Name:</b> {element.bank}</p> 
                                        {<p><CreditCardIcon /> <b>Cheque Number:</b> {element.cheque} </p>} 
                                        <button id={index} onClick={handlePaymentDeleteClick} class="button">Delete</button>
                                    </div>
                        )
                                })}
                
                </div>
                </div>
                 {/* 
                            START OF SECTION 3: Additional Memo Information
                            TODO: Removing Radio Button to increase keybind efficiency
            
                */}

                {memo_type.name !== "Part" ? 
                <div class="additional">
                    <fieldset class="credit">
                        {/* This code is for using previous and pending part */}
                        <div>
                            <PurpleSwitch checked={creditClick} 
                            onChange = {(event, value) => {setCreditClick(value) } }
                            />
                            <h3 class="dark-purple">Use Part amount?</h3>
                        </div>

                        {/* Only displayed if check button is clicked. */}
                        {creditClick &&                     
                        <div >
                            <Chip label={`Available Part: ${credit}`} variant="outlined" />
                            <TextInput label="Part Amount" type="number" 
                            errorState = {Boolean(errors.credit_amount)}
                            errorText = {errors.credit_amount?.message}
                            // Here seems like text input is registered with the form
                            InputProps = {{inputProps: {...register("credit_amount", {required: "Fill in credit amount to be used", 
                            shouldUnregister: true, 
                            min: {
                                value: payment.length > 0 ? 0 : total,
                                message: `If no Bank Information is added, part amount must equal total: ₹${total}`
                            }, 
                            max: {
                                value: credit > total ? total : credit,
                                message: `Not enough available part or part used is more than total amount ₹${total}`
                            }, 
                            })}}}
                            />
                        </div>}
                    </fieldset>
                    
                    <fieldset class="credit">
                        {/* This Section is for Goods Return */}
                        <div>
                            <PurpleSwitch checked={grClick} 
                            onChange = {(event, value) => {setGrClick(value) } }
                            />
                            <h3 class="dark-purple">Add Goods Return? (GR)</h3>
                        </div>

                        {grClick &&                     
                        <div >
                            <TextInput label="GR Amount" type="number" 
                            errorState = {Boolean(errors.memo_gr_amount)}
                            errorText = {errors.memo_gr_amount?.message}
                            onChange={(e) => {
                                setGrAmount(e.target.value)
                            }}
                            InputProps = {{inputProps: {...register("memo_gr_amount", {required: "Please add gr amount on the bill", 
                            shouldUnregister: true, 
                            min: {
                                value: 0,
                                message: `GR amount cannot be negative`
                            }, 
                            max: {
                                value: total,
                                message: `GR amount cannot be greater than total amount: ${total}`
                            }, 
                            })}}}
                            />
                        </div>}

                    </fieldset>



                    <fieldset class="credit">
                        <div>
                        <PurpleSwitch checked={deductClick} 
                        onChange = {(event, value) => {setDeductClick(value) } }
                        />
                        <h3 class="dark-purple">Apply Deduction?</h3>
                        </div>

                        {deductClick &&                     
                        <div class="deduct">
                        <TextInput label="Deduction" type="number" 
                        errorState = {Boolean(errors.deduction)}
                        errorText = {errors.deduction?.message}
                        InputProps = {{inputProps: {...register("deduction", {required: "Fill in deduction to be applied", 
                        shouldUnregister: true, 
                        min: {
                            value: 0,
                            message: "Please enter a positive number"
                        },
                        max:{
                            value: deduction ? 100 : total,
                            message: "Invalid Max Value"
                        }, 
                        valueAsNumber: true
                    })}}}

                        />
                        <button className={deduction ? "selected button deduction_percent" : "button deduction_percent"} 
                        onClick={(event) => {event.preventDefault()
                                            setDeduction(true);
                        }}>%</button>

                        <button className={deduction ? "button deduction_amount" : "selected button deduction_amount"}  
                        onClick={(event) => {event.preventDefault()
                                            setDeduction(false)
                        
                        }}>₹</button>
                        </div>}
                    </fieldset>
                    

                </div> : null }
                        
                
            </fieldset>}
            
            <input type="submit" class="button" />
            </form>
            </div>
        </div>
        <Snackbar open={successNotificationOpen} autoHideDuration={4000} >
                <Alert  severity="success">
                    Memo Added!
                </Alert>
                </Snackbar>
        </>
    )
}
