// Filename: ./components/ToggleSwitch.js

import React, { useState,useEffect} from "react";
import "./Toggle.css";

const Toggle = ({ label, onToggleChange ,defaultChecked }) => {
	const [isChecked, setIsChecked] = useState(defaultChecked || false);
	useEffect(() => {
		setIsChecked(defaultChecked);
	  }, [defaultChecked]);
	
  
    const handleChange = () => {
      setIsChecked(!isChecked); 
      onToggleChange(!isChecked,label); // Passes the new state of the toggle
    };
return (
	<div className="container">
<h3 className="cm">{label}</h3> 
	<div className="toggle-switch">
   
		<input type="checkbox" className="checkbox"
			name={label} id={label} checked={isChecked}
            onChange={handleChange}/>
		<label className="label" htmlFor={label}>
		<span className="inner" />
		<span className="switch" />
		</label>
	</div>
	</div>
);
};

export default Toggle;
