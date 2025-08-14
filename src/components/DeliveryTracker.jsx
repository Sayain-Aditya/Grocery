import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import io from 'socket.io-client';

const DeliveryTracker = ({ order, apiKey }) => {
  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '12px'
  };

  const center = {
    lat: 28.6139,
    lng: 77.2090
  };

  const customerLocation = {
    lat: 28.7041,
    lng: 77.1025
  };

  // Initialize Socket.io connection
  useEffect(() => {
    if (order && order.status === 'out_for_delivery') {
      const newSocket = io('https://backend-g-sigma.vercel.app', {
        transports: ['websocket', 'polling']
      });
      
      newSocket.on('connect', () => {
        setIsConnected(true);
        // Join room for this specific order
        newSocket.emit('join-delivery-room', order._id);
      });
      
      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });
      
      // Listen for real-time driver location updates
      newSocket.on('driver-location-update', (data) => {
        if (data.orderId === order._id) {
          setDriverLocation({
            lat: data.location.lat,
            lng: data.location.lng
          });
          setLastUpdate(new Date());
        }
      });
      
      setSocket(newSocket);
      
      // Set initial driver location if available
      if (order?.deliveryTracking?.driverLocation) {
        setDriverLocation({
          lat: order.deliveryTracking.driverLocation.lat,
          lng: order.deliveryTracking.driverLocation.lng
        });
      }
      
      return () => {
        newSocket.disconnect();
      };
    }
  }, [order]);

  useEffect(() => {
    if (map && driverLocation && window.google && window.google.maps) {
      const directionsService = new window.google.maps.DirectionsService();
      
      directionsService.route({
        origin: driverLocation,
        destination: customerLocation,
        travelMode: window.google.maps.TravelMode.DRIVING,
      }, (result, status) => {
        if (status === 'OK') {
          setDirections(result);
        }
      });
    }
  }, [map, driverLocation]);

  const onLoad = React.useCallback((map) => {
    setMap(map);
  }, []);

  if (!order || order.status !== 'out_for_delivery') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Delivery Tracking</h3>
        <p className="text-gray-500">Tracking will be available when your order is out for delivery</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">🚚 Live Delivery Tracking</h3>
            <p className="text-green-100">Order #{order._id?.slice(-8)}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-green-100">Estimated Delivery</div>
            <div className="text-lg font-semibold">
              {order.deliveryTracking?.estimatedDeliveryTime 
                ? new Date(order.deliveryTracking.estimatedDeliveryTime).toLocaleTimeString()
                : '30-45 mins'
              }
            </div>
          </div>
        </div>
      </div>

      {order.deliveryTracking?.driverName && (
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {order.deliveryTracking.driverName.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-gray-800">{order.deliveryTracking.driverName}</div>
              <div className="text-sm text-gray-600">Your delivery partner</div>
            </div>
            {order.deliveryTracking?.driverPhone && (
              <button className="ml-auto bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                📞 Call
              </button>
            )}
          </div>
        </div>
      )}

      <div className="p-4">
        <LoadScript googleMapsApiKey={apiKey}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={driverLocation || center}
            zoom={13}
            onLoad={onLoad}
          >
            {driverLocation && window.google && window.google.maps && (
              <Marker
                position={driverLocation}
                icon={{
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20" cy="20" r="18" fill="#10B981" stroke="white" stroke-width="4"/>
                      <text x="20" y="26" text-anchor="middle" fill="white" font-size="16" font-weight="bold">🚚</text>
                    </svg>
                  `),
                  scaledSize: new window.google.maps.Size(40, 40)
                }}
                title="Delivery Partner"
              />
            )}

            {window.google && window.google.maps && (
              <Marker
                position={customerLocation}
                icon={{
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20" cy="20" r="18" fill="#EF4444" stroke="white" stroke-width="4"/>
                      <text x="20" y="26" text-anchor="middle" fill="white" font-size="16" font-weight="bold">🏠</text>
                    </svg>
                  `),
                  scaledSize: new window.google.maps.Size(40, 40)
                }}
                title="Your Location"
              />
            )}

            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  polylineOptions: {
                    strokeColor: '#10B981',
                    strokeWeight: 4,
                    strokeOpacity: 0.8
                  },
                  suppressMarkers: true
                }}
              />
            )}
          </GoogleMap>
        </LoadScript>
      </div>

      <div className="p-4 bg-gray-50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}></div>
            <span className="text-gray-600">
              {isConnected ? 'Live tracking active' : 'Connecting...'}
            </span>
          </div>
          <div className="text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryTracker;