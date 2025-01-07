import React, {useState, useEffect, useRef} from 'react'
import Autocomplete from '@material-ui/lab/Autocomplete'
import TextField from '@material-ui/core/TextField'
import Home from "../home/Home"
import {useParams, useHistory} from 'react-router-dom'
import {Button, ButtonGroup, LinearProgress, Snackbar} from '@material-ui/core'
import MuiAlert from '@material-ui/lab/Alert'
import {base} from '../../proxy_url'
import { downloadFrontendReport } from '../Reports/ReportGenerator.mjs';

const loadOptions = (mode)=> {
    
    var link;
    if (mode === "suppliers") {
        link = base + "/supplier_names_and_ids"
    }
    else {link = base + "/party_names_and_ids"}

    return (fetch(link).then(response => {
        return response.json();
      }))
}



export default function Multiple_Selector() {
    
    const {report, mode, to, from, suppliers} = useParams();
    const [selected, setSelected] = useState([])
    const [options, setOptions] = useState([])
    const validate = {error: false, message: `No ${mode} selected`}
    const [error, setError] = useState(validate)
    const history = useHistory();
    const [val, setVal] = useState([])

    const [supplierAll, setSupplierAll] = useState(false)
    const [partyAll, setPartyAll] = useState(false)
    const [progress, setProgress] = useState(0)
    const [showProgress, setShowProgress] = useState(false)
    const [message, setMessage] = useState('')
    const [processingState, setProcessingState] = useState('generating') // 'generating', 'compiling', or 'error'
    const [showMessage, setShowMessage] = useState(false)
    const progressTimer = useRef(null)
    const requestTimer = useRef(null)

    useEffect(()=>{
        const data = loadOptions(mode)
        data.then(val => setOptions(val))
        document.getElementById("selector").focus();
    }, [mode])

    const updateAllSelectionMode = (status) => {
        if (mode === "suppliers") {
            setSupplierAll(status)
        }
        else {
            setPartyAll(status)
        }
    }

    const addAll = () => {
        setSelected([...options])
        setVal([...options])
        updateAllSelectionMode(true)
    }

    const clearAll = () => {
        setVal([]);
        updateAllSelectionMode(false);
    }

    const submit = () => {
        setVal([])
        setError(validate)
        if (selected.length < 1) {
          setError(old => {return {...old, error: true}});
        }
        else {
          if (mode === "suppliers") {
            history.push(`/multiple_selector/${report}/parties/${from}/${to}/${JSON.stringify(selected)}`)
            setSelected([])
          }
            
            else {

            setShowProgress(true)
            setProgress(0)
            setProcessingState('generating')
            
            // Start progress timer
            progressTimer.current = setInterval(() => {
                setProgress(oldProgress => {
                    if (oldProgress >= 100) {
                        clearInterval(progressTimer.current)
                        setMessage("It's taking longer than expected but will be done shortly")
                        setShowMessage(true)
                        return 100
                    }
                    return Math.min(oldProgress + (100 / (20 * 10)), 100) // Updates every 100ms for 20s total
                })
            }, 100)

            const requestOptions = {
                method: 'POST', 
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({suppliers: suppliers, parties: JSON.stringify(selected), report: report, from: from, to: to, supplierAll: supplierAll, partyAll: partyAll}), 
            }
            
            fetch(base + '/create_report', requestOptions).then(response => {
                return response.json()
            }).then(json => {
                clearInterval(progressTimer.current)
                setProgress(100)
                setProcessingState('compiling')
                // Don't hide progress yet
                setMessage("Report will be available shortly")
                setShowMessage(true)
                // Hide progress only after starting the download
                downloadFrontendReport(json)
                setShowProgress(false)
            })
            .catch(err => {
                console.error(err)
                clearInterval(progressTimer.current)
                setProgress(100)
                setProcessingState('error')
                setMessage("An error occurred while generating the report")
                setShowMessage(true)
            });
            }
            }
        }

    const handleCloseMessage = () => {
        setShowMessage(false)
    }

    return (
        <div>
            {showProgress && (
                <div style={{ 
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000 
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        width: '300px'
                    }}>
                        <div style={{
                            marginBottom: '10px', 
                            textAlign: 'center',
                            color: processingState === 'compiling' ? '#4caf50' : 
                                  processingState === 'error' ? '#f44336' : 'inherit'
                        }}>
                            {processingState === 'generating' ? 'Generating Report...' : 
                             processingState === 'compiling' ? 'Report Generated! Compiling PDF...' :
                             'Error Generating Report'}
                        </div>
                        <LinearProgress 
                            variant="determinate" 
                            value={progress}
                            style={{
                                backgroundColor: processingState === 'compiling' ? '#b9f6ca' : 
                                               processingState === 'error' ? '#ffcdd2' : undefined
                            }}
                            classes={{
                                bar: processingState === 'compiling' ? 'MuiLinearProgress-barColorPrimary' : 
                                     processingState === 'error' ? 'MuiLinearProgress-barColorSecondary' : undefined
                            }}
                            color={processingState === 'compiling' ? 'primary' : 
                                  processingState === 'error' ? 'secondary' : undefined}
                        />
                    </div>
                </div>
            )}
            <Snackbar open={showMessage} autoHideDuration={6000} onClose={handleCloseMessage}>
                <MuiAlert 
                    elevation={6} 
                    variant="filled" 
                    severity={processingState === 'error' ? 'error' : 'info'} 
                    onClose={handleCloseMessage}
                >
                    {message}
                </MuiAlert>
            </Snackbar>
            <Home></Home>
            <div class="entry_content">
                <div class="form-box">
                <h2>Choose {mode}</h2>
                </div>
                <div class='form-box'>

                    <Autocomplete 
                        key={mode}
                        id="selector"
                        options={options} 
                        style={{width: 300, margin: 10}}
                        value = {val}
                        getOptionLabel = {(options) => options.name}
                        onChange={(event, value) => {
                            setSelected(value); 
                            setVal(value)}}
                        autoHighlight 
                        multiple
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                            submit();
                            }}
                            }
                        renderInput= {(params) => <TextField style={{overflowY: 'scroll', maxHeight: 300}} helperText={error.error ? error.message: null} error={error.error}{...params} variant="outlined" />}   />
                    <div style={{marginTop: "10px"}}>
                    <ButtonGroup color="primary" aria-label="outlined primary button group">
              <Button color="primary" onClick={addAll} >
                Add All
              </Button>
              <Button color="primary" onClick={clearAll} >
                Clear
              </Button>
            </ButtonGroup>

                    </div>
              
            <button onClick={submit} class="button">Submit</button>
            
            
            </div>
            </div>
        </div>
    )
}
