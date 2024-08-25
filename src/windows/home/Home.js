import './Home.css'
import React, {useEffect} from 'react'
import {MenuItems} from './MenuItems'
import keybind, {keybind_single, keybind_multiple} from '../../hooks/keybind'
import TextField from '@material-ui/core/TextField'
import { ReactComponent as Logo } from './ght_white.svg';

import {router_base} from '../../proxy_url'


const setKeybinds = () => {
    var elements = document.getElementsByClassName('entry-links')
    keybind("travel", "ArrowDown", "forward", elements)
    keybind("travel", "ArrowUp", "backward", elements)
    keybind_multiple("Escape", elements, document.getElementsByClassName('entry-tag'))
    var elements = document.getElementsByClassName('report-links')
    keybind("travel", "ArrowDown", "forward", elements)
    keybind("travel", "ArrowUp", "backward", elements)
    keybind_multiple("Escape", elements, document.getElementsByClassName('report-tag'))
    var elements = document.getElementsByClassName('new-links')
    keybind("travel", "ArrowDown", "forward", elements)
    keybind("travel", "ArrowUp", "backward", elements)
    keybind_multiple("Escape", elements, document.getElementsByClassName('new-tag'))
    var elements = document.getElementsByClassName('nav-links')
    keybind("travel", "ArrowRight", "forward", elements)
    keybind("travel", "ArrowLeft", "backward", elements)
    
    var to = document.getElementsByClassName("entry-tag")[0];
    var from = document.getElementsByClassName("register")[0];
    keybind_single("ArrowDown", to, from )
    keybind_single("ArrowUp", from, to )
    var to = document.getElementsByClassName("report-tag")[0];
    var from = document.getElementsByClassName("khata")[0];
    keybind_single("ArrowDown", to, from )
    keybind_single("ArrowUp", from, to )
    var to = document.getElementsByClassName("new-tag")[0];
    var from = document.getElementsByClassName("supplier")[0];
    keybind_single("ArrowDown", to, from )
    keybind_single("ArrowUp", from, to )

}

export default function Home() {

    useEffect(()=> {
        setKeybinds();
        (document.getElementsByClassName('entry-tag')[0]).focus()
    }, [])
   
    return (
        <>
            <div class="sticky">
            <nav className='navbar shadow'>
                <a href={`${router_base}/`} className="navbar-logo">
                     <Logo />
                </a>
                <ul className='nav-menu'>
                    {MenuItems.map((item, index)=> {
                        return (
                            <li key={index} className="nav-item">
                                <a className={item.cName} href={item.url}>
                                {item.title} <i className="fas fa-caret-down" />
                                </a>
                                {/* {dropdown && <Dropdown Items={item.links} key={item.title}/>} */}
                                <ul className={`dropdown-menu ${item.title}`}>
                                {(item.links).map((item2, index2) => {
                                    return(
                                    <li key={index2}>
                                        <a className={item2.cName} href={item2.url}>
                                            {item2.title}
                                        </a>
                                    </li>)
                                })}
                            </ul>
                            </li>
                        )
                    })}
                    <li className="nav-item" >
                        <a className="nav-links" href={`${router_base}/view`}>
                            View
                        </a>
                    </li>
                </ul>

            </nav>
            </div>

        </>
    )
}
