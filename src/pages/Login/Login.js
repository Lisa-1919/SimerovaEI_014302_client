import React, { useState, useRef } from 'react';


function Login() {
    const checkBtn = useRef();
  
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
  
    const handleRegister = (e) => {
      // register logic
  
      if (checkBtn.current.context._errors.length === 0) {
  
        console.log(username, password);
        // AuthService.register(username, email, password)
        //   .then(() => {
        //     // success callback
        //   })
        //   .catch(() => {
        //     // error callback 
        //   });
      }
    }
  
    return (
      <div>
        <div className='registration'>
          <input
            type="text"
            className="form-control"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            className="form-control"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={()=>handleRegister()} type="submit" class="btn">Sign in</button>
        </div>
      </div>
    )
  }
  export default Login;
  