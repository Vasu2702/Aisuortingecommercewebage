import React, { useState, useEffect, useRef } from 'react';
import './Product.css';

function Product({ img, name, description, price, originalPrice, onLongPress, onDoubleClick, url,score }) {
  const [isVisible, setIsVisible] = useState(false);
  const longPressTimeout = useRef(null);
  const doubleClickTimeout = useRef(null);
  const lastClickTime = useRef(0);
  const [isSliderDragging, setIsSliderDragging] = useState(false);
  const isLongPress = useRef(false);

  useEffect(() => {
    setIsVisible(false);
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timeout);
  }, [img, name, description, price, originalPrice, url]);

  const discountPercentage = ((originalPrice - price) / originalPrice * 100).toFixed(0);

  const handleMouseDown = (event) => {
    event.preventDefault();
    isLongPress.current = false;
    if (!isSliderDragging) {
      longPressTimeout.current = setTimeout(() => {
        isLongPress.current = true;
        onLongPress();
      }, 1000);
    }
  };

  const handleMouseUp = (event) => {
    event.preventDefault();
    clearTimeout(longPressTimeout.current);

    if (!isSliderDragging && !isLongPress.current) {
      const clickTime = new Date().getTime();
      if (clickTime - lastClickTime.current < 300) {
        onDoubleClick();
        clearTimeout(doubleClickTimeout.current);
      } else {
        doubleClickTimeout.current = setTimeout(() => {
          window.open(url, '_blank');
        }, 300);
      }
      lastClickTime.current = clickTime;
    }
    setIsSliderDragging(false);
  };

  const handleTouchStart = (event) => {
    event.preventDefault();
    isLongPress.current = false;
    if (!isSliderDragging) {
      longPressTimeout.current = setTimeout(() => {
        isLongPress.current = true;
        onLongPress();
      }, 1000);
    }
  };

  const handleTouchEnd = (event) => {
    event.preventDefault();
    clearTimeout(longPressTimeout.current);

    if (!isSliderDragging && !isLongPress.current) {
      const clickTime = new Date().getTime();
      if (clickTime - lastClickTime.current < 300) {
        onDoubleClick();
        clearTimeout(doubleClickTimeout.current);
      } else {
        doubleClickTimeout.current = setTimeout(() => {
          window.open(url, '_blank');
        }, 300);
      }
      lastClickTime.current = clickTime;
    }
    setIsSliderDragging(false);
  };

  const handleTouchMove = () => {
    setIsSliderDragging(true);
  };

  const handleTouchCancel = () => {
    setIsSliderDragging(false);
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
  };

  return (
    <div
      className={`product ${isVisible ? 'fade-in' : 'fade-out'}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchCancel={handleTouchCancel}
      onContextMenu={handleContextMenu}
    >
      <div className="product-card">
      <span className='product-score'>{score}%</span>
        <img className={`product-image ${isVisible ? 'visible' : 'hidden'}`} src={img} alt={name}/>
       
        <div className="product-content">
          <h5>{name}</h5>
          <p className="product-description">{description}</p>
          <div className="price-container">
            <span className="original-price">₹{price.toFixed(0)}</span>
            {price !== originalPrice && (
              <>
                <span className="discount-price">₹{originalPrice.toFixed(0)}</span>
                <div className="discount-badge">{discountPercentage}% OFF</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Product;
