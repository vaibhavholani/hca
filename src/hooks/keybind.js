export default function keybind(type, key, direction, elements) {
    
    const setFocus = (event) => {
        if (event.key === key) {
            event.preventDefault()
            if (direction === 'forward'){
                (event.currentTarget.next).focus()
            }
            else {
                (event.currentTarget.previous).focus()
            }
        }
    }

    for (var i=0; i<elements.length; i++){
        if (i !== (elements.length-1)){
            elements[i].addEventListener('keydown', setFocus)
            elements[i].next = elements[i+1];
            if (i === 0){
                elements[i].previous = elements[i]
            }
            else {
                elements[i].previous = elements[i-1];
            }
        }
        else{
            elements[i].addEventListener('keydown', setFocus)
            elements[i].next = elements[i];
            elements[i].previous = elements[i-1]
        }
        
    }


}

export function keybind_single(key, to, from) {
   

    const setFocus = (event) => {
        
        if (event.key === key) {
            from.focus();
        }
    }

    to.addEventListener('keydown', setFocus)
}

export function keybind_multiple(key, to, from){

    for (var i =0; i<to.length; i++){
        for (var x=0; x<from.length; x++){
            keybind_single(key, to[i], from[x])
        }
    }
}

export function keybind_form(key, direction, elements) {
    const setFocus = (event) => {
        
        if (event.key === key && !(event.currentTarget.classList.contains("MuiAutocomplete-input"))) {
            console.log(event.currentTarget.classList)
            if (event.currentTarget.not_last ){
                event.preventDefault()
            }
            
            if (direction === 'forward'){
                (event.currentTarget.next).focus()
            }
            else {
                (event.currentTarget.previous).focus()
            }
        }
    }

    for (var i=0; i<elements.length; i++){
        if (i !== (elements.length-1)){
            elements[i].addEventListener('keydown', setFocus)
            elements[i].next = elements[i+1];
            if (i === 0){
                elements[i].previous = elements[i]
            }
            else {
                elements[i].previous = elements[i-1];
            }
            elements[i].not_last = true;
        }
        else{
            elements[i].addEventListener('keydown', setFocus)
            elements[i].next = elements[i];
            elements[i].previous = elements[i-1]
            elements[i].not_last = false;
        }
        
    }
}