import React from 'react';
import "./Cart.css";
import cartImage from './images/bag.svg';
import cartimage from './images/chevron-down.svg';


function Cart(){
    
    return(
        
        <div className="cart-container">
            <div className="left-section">
                <img  
                    src={cartImage}
                    alt="Left" 
                    className="cart-image" 
                /> 
                <span className="cart-text">Your Bag (1 item)</span>
            </div>
            <img 
                src={cartimage}
                alt="Right" 
                className="cart-Image" 
            /> 
        </div>
    )
}
export default Cart ;