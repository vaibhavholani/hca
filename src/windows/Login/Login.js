import React, {useState, useEffect, useContext} from 'react'
import { LoginContext } from '../../App';
import { ReactComponent as Logo } from '../home/logo_white.svg';
import TextInput from '../Custom/TextInput'
import {base} from '../../proxy_url'
import './Login.css'

export default function Login() {

  const {token, setToken}  = useContext(LoginContext)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const handleClick = () => {
      const opts = {
          method: 'POST',
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({
              "username":email,
              "password":password
          })
      }

      fetch(`${base}/token`, opts)
      .then(
          resp => {
              if (resp.status === 200) {
                  return resp.json();
              }
              else {
                  alert("Something went wrong...")
              }
          }
      )
      .then(data => {
          sessionStorage.setItem("token", data.access_token)
          setToken(data.access_token)
      })
      .then()
      .catch(error =>
        {
            console.error("Something went wrong...", error)
        })
  }

  return (
    <div class="flex">
    <div class="loginPage-Logo navbar-login-page">
        <Logo class="logo"/>
    </div>
    
    <div class="LoginForm form-box">
    <TextInput label="Username" value={email} onChange= {(e) => setEmail(e.target.value)}/>
    <TextInput label="Password" value={password} onChange= {(e) => setPassword(e.target.value)}/>
    <button class="button" onClick={handleClick}>Login</button>
      
    </div>
    </div>
  )

}
