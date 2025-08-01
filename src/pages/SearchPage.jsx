import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const SearchPage = () => {
  const [type, setType] = useState('user');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `/api/search?type=${type}&query=${encodeURIComponent(query)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResults(res.data.results);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2>Server-side Search</h2>
      <form onSubmit={handleSearch} style={{ marginBottom: '1rem' }}>
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="user">User</option>
          <option value="product">Product</option>
          <option value="order">Order</option>
        </select>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Enter search query..."
          style={{ marginLeft: 8 }}
        />
        <button type="submit" disabled={loading} style={{ marginLeft: 8 }}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      <div>
        {results.length === 0 && !loading ? <p>No results found.</p> : null}
        {results.length > 0 && (
          <ul>
            {results.map((item, idx) => (
              <li key={item._id || idx}>
                {type === 'user' && (
                  <span>{item.name} ({item.email})</span>
                )}
                {type === 'product' && (
                  <span>{item.name} - {item.category} - ${item.price}</span>
                )}
                {type === 'order' && (
                  <span>
                    Order #{item._id} - Status: {item.status} - User: {item.user?.name || 'N/A'}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
