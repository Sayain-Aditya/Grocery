import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const VoiceOrdering = ({ products, onAddToCart, onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceCart, setVoiceCart] = useState([]);
  const [currentStep, setCurrentStep] = useState('listening'); // listening, confirming, completed
  const [recognizedItems, setRecognizedItems] = useState([]);

  const recognitionRef = useRef(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        console.log('🎤 VOICE DETECTED! Result received:', event.results.length, 'results');
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;
          console.log(`Result ${i}: "${transcript}" (final: ${event.results[i].isFinal}, confidence: ${confidence})`);
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Always show the latest transcript
        const currentTranscript = finalTranscript || interimTranscript;
        if (currentTranscript) {
          console.log('📝 Setting transcript:', currentTranscript);
          setTranscript(currentTranscript);
        }
        
        if (finalTranscript) {
          console.log('✅ Processing final transcript:', finalTranscript);
          processVoiceCommand(finalTranscript);
        }
      };
      
      recognitionRef.current.onstart = () => {
        console.log('🎤 Speech recognition started');
        setIsListening(true);
      };
      
      recognitionRef.current.onend = () => {
        console.log('🛑 Speech recognition ended');
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('❌ Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          console.warn('⚠️ No speech detected - try speaking louder or closer to microphone');
        } else if (event.error === 'not-allowed') {
          console.error('🚫 Microphone access denied - please allow microphone permission');
        }
        setIsListening(false);
      };
      
      recognitionRef.current.onspeechstart = () => {
        console.log('🗣️ Speech detected - user started speaking');
      };
      
      recognitionRef.current.onspeechend = () => {
        console.log('🤐 Speech ended - user stopped speaking');
      };
      
      recognitionRef.current.onsoundstart = () => {
        console.log('🔊 Sound detected');
      };
      
      recognitionRef.current.onsoundend = () => {
        console.log('🔇 Sound ended');
      };
    }
  }, []);

  // Voice synthesis disabled

  const processVoiceCommand = (command) => {
    console.log('🎯 Processing command:', command);
    console.log('📦 Available products:', products.map(p => p.name));
    
    // Convert number words to digits
    const normalizedCommand = command.toLowerCase()
      .replace(/\bone\b/g, '1')
      .replace(/\btwo\b/g, '2')
      .replace(/\bthree\b/g, '3')
      .replace(/\bfour\b/g, '4')
      .replace(/\bfive\b/g, '5')
      .replace(/\bsix\b/g, '6')
      .replace(/\bseven\b/g, '7')
      .replace(/\beight\b/g, '8')
      .replace(/\bnine\b/g, '9')
      .replace(/\bten\b/g, '10');
    
    console.log('🔄 Normalized command:', normalizedCommand);
    
    const items = [];
    
    // Simple pattern: "add [number] [item]" or "add [item]"
    const addPattern = /(?:add|get|need|want)\s+(?:(\d+)\s+)?([a-zA-Z][^,]*?)(?:\s*(?:and|,)|$)/gi;
    let match;
    
    while ((match = addPattern.exec(normalizedCommand)) !== null) {
      console.log('🔍 Match found:', match);
      
      const quantity = match[1] ? parseInt(match[1]) : 1;
      const itemName = match[2] ? match[2].trim() : '';
      
      if (itemName) {
        console.log('🔍 Looking for:', itemName, 'quantity:', quantity);
        const matchedProduct = findMatchingProduct(itemName);
        
        if (matchedProduct) {
          console.log('✅ Found product:', matchedProduct.name);
          items.push({
            product: matchedProduct,
            quantity: quantity,
            confidence: calculateConfidence(itemName, matchedProduct.name)
          });
        } else {
          console.log('❌ No product found for:', itemName);
        }
      }
    }
    
    console.log('📦 Found items:', items);
    if (items.length > 0) {
      // Automatically add items to cart
      items.forEach(item => {
        console.log('🛒 Adding to cart:', item.product.name, 'x', item.quantity);
        onAddToCart(item.product._id);
      });
      
      // Close popup immediately
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      console.log('⚠️ No items found in command');
    }
  };

  const findMatchingProduct = (spokenName) => {
    const spoken = spokenName.toLowerCase();
    
    // Direct match
    let match = products.find(p => 
      p.name.toLowerCase().includes(spoken) || 
      spoken.includes(p.name.toLowerCase())
    );
    
    if (match) return match;
    
    // Fuzzy matching for common variations
    const variations = {
      'apple': ['apples', 'apple'],
      'banana': ['bananas', 'banana'],
      'milk': ['milk', 'dairy milk'],
      'bread': ['bread', 'loaf'],
      'egg': ['eggs', 'egg'],
      'rice': ['rice', 'basmati'],
      'oil': ['oil', 'cooking oil'],
      'sugar': ['sugar', 'white sugar']
    };
    
    for (const [key, variants] of Object.entries(variations)) {
      if (variants.some(variant => spoken.includes(variant))) {
        match = products.find(p => p.name.toLowerCase().includes(key));
        if (match) return match;
      }
    }
    
    return null;
  };

  const calculateConfidence = (spoken, productName) => {
    const spokenWords = spoken.toLowerCase().split(' ');
    const productWords = productName.toLowerCase().split(' ');
    
    let matches = 0;
    spokenWords.forEach(word => {
      if (productWords.some(pWord => pWord.includes(word) || word.includes(pWord))) {
        matches++;
      }
    });
    
    return matches / Math.max(spokenWords.length, productWords.length);
  };

  const confirmItems = (items) => {
    // Items confirmed, no voice feedback
  };

  const handleConfirmation = (confirmed) => {
    if (confirmed) {
      // Add items to cart
      recognizedItems.forEach(item => {
        onAddToCart(item.product, item.quantity);
      });
      
      setVoiceCart([...voiceCart, ...recognizedItems]);
      setCurrentStep('completed');
      
      // Items added silently
      
      setTimeout(() => {
        onClose();
      }, 3000);
    } else {
      setCurrentStep('listening');
      setRecognizedItems([]);
      // Ready for new input
      startListening();
    }
  };

  const startListening = () => {
    console.log('🚀 Attempting to start listening...');
    console.log('Supported:', supported);
    console.log('Recognition ref:', !!recognitionRef.current);
    console.log('Currently listening:', isListening);
    
    if (supported && recognitionRef.current && !isListening) {
      setTranscript('');
      try {
        console.log('▶️ Starting speech recognition...');
        recognitionRef.current.start();
      } catch (error) {
        console.error('❌ Error starting recognition:', error);
        setIsListening(false);
      }
    } else {
      console.warn('⚠️ Cannot start listening - conditions not met');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // No welcome voice message

  if (!supported) {
    return (
      <div className="text-center p-6">
        <div className="text-6xl mb-4">🚫</div>
        <h3 className="text-xl font-semibold text-red-600 mb-2">Voice Not Supported</h3>
        <p className="text-gray-600">Your browser doesn't support voice recognition.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">🎤</div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Voice Shopping
        </h2>
        <p className="text-gray-600 mt-2">Speak naturally to add items to your cart</p>
      </div>

      {/* Voice Animation */}
      <div className="flex justify-center mb-6">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
          isListening 
            ? 'bg-gradient-to-r from-red-400 to-pink-500 animate-pulse shadow-lg' 
            : 'bg-gradient-to-r from-gray-300 to-gray-400'
        }`}>
          <div className="text-4xl text-white">
            {isListening ? '🎙️' : '🔇'}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="text-center mb-6">
        {currentStep === 'listening' && (
          <div>
            <p className="text-lg font-semibold text-gray-800 mb-2">
              {isListening ? '🎧 Listening...' : '🔇 Ready to listen'}
            </p>
            <p className="text-sm text-gray-600">
              Say: "Add apples" or "Add 2 bananas"
            </p>
          </div>
        )}
        
        {currentStep === 'confirming' && (
          <div>
            <p className="text-lg font-semibold text-blue-600 mb-2">🤔 Confirming your order</p>
            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              {recognizedItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-1">
                  <span>{item.quantity}x {item.product.name}</span>
                  <span className="text-green-600">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {currentStep === 'completed' && (
          <div>
            <p className="text-lg font-semibold text-green-600 mb-2">✅ Items added to cart!</p>
            <p className="text-sm text-gray-600">Closing in a moment...</p>
          </div>
        )}
      </div>

      {/* Transcript */}
      {transcript && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-600 mb-1">You said:</p>
          <p className="text-gray-800 font-medium">"{transcript}"</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        {currentStep === 'listening' && (
          <>
            <button
              onClick={isListening ? stopListening : startListening}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white'
              }`}
            >
              {isListening ? '🛑 Stop' : '🎤 Start'}
            </button>
          </>
        )}
        
        {currentStep === 'confirming' && (
          <>
            <button
              onClick={() => handleConfirmation(true)}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
            >
              ✅ Yes, Add Items
            </button>
            <button
              onClick={() => handleConfirmation(false)}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
            >
              ❌ Try Again
            </button>
          </>
        )}
        
        <button
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
        >
          Close
        </button>
      </div>

      {/* Tips */}
      <div className="mt-6 p-3 bg-yellow-50 rounded-lg">
        <p className="text-xs text-yellow-800 font-semibold mb-1">💡 Voice Tips:</p>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• "Add 2 apples and 3 bananas"</li>
          <li>• "I need 1 milk and 2 bread"</li>
          <li>• "Get me 5 eggs"</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceOrdering;