import React from 'react';
import './Searches.css'; // Assuming you have a separate CSS file

const languageDictionary = {
  english: 'Recent Searches',
  hindi: 'हाल की खोजें',
  tamil: 'சமீபத்திய தேடல்கள்',
  telugu: 'ఇటీవలి శోధనలు',
};

function Searches({ recentSearches, onRecentSearchClick, lang }) {
  return (
    <div className="product-categories">
      <h3 className="rs">{languageDictionary[lang]}</h3>
      <div className='btn'>
      {recentSearches.map((search, index) => (
        <button 
          key={index} 
          className={`category-button${index + 1}`} 
          onClick={() => onRecentSearchClick(search)}
        >
          { `${search.slice(0,12)}..` }
        </button>
        
      ))}
      </div>
    </div>
  );
}

export default Searches;
