import AutoComplete from '@material-ui/lab/Autocomplete'
import TextInput from '../Custom/TextInput'


export const selector_auto = (names, data, setData, key, selected) => {
    return (
        <AutoComplete 
            className="autocomplete"
            options={names}
            key={key}
            style={{width: 300}}
            disabled = {selected.table === "memo_entry"}
            getOptionLabel = {(options) => options.name}
            onChange={(event, value)=>{   
                if (value != null) {
                    setData(old => {return {...old, [key]: value.id}})
                }       
            }}
            value = {get_names(names, data[key])}
            defaultValue = {get_names(names, data[key])}
            autoHighlight 
            renderInput= {(params) => <TextInput label={key === "supplier_id" ? `Select Supplier Name` : 'Select Party Name'} 
                           props={params} />}   />
    )
}

const get_names = (arr, val) => {
    const name_obj = arr.filter(obj => {
        return obj.id === val
    })
    
    if (name_obj.length === 0) {
        return ""
    } 
    return name_obj[0]
}