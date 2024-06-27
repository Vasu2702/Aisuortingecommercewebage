import React, { useState, useEffect, useRef } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Product from './Product';
import Tapcloud from './Tapcloud.js'; // Assuming Product.js is in the same directory
import Searches from './Searches.js';
import Toggle from "./Toggle.js";
import Cart from "./Cart.js";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesomeIcon
import { faSearch } from '@fortawesome/free-solid-svg-icons'; // Import the search icon
import placeholderImage from './images/prod_default.png';
import close from './images/close.png';
import vector from './images/Ellipse 13.png';
import searchImage from './images/image.png';
import main from './images/android-chrome-192x192 1.svg';
import mic from './images/mic.svg';
import line from './images/Line 6.svg';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const languageDictionary = {
  english: {
    aiAssistant: 'Your AI Commerce Assistance',
    recentSearches: 'Recent Searches',
    placeholder: 'Ask Cartesian',
    chatModeLabel : "Chat Mode",
    BuyMode : "Buy Mode",
  },
  hindi: {
    aiAssistant: 'आपका एआई वाणिज्य सहायक',
    recentSearches: 'हाल की खोजें',
    placeholder: 'कार्टेशियन से पूछें',
    chatModeLabel : "चैट मोड",
    BuyMode : "बाय मोड",
  },
  tamil: {
    aiAssistant: 'உங்கள் ஏஐ வர்த்தக உதவி',
    recentSearches: 'சமீபத்திய தேடல்கள்',
    placeholder: 'கார்டேசியனை கேளுங்கள்',
    chatModeLabel :  "அரட்டை முறை",
    BuyMode : "பாய் மோடு",
  },
  telugu: {
    aiAssistant: 'మీ ఏఐ వాణిజ్య సహాయం',
    recentSearches: 'ఇటీవలి శోధనలు',
    placeholder: 'కార్టేసియన్‌ని అడగండి',
    chatModeLabel : "చాట్ మోడ్",                        

    BuyMode : "బాయ్ మోడ్",
  },
};

function App() {
  const initialProducts = [
    { id: 1, name: 'Loading...', img: placeholderImage, description: 'Loading...', price: 0, originalPrice: 0, url: '#', score: '0' },
    { id: 2, name: 'Loading...', img: placeholderImage, description: 'Loading...', price: 0, originalPrice: 0, url: '#', score: '0' },
    { id: 3, name: 'Loading...', img: placeholderImage, description: 'Loading...', price: 0, originalPrice: 0, url: '#', score: '0' },
    { id: 3, name: 'Loading...', img: placeholderImage, description: 'Loading...', price: 0, originalPrice: 0, url: '#', score: '0' },
    { id: 3, name: 'Loading...', img: placeholderImage, description: 'Loading...', price: 0, originalPrice: 0, url: '#', score: '0' },
    // Add more placeholders if needed
  ];
  
  
  
  const [activeModel, setActiveModel] = useState('openai');
  const [activelang, setActivelang] = useState('english');
  const [isOpen, setIsOpen] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // State for popup visibility
  const [isLoading, setIsLoading] = useState(false); // State for loading status
  const [products, setProducts] = useState(initialProducts);
  const [recentSearches, setRecentSearches] = useState([]); // State for recent searches
  const [initialRender, setInitialRender] = useState(true);
  const [tagCloud, setTagCloud] = useState({});
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [imageBytes, setImageBytes] = useState(null);
  const [includeTagCloud, setIncludeTagCloud] = useState(false); 
  const [isBuyMode, setIsBuyMode] = useState(false);  

  const recognition = useRef(null);
  const inputref = useRef(''); // To store the final transcript
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (SpeechRecognition) {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false; // Set continuous to false
      recognition.current.interimResults = true;

      recognition.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart;
          } else {
            interimTranscript += transcriptPart;
          }
        }

        setSearchInput(interimTranscript + finalTranscript);
         // Store the final transcript in the ref
      };

      recognition.current.onstart = () => {
        console.log('Voice recognition started');
      };

      recognition.current.onend = () => {
        console.log('Voice recognition ended');
        
        setShowPopup(false);
        // Hide popup when listening ends
        
        handleSearch(document.getElementById("search").value,false); // Use the final transcript to trigger search
      };
    } else {
      console.error('Your browser does not support speech recognition.');
    }
    // Retrieve recent searches from local storage on mount
    const storedSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    setRecentSearches(storedSearches); 
    const storedTagCloud = JSON.parse(localStorage.getItem('tagCloud')) || {};
    setTagCloud(storedTagCloud);
    
    
    handleSearch("saree");
  }, []); // No need to include searchInput here, the effect should only run once

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };
  const handleToggleChange = (isToggleActive, toggleLabel) => {
    if (toggleLabel === languageDictionary[activelang].BuyMode) {
      setIsBuyMode(isToggleActive);
    } else {
      setIncludeTagCloud(isToggleActive); // Update state based on toggle
    }    
  };
  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  const handleKeyPress = (event) => { 
    if (event.key === 'Enter') {
      
      handleSearch(document.getElementById("search").value,false);
      event.target.blur();
      
    }
  };
 

  const handleSearch = (searchTerm="saree",initialRender="true",imageBytes = null) => {
    setSearchInitiated(true);
    initialRender? setInitialRender(true):setIsLoading(true); // Start loading

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      prompt: imageBytes ? '' : searchTerm,
      image_url: '',
      image_bytes: imageBytes || '',
     action_intent:  imageBytes ? 'search_image_bytes' : 'search',
     model: activeModel,
     chat_mode: includeTagCloud ? "Yes" : "No",
     tag_cloud : includeTagCloud? tagCloud : {}, 
      num_items: "10"
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    fetch("Key", requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log(data)
        if (data.api_action_status === "success") {
          const fetchedProducts = (activelang === 'hindi' ? data.item_hi : data.items).map((item, index) => ({
            id: index + 1,
            name: item.provider_name.slice(0, 15), // Truncate to 10 characters
            img: item.image_link1,
            description: item.product_name.slice(0, 25), // Truncate to 30 characters
            price: parseFloat(item.sale_price),
            url: item.product_url,
            score:item.score,
            originalPrice: parseFloat(item.price),
            isVisible: false // Set isVisible to false for newly fetched products
          }));

          // Convert description to title case
          fetchedProducts.forEach((product) => {
            product.description = product.description.toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            product.name = product.name.toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
          });

          setProducts(fetchedProducts);
          const storedTagCloud = JSON.parse(localStorage.getItem('tagCloud')) || {};
         

        // Update the stored tag cloud with new key-value pairs from the API response
        const updatedTagCloud = { ...storedTagCloud };
        console.log(updatedTagCloud)
        console.log(data.tag_cloud) 

        Object.keys(data.tag_cloud).forEach((key) => {
          // Only update if new value is not empty and stored value is empty or doesn't exist
          if (data.tag_cloud[key] !== ""  &&  data.tag_cloud[key] !== "0") {
            updatedTagCloud[key] = data.tag_cloud[key];
          }
        });

        // Store the updated tag cloud in local storage
        console.log(updatedTagCloud)
        localStorage.setItem('tagCloud', JSON.stringify(updatedTagCloud));

        // Update the state with the new tag cloud
         
        setTagCloud(updatedTagCloud);
          // Store the search term in local storage
             if (searchTerm !== "saree" && searchTerm!=="") {
            storeSearchTerm(searchTerm || searchInput);
          }
          console.log(data.tag_cloud)
          
        } else {
          console.error("API action status:", data.api_action_status);
        }
        setInitialRender(false);
        setIsLoading(false); // End loading
        setSearchInitiated(false); 
      })
      .catch((error) => {
        console.error("Failed to fetch:", error);
        
        setIsLoading(false); // End loading in case of error
      });

    console.log("Search input:", searchTerm); // Log the search term
    console.log("Request options:", requestOptions);
    console.log("raw",raw)
    

    
  };

  const storeSearchTerm = (term) => {
    if(term !== "saree" && term!=="")
      {
    const updatedSearches = [term, ...recentSearches.filter(search => search !== term)].slice(0, 3);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      }
  };

  const handleRecentSearchClick = (term) => {
    setSearchInput(term);
    handleSearch(term,false);
  };

  const handleLongPressSearch = (product) => {
    console.log(product);
    setIsLoading(true); // Start loading

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    
    const raw = JSON.stringify({
      prompt:  product.description,
      image_url: product.img,
      action_intent: "search_image",
      model: activeModel,
      chat_mode: includeTagCloud ? "Yes" : "No",
      tag_cloud : includeTagCloud? tagCloud : {}, 
       num_items: "10"
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    fetch("Key", requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log(data)
        if (data.api_action_status === "success") {
          const fetchedProducts = (activelang === 'hindi' ? data.item_hi : data.items).map((item, index) => ({
            id: index + 1,
            name: item.provider_name.slice(0, 15), // Truncate to 10 characters
            img: item.image_link1,
            description: item.product_name.slice(0, 25), // Truncate to 30 characters
            price: parseFloat(item.sale_price),
            url: item.product_url,
            score:item.score,
            originalPrice: parseFloat(item.price),
            isVisible: false // Set isVisible to false for newly fetched products
          }));

          fetchedProducts.forEach((produc) => {
            produc.description = produc.description.toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            product.name = product.name.toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
          });

          setProducts(fetchedProducts);
          const storedTagCloud = JSON.parse(localStorage.getItem('tagCloud')) || {};
         

        // Update the stored tag cloud with new key-value pairs from the API response
        const updatedTagCloud = { ...storedTagCloud };
        console.log(updatedTagCloud)
        console.log(data.tag_cloud) 

        Object.keys(data.tag_cloud).forEach((key) => {
          // Only update if new value is not empty and stored value is empty or doesn't exist
          if (data.tag_cloud[key] !== ""  &&  data.tag_cloud[key] !== "0") {
            updatedTagCloud[key] = data.tag_cloud[key];
          }
        });

        // Store the updated tag cloud in local storage
        console.log(updatedTagCloud)
        localStorage.setItem('tagCloud', JSON.stringify(updatedTagCloud));

        // Update the state with the new tag cloud
         
        setTagCloud(updatedTagCloud);
        } else {
          console.error("API action status:", data.api_action_status);
        }
        
        setIsLoading(false); // End loading
      })
      .catch((error) => {
        console.error("Failed to fetch:", error);
        setIsLoading(false); // End loading in case of error
      });

    console.log("Long press search input:", prompt); // Log the search term
    console.log("Request options:", requestOptions);
  };

  
  const handleDoubleClickSearch = (product) => {
    
    setIsLoading(true);
    console.log("hjfbgfb",product);
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      prompt: product.description,
      image_url: product.img,
      price: product.price,
      action_intent: "search_price",
      model: activeModel,
      chat_mode: includeTagCloud ? "Yes" : "No",
      tag_cloud : includeTagCloud? tagCloud : {}, 
       num_items: "10"
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    fetch("Key", requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log(data)
        if (data.api_action_status === "success") {
          const fetchedProducts = (activelang === 'hindi' ? data.item_hi : data.items).map((item, index) => ({
            id: index + 1,
            name: item.provider_name.slice(0, 15), // Truncate to 10 characters
            img: item.image_link1,
            description: item.product_name.slice(0, 25), // Truncate to 30 characters
            price: parseFloat(item.sale_price),
            url: item.product_url,
            score:item.score,
            originalPrice: parseFloat(item.price),
            isVisible: false // Set isVisible to false for newly fetched products
          }));

          fetchedProducts.forEach((produc) => {
            produc.description = produc.description.toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            product.name = product.name.toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
          });

          setProducts(fetchedProducts);
          const storedTagCloud = JSON.parse(localStorage.getItem('tagCloud')) || {};
         

        // Update the stored tag cloud with new key-value pairs from the API response
        const updatedTagCloud = { ...storedTagCloud };
        console.log(updatedTagCloud)
        console.log(data.tag_cloud) 

        Object.keys(data.tag_cloud).forEach((key) => {
          // Only update if new value is not empty and stored value is empty or doesn't exist
          if (data.tag_cloud[key] !== "" &&  data.tag_cloud[key] !== "0") {
            updatedTagCloud[key] = data.tag_cloud[key];
          }
        });

        // Store the updated tag cloud in local storage
        console.log(updatedTagCloud)
        localStorage.setItem('tagCloud', JSON.stringify(updatedTagCloud));

        // Update the state with the new tag cloud
         
        setTagCloud(updatedTagCloud);
        } else {
          console.error("API action status:", data.api_action_status);
        }
        
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch:", error);
        setIsLoading(false);
      });

    console.log("Double-clicked product:", product.description);
    console.log("Request options:", requestOptions);
    
    console.log(product.img);
console.log(product.description);
console.log(product.price);
  };

  const toggleListening = () => {
    if (isListening) {
      recognition.current.stop();
      setShowPopup(false); // Hide popup when stopped manually
    } else {
      recognition.current.start();
      setShowPopup(true); // Show popup when starting
    }
    setIsListening(!isListening);
  };
  const handleTagClick = (searchQuery) => {
    console.log(searchQuery);
    
    handleSearch(searchQuery, false);
    setSearchInput("");
  };
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        console.log(base64String)
        setImageBytes(base64String); // Store the base64 string in the state
        handleSearch("", false, base64String); // Trigger the search with the image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSearchClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger the file input click event
    }
  };
  const handlelangButtonClick = (lang) => {
    setActivelang(lang);
  };
  const settings = {
    dots: false,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    swipe: true,
    swipeToSlide: true,
    draggable: true,
    centerMode: true,
    centerPadding: '5%',
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          centerMode: false,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          centerMode: false,
        }
      }
    ]
  };

  return (
    <DndProvider backend={HTML5Backend}>
    <div className="page-container">

      {isOpen && (
        <div   className="modal-overlay">
          <div className="modal-content">
            <div className="one">
            <img src={main} alt="AI Assistance" className="ai-assistance-image" />
              <p>{languageDictionary[activelang].aiAssistant}</p>
              <span><img className="sec" src={close} alt="cross" onClick={toggleModal} /></span>
            </div>
            <div className='lang'>
            <button
                  className={`english ${activelang === 'english' ? 'active' : ''}`}
                  onClick={() => handlelangButtonClick('english')}
                >
                  English
                </button>
                <button
                  className={`hindi ${activelang === 'hindi' ? 'active' : ''}`}
                  onClick={() => handlelangButtonClick('hindi')}
                >
                  Hindi
                </button>
                <button
                  className={`tamil ${activelang === 'tamil' ? 'active' : ''}`}
                  onClick={() => handlelangButtonClick('tamil')}
                >
                  தமிழ்
                </button>
                <button
                  className={`telugu ${activelang === 'telugu' ? 'active' : ''}`}
                  onClick={() => handlelangButtonClick('telugu')}
                >
                  తెలుగు
                </button>
                </div>
                
            <div className="similar-products">
              <Slider {...settings}>
                {products.map((product) => (
                  <Product 
                    key={product.id} 
                    {...product} 
                    url={product.url} // Pass the product URL to the Product component
                    score={product.score}
            
                    onLongPress={() => handleLongPressSearch(product)} 
                    onDoubleClick={() => handleDoubleClickSearch(product)}
                    
                  />
                ))}
              </Slider>
              <div className="search-bar-container">
                <input
                  type="text"
                  id="search"
                  placeholder={languageDictionary[activelang].placeholder}
                  className="search-bar"
                  value={searchInput}
                  onKeyPress={handleKeyPress}
                  onChange={handleSearchInputChange}
                  ref={inputref}
                />
                <FontAwesomeIcon icon={faSearch} id="searchic" className="search-icon" onClick={() => handleSearch(searchInput,false)} />
                <img className="s-i" src={searchImage} alt="Search" onClick={handleImageSearchClick} />
                <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }} // Hide the file input
          onChange={handleImageUpload} // Handle image upload
        />
                
              </div>
              <div className='image-cont'>
              <img src={vector} alt="" className='mike' onClick={toggleListening} />
              <img src={mic} alt="" className='mik' onClick={toggleListening} />
              </div>
              <div className='cmt'>
              <Toggle label={languageDictionary[activelang].chatModeLabel} onToggleChange={handleToggleChange}  defaultChecked={includeTagCloud}/>
              <Toggle label={languageDictionary[activelang].BuyMode} onToggleChange={handleToggleChange} defaultChecked={isBuyMode}/>
              </div>
              <img src={line} alt="" className='line'/>
              
               {isBuyMode ? ( 
       
          <Cart  />
        
      ) : (
        
          <div className="recent-searches">
          <Searches recentSearches={recentSearches} onRecentSearchClick={handleRecentSearchClick} lang={activelang}/>
          
          <div className="tapcloud-container">
          <Tapcloud tag_cloud={tagCloud} onTagClick={handleTagClick} searchInitiated={searchInitiated} lang={activelang}/>
          </div>
        </div>
      )}
            </div>
          </div>
        </div>
      )}
      {showPopup && (
        <div className="popup">
          <p>Please speak now...</p>
        </div>
      )}
      {initialRender && (
        <div className="popup">
          <p>Khojle: Jo Chahiye Woh Payiye</p>
        </div>
      )}
      {isLoading && (
        <div className="popup">
          <p>Fetching best data for you...</p>
        </div>
      )}
      
    </div>
    </DndProvider>
  );
}

export default App;
