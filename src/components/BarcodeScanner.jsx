import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const BarcodeScanner = ({ onClose, onProductFound }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      setError('');
      setIsScanning(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      
    } catch (err) {
      setError('Camera access denied or not available');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const handleScanResult = async (barcode) => {
    stopScanning();
    
    try {
      // First try to get all products and search locally
      const res = await axios.get('https://backend-g-gold.vercel.app/api/products/get');
      const products = res.data.products || res.data;
      
      const product = products.find(p => p.barcode === barcode);
      
      if (product) {
        onProductFound(product);
        toast.success(`Found: ${product.name}`);
      } else {
        toast.error('Product not found. Make sure to add products with barcodes first.');
      }
    } catch (err) {
      toast.error('Error searching for product');
    }
  };

  const handleManualInput = async (e) => {
    e.preventDefault();
    const barcode = e.target.barcode.value.trim();
    if (barcode) {
      await handleScanResult(barcode);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">📱 Scan Barcode</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Camera View */}
        <div className="mb-4 relative">
          <video
            ref={videoRef}
            className="w-full h-64 bg-gray-200 rounded-lg object-cover"
            style={{ display: isScanning ? 'block' : 'none' }}
            autoPlay
            playsInline
          />
          
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-2 border-red-500 w-48 h-32 rounded-lg">
                <div className="text-center mt-36 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                  Position barcode here
                </div>
              </div>
            </div>
          )}
          
          {!isScanning && (
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📷</div>
                <p className="text-gray-600">Camera preview will appear here</p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="space-y-4">
          <div className="flex gap-2">
            {!isScanning ? (
              <button
                onClick={startScanning}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
              >
                📷 Start Scanning
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all"
              >
                ⏹️ Stop Scanning
              </button>
            )}
          </div>

          {/* Manual Input */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-2">Or enter barcode manually:</p>
            <form onSubmit={handleManualInput} className="flex gap-2">
              <input
                name="barcode"
                type="text"
                placeholder="Enter barcode number"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          📱 Position barcode in the red frame or enter manually below
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;