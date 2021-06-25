import React, {useState, useEffect, useRef} from 'react'
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

const setAmount = (bills) => {
    var total = 0;
    bills.forEach(value => {
        total += value.pending;
    })
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
    const [useCheque, setUseCheque] = useState(false);
    const [error, setError2] = useState(validate);
    const [total, setTotal] = useState(0);
    const [deduction, setDeduction] = useState(false);
    const [deductionValue, setDeductionValue] = useState(0);
    const [open, setOpen] = useState(false);
    const date = getDate();
   

    useEffect(()=> {
        setTotal(setAmount(selectedBills));
        
    }, [selectedBills])


    useEffect(()=>{
        document.getElementById("memo_type").focus()
        setKeyBinds();
        var promise = getBillNumbers(supplier["id"], party["id"])
        promise.then(data => {setBills(update_bill_color(data))})
        promise = getCredit(supplier["id"], party["id"])
        promise.then(data => {
            if (data.length > 0) {
                const partial = data[0].partial_amount
                setCredit(partial)
            }
            else {
                setCredit(0)
            }
        })

        promise= getBank()
        promise.then(data => setBank(data))
        
    }, [stateTracker])

    useEffect(()=> {
        setKeyBinds();
    }, [memo_type])

    const addPayment = () => {

        setError2({...error, BankName: validate.BankName, ChequeNumber: validate.ChequeNumber})
        var add = true;
        var cheque_num = document.getElementById('cheque_number').value
        console.log(cheque_num)
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
        
        if (add) {
            const obj = {
                bank: selectedBank.name, 
                id: selectedBank.id,
                cheque: cheque_num
            }
    
            setPayment(old =>{return [...old, obj]})
        }
        
    }
    const onSubmit = (value) => {

        var add = true;
        clearErrors();
        setError2(validate);
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

        if (selectedBills.length <= 0) {
            add = false;
            setError2(old => {return {...old, BillNumbers: {error: true, message: old.BillNumbers.message}}})
        }

        if (memo_type.name === "") {
            add = false;
            setError2(old => {return {...old, memo_type:{error: true, message: old.memo_type.message}}})
        }

        if (deduction && deductClick) {
            const d_percent = (value.deduction)/100
            value.deduction = Math.ceil(value.amount*(d_percent))   
        }

        const max = setAmount(selectedBills);
        console.log(value.amount)
        if (memo_type.name === "Full" && value.amount != max) {
            add = false;
            setError('amount', {type: "manual", message: `Amount must be ₹${max}`})
        }
        else if (memo_type.name === "Partial" && value.amount > max) {
            add = false;
            setError('amount', {type: "manual", message: `Amount must be less than or equal to ₹${max}`})
        }
        else if (memo_type.name === "Goods Return" && value.amount > max) {
            add = false;
            setError('amount', {type: "manual", message: `GR Amount must be less than or equal to ₹${max}`})
        }
        


        if (add) {
            value["party_id"] = party["id"];
            value["supplier_id"] = supplier["id"];
            value["selected_bills"] = selectedBills;
            value["payment"] = payment
            value["memo_type"] = memo_type.name
            
            fetch(`${base}/add/memo_entry/${JSON.stringify(value)}`).then(response => {
                return response.json();
            }).then(data => {
                const {status, ...err} = data;
                if (status === "error") {
                    Object.keys(err).forEach(value => {
                        setError(value, {type: "manual", message: err[value].message})
                    })
                }
                else {
                setOpen(true)
                }
            }).catch(err => {
                // Do something for an error here
                console.log("Error Reading data " + err);
            });
            setTotal(0)
            setTimeout(()=> {setStateTracker(old => old + 1); setOpen(false)}, 1500)
            
        }
        
    }

    const handleDelete = (event) => {
        event.preventDefault();
        payment.splice(event.target.id, 1)
        setPayment([...payment])
    }

    return (
        <>
        <Home />
        <div class="entry_content">
        
            <div class= "form-box">
                <fieldset class="fieldset">
                    <legend><p class="section-header">Selection Information</p></legend>
                    <h3>Party Name: {party["name"]} </h3>
                    <h3>Supplier Name: {supplier["name"]} </h3>
                </fieldset>
                
            <form onSubmit={handleSubmit(onSubmit)}>
                <fieldset class="fieldset">
                    <legend><p class="section-header">Bill Information</p></legend>
                    <div class="bill_child">
                        <Autocomplete 
                            id="memo_type"
                            options={[{name :"Full"}, {name :"Partial"}, {name : "Goods Return"}, {name : "Credit"}]} 
                            style={{width: 300}}
                            getOptionLabel = {(options) => options.name}
                            autoHighlight 
                            onChange = {(event, value) => {
                                clearErrors()
                               
                                setError2(old => {return {...old, memo_type: validate.memo_type}})
                                if (value == null || value.name === "" || typeof value === 'undefined') {
                                    setMemoType({name: ""})
                                    setError2(old => {return {...old, memo_type:{error: true, message: old.memo_type.message}}})
                                }
                                else {
                                    setMemoType(value);
                                }
                            }}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                e.preventDefault()
                                document.getElementById("bill_numbers").focus()
                                }}}
                            renderInput= {(params) => <TextInput label="Memo Type" props={params} errorState={error.memo_type.error} errorText={error.memo_type.message} 
                             /> } />
                    </div>

                    <div class="memo_bill">
                        <Autocomplete 
                            id="bill_numbers"
                            multiple={(memo_type.name === "Full" || memo_type.name === "Goods Return") ? true: false}
                            key={`${JSON.stringify(memo_type)} ${stateTracker}`}
                            options={bills} 
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
                                    setError2(old => {return {...old, BillNumbers: validate.BillNumbers}})
                                    setSelectedBills([value])
                                }
                                
                            }}
                            autoHighlight
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                e.preventDefault()
                                document.getElementById("memo_number").focus()
                                // write your functionality here
                                }}}
                            renderInput= {(params) => <TextInput label="Bill Numbers" errorState = {error.BillNumbers.error}
                            props={params} 
                            errorText={error.BillNumbers.message}/>}   />
                    </div> 
                    </fieldset> 
            
                <fieldset class="fieldset">
                    <legend><p class="section-header">Memo Information</p></legend>
                    <div>
                    <TextInput id="memo_number" label="Memo Number" type="number" errorState={Boolean(errors.memo_number)} 
                            errorText={errors.memo_number?.message}
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
                        <TextInput label="Memo Date" type="date" defaultValue={date} errorState={Boolean(errors.memo_date)} 
                            errorText={errors.memo_date?.message}
                            InputProps = {{inputProps: {...register("memo_date", {required: "Please enter a Memo date"})}}} />
                    </div>
                    <div>
                    <TextInput label="Amount" type="number" errorState={Boolean(errors.amount)} 
                            errorText={errors.amount?.message}
                            value = {total}
                            key = {`gg${stateTracker}`}
                            defaultValue = {total}
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

            
            {(memo_type.name !== "Goods Return") && <fieldset class="fieldset">
                <legend><p class="section-header">Payment Information</p></legend>            
                <div class="payment_information">
                    <fieldset class="bank" >
                        <legend><p class="section-header dark-purple">Add Bank Information</p></legend>
                        <Autocomplete 
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
                                        <button id={index} onClick={handleDelete} class="button">Delete</button>
                                    </div>
                        )
                                })}
                
                </div>
                </div>
                <div class="additional">
                    <fieldset class="credit">
                    <div>
                    <PurpleSwitch checked={creditClick} 
                    onChange = {(event, value) => {setCreditClick(value) } }
                    />
                    <h3 class="dark-purple">Use Credit amount?</h3>
                    </div>

                    {creditClick &&                     
                    <div >
                    <Chip label={`Available Credit: ${credit}`} variant="outlined" />
                    <TextInput label="Credit Amount" type="number" 
                    errorState = {Boolean(errors.credit_amount)}
                    errorText = {errors.credit_amount?.message}
                    InputProps = {{inputProps: {...register("credit_amount", {required: "Fill in credit amount to be used", 
                    shouldUnregister: true, 
                    min: {
                        value: payment.length > 0 ? 0 : total,
                        message: `If no Bank Information is added, credit amount must equal total: ₹${total}`
                    }, 
                    max: {
                        value: credit > total ? total : credit,
                        message: `Not enough available credit or credit used is more than total amount ₹${total}`
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
                    

                </div>
                        
                
            </fieldset>}
            
            <input type="submit" class="button" />
            </form>
            </div>
        </div>
        <Snackbar open={open} autoHideDuration={4000} >
                <Alert  severity="success">
                    Memo Added!
                </Alert>
                </Snackbar>
        </>
    )
}
