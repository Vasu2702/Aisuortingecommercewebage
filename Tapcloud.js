import React, { useState ,useEffect} from 'react';
import './Tapcloud.css';
import arrow from './images/arrow.png'; // Assuming you have a separate CSS file

function Tapcloud({ tag_cloud, onTagClick,searchInitiated }) {
  const [clickedTags, setClickedTags] = useState({});
  
  // Filter out empty values and handle price_min and price_max
  useEffect(() => {
    // Reset clickedTags when search is initiated
    if (searchInitiated) {
      setClickedTags({});
    }
  }, [searchInitiated]);
  const filteredTags = Object.entries(tag_cloud)
    .filter(([key, value]) => {
      if (value === "") return false;
      if ((key === 'price_min' ) && value !== 0) return false;
      return true;
    })
    .slice(0, 8); // Take only the first 8 items

  const handleTagClick = (key) => {
    setClickedTags((prevClickedTags) => ({
      ...prevClickedTags,
      [key]: !prevClickedTags[key],
    }));
  };

  const handleSearchClick = () => {
    const searchQuery = Object.entries(tag_cloud)
      .filter(([tagKey, tagValue]) => clickedTags[tagKey])
      .map(([tagKey, tagValue]) => {
        if (tagKey === 'price_max') {
          return `under Rs. ${tagValue}`;
        } else {
          return tagValue;
        }
      })
      .join(' ');

    // Pass the concatenated search query to the parent component
    onTagClick(searchQuery);
    
  };

  return (
    <div className="product-categorie">
      <div className='tag'>
        <h3 className="r">Tag Cloud</h3>
        <div className='header-right'>
          <h3 className="s">Search</h3>
          <img src={arrow} alt="Your" className="header-image" onClick={handleSearchClick} />
        </div>
      </div>
      <div className='bt'>
        {filteredTags.map(([key, value]) => (
          <div key={key} className="tag-container">
            <span className="tag-key">{key}</span>
            <button
              className={`tap1 ${clickedTags[key] ? 'clicked' : ''}`}
              onClick={() => handleTagClick(key)}
            >
              {key === 'price_min' || key === 'price_max' ? `Rs.${value}` : `${value.slice(0, 8)}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Tapcloud;
