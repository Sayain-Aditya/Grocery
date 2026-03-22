import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, X, ShoppingCart, CheckCircle2, RefreshCw,
  Lightbulb, Volume2, Trash2, Globe, History, AlertCircle,
  Package, ChevronDown
} from 'lucide-react';
import { speak, LANGUAGES, findProduct, parseCommand, API, translateToEnglish } from './voiceUtils';

const VoiceOrdering = ({ products, onAddToCart, onClose, navigate }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [step, setStep] = useState('idle'); // idle | listening | confirming | done | error
  const [recognized, setRecognized] = useState([]);
  const [unmatched, setUnmatched] = useState([]);
  const [actionResult, setActionResult] = useState(null); // for non-add actions
  const [lang, setLang] = useState('en-US');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [supported, setSupported] = useState(false);
  const [continuous, setContinuous] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const recognitionRef = useRef(null);
  const wakeWordRef = useRef(null);
  const confirmRecRef = useRef(null);
  const recognizedRef = useRef([]);
  const onAddToCartRef = useRef(onAddToCart);
  const onCloseRef = useRef(onClose);
  const ttsEnabledRef = useRef(ttsEnabled);
  const langRef = useRef(lang);

  useEffect(() => { onAddToCartRef.current = onAddToCart; }, [onAddToCart]);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => { ttsEnabledRef.current = ttsEnabled; }, [ttsEnabled]);
  useEffect(() => { langRef.current = lang; }, [lang]);

  // keep ref in sync with state
  useEffect(() => { recognizedRef.current = recognized; }, [recognized]);

  // ── Init speech recognition ──────────────────────────────────────
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    setSupported(true);
  }, []);

  // ── Fetch cart & last order on mount ────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    axios.get(`${API}/cart/get`).then(r => setCartItems(r.data || [])).catch(() => {});
    axios.get(`${API}/orders/my`).then(r => {
      if (r.data?.length > 0) setLastOrder(r.data[0]);
    }).catch(() => {});
  }, []);

  // ── Build recognition instance ───────────────────────────────────
  const buildRecognition = useCallback((isContinuous = false) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    const rec = new SR();
    rec.continuous = isContinuous;
    rec.interimResults = true;
    rec.lang = lang;

    rec.onresult = (event) => {
      let interim = '', final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }
      setTranscript(final || interim);
      if (final) handleFinalTranscriptWithTranslation(final);
    };
    rec.onstart = () => { setIsListening(true); setStep('listening'); };
    rec.onend = () => {
      setIsListening(false);
      if (isContinuous && continuous) {
        // restart for continuous mode
        try { rec.start(); } catch {}
      }
    };
    rec.onerror = (e) => {
      setIsListening(false);
      if (step === 'listening') setStep('idle');
    };
    return rec;
  }, [lang, continuous, step]);

  // ── Wake word listener ───────────────────────────────────────────
  useEffect(() => {
    if (!supported) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const wake = new SR();
    wake.continuous = true;
    wake.interimResults = false;
    wake.lang = 'en-US';
    wake.onresult = (event) => {
      const t = event.results[event.results.length - 1][0].transcript.toLowerCase();
      if (t.includes('hey freshmart') || t.includes('hey fresh mart')) {
        if (ttsEnabled) speak('Yes, I am listening. What would you like to order?', lang);
        startListening();
      }
    };
    wake.onerror = () => {};
    try { wake.start(); } catch {}
    wakeWordRef.current = wake;
    return () => { try { wake.stop(); } catch {} };
  }, [supported, ttsEnabled, lang]);

  // ── Auto-listen for yes/no confirmation ────────────────────────
  useEffect(() => {
    if (step !== 'confirming' || recognized.length === 0) return;
    if (actionResult?.type === 'cart') return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    let cancelled = false;
    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.continuous = false;
    confirmRecRef.current = rec;

    rec.onresult = async (e) => {
      const said = e.results[0][0].transcript.toLowerCase().trim();
      if (/\b(yes|yeah|yep|sure|ok|okay|confirm|do it|go ahead|haan|ha)\b/.test(said)) {
        const items = recognizedRef.current;
        for (const { product, qty } of items) {
          await onAddToCartRef.current(product._id, qty);
        }
        const names = items.map(r => `${r.qty} ${r.product.name}`).join(', ');
        if (ttsEnabledRef.current) speak(`Added ${names} to your cart.`, langRef.current);
        setStep('done');
        setTimeout(() => onCloseRef.current(), 1500);
      } else if (/\b(no|nope|cancel|stop|nahi|mat)\b/.test(said)) {
        setTranscript('');
        setRecognized([]);
        setUnmatched([]);
        setActionResult(null);
        setTranslatedText('');
        setIsTranslating(false);
        setStep('idle');
      }
    };
    rec.onerror = () => {};
    rec.onend = () => {};

    // Wait for TTS to finish speaking before opening the confirmation mic
    // so it doesn't hear its own voice and auto-confirm
    const startAfterTTS = async () => {
      await new Promise(resolve => {
        const check = () => {
          if (!window.speechSynthesis.speaking) return resolve();
          setTimeout(check, 100);
        };
        check();
      });
      if (!cancelled) {
        // extra buffer after TTS ends
        await new Promise(resolve => setTimeout(resolve, 300));
        if (!cancelled) try { rec.start(); } catch {}
      }
    };
    startAfterTTS();

    return () => {
      cancelled = true;
      try { rec.stop(); } catch {}
      confirmRecRef.current = null;
    };
  }, [step, recognized.length, actionResult?.type]);

  // ── Auto-retry when nothing matched ──────────────────────────────
  useEffect(() => {
    if (step === 'confirming' && recognized.length === 0 && unmatched.length > 0 && !actionResult) {
      const t = setTimeout(() => {
        setTranscript(''); setRecognized([]); setUnmatched([]);
        setActionResult(null); setTranslatedText(''); setIsTranslating(false);
        setStep('idle');
        // Don't auto-start mic — let user tap manually to avoid hearing TTS
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [step, recognized.length, unmatched.length, actionResult]);

  // ── Translate then process ──────────────────────────────────────
  const handleFinalTranscriptWithTranslation = async (text) => {
    setIsTranslating(true);
    const english = await translateToEnglish(text, lang);
    setTranslatedText(english !== text ? english : '');
    setIsTranslating(false);
    handleFinalTranscript(english);
  };

  // ── Handle final transcript ──────────────────────────────────────
  const handleFinalTranscript = (text) => {
    const parsed = parseCommand(text);

    if (parsed.action === 'clear_cart') {
      handleClearCart();
      return;
    }
    if (parsed.action === 'read_cart') {
      handleReadCart();
      return;
    }
    if (parsed.action === 'checkout') {
      if (ttsEnabled) speak('Taking you to checkout.', lang);
      setTimeout(() => { onClose(); if (navigate) navigate('/checkout'); }, 800);
      return;
    }
    if (parsed.action === 'reorder') {
      handleReorder();
      return;
    }
    if (parsed.action === 'filter') {
      handleVoiceFilter(parsed);
      return;
    }
    if (parsed.action === 'remove') {
      handleVoiceRemove(parsed.name);
      return;
    }

    // Default: add items
    const matched = [], noMatch = [];
    (parsed.items || []).forEach(({ name, qty }) => {
      const result = findProduct(name, products);
      if (result) matched.push({ product: result.product, qty: Math.max(1, qty), score: result.score });
      else noMatch.push(name);
    });

    setRecognized(matched);
    setUnmatched(noMatch);

    if (matched.length > 0) {
      const names = matched.map(m => `${m.qty} ${m.product.name}`).join(', ');
      if (ttsEnabled) speak(`Found ${names}. Shall I add them to your cart?`, lang);
    } else {
      if (ttsEnabled) speak('Sorry, I could not find those products. Please try again.', lang);
    }
    setStep('confirming');
  };

  // ── Cart actions ─────────────────────────────────────────────────
  const handleClearCart = async () => {
    try {
      await axios.delete(`${API}/cart/clear`);
      setCartItems([]);
      setActionResult({ type: 'success', msg: 'Cart cleared successfully!' });
      if (ttsEnabled) speak('Your cart has been cleared.', lang);
      setStep('done');
      setTimeout(onClose, 2000);
    } catch {
      setActionResult({ type: 'error', msg: 'Failed to clear cart.' });
      setStep('error');
    }
  };

  const handleReadCart = () => {
    if (cartItems.length === 0) {
      if (ttsEnabled) speak('Your cart is empty.', lang);
      setActionResult({ type: 'info', msg: 'Your cart is empty.' });
    } else {
      const names = cartItems.map(i => `${i.qty} ${i.product?.name}`).join(', ');
      const total = cartItems.reduce((s, i) => s + i.product?.price * i.qty, 0);
      if (ttsEnabled) speak(`Your cart has ${names}. Total is ${total} rupees.`, lang);
      setActionResult({ type: 'cart', items: cartItems, total });
    }
    setStep('confirming');
  };

  const handleReorder = async () => {
    try {
      const { data } = await axios.get(`${API}/orders/my`);
      const latest = Array.isArray(data) && data.length > 0 ? data[0] : null;
      if (!latest) {
        if (ttsEnabled) speak('You have no previous orders.', lang);
        setActionResult({ type: 'error', msg: 'No previous orders found.' });
        setStep('error');
        return;
      }
      setLastOrder(latest);
      const items = latest.items || [];
      const matched = items.map(i => ({ product: i.product, qty: i.quantity })).filter(i => i.product);
      if (matched.length === 0) {
        if (ttsEnabled) speak('Could not load items from your last order.', lang);
        setActionResult({ type: 'error', msg: 'Last order has no items.' });
        setStep('error');
        return;
      }
      setRecognized(matched);
      setUnmatched([]);
      const names = matched.map(m => `${m.qty} ${m.product?.name}`).join(', ');
      if (ttsEnabled) speak(`Reordering ${names}. Shall I add them to your cart?`, lang);
      setStep('confirming');
    } catch {
      if (ttsEnabled) speak('Could not fetch your orders.', lang);
      setActionResult({ type: 'error', msg: 'Failed to fetch previous orders.' });
      setStep('error');
    }
  };

  // ── Voice filter (cheap / expensive / category) ──────────────────
  const handleVoiceFilter = ({ sort, category }) => {
    let results = [...products];
    if (sort === 'cheap') results.sort((a, b) => a.price - b.price);
    else if (sort === 'expensive') results.sort((a, b) => b.price - a.price);
    else if (category) {
      results = results.filter(p =>
        p.name.toLowerCase().includes(category) ||
        p.category?.toLowerCase().includes(category)
      );
    }
    const top = results.slice(0, 5);
    if (top.length === 0) {
      if (ttsEnabled) speak('No products found for that filter.', lang);
      setActionResult({ type: 'error', msg: 'No products matched that filter.' });
      setStep('error');
      return;
    }
    const label = sort === 'cheap' ? 'cheapest' : sort === 'expensive' ? 'most expensive' : category;
    if (ttsEnabled) speak(`Here are the ${label} products: ${top.map(p => p.name).join(', ')}`, lang);
    setRecognized(top.map(p => ({ product: p, qty: 1, score: 1 })));
    setUnmatched([]);
    setActionResult({ type: 'filter', label });
    setStep('confirming');
  };

  const handleVoiceRemove = async (spokenName) => {
    const result = findProduct(spokenName, products);
    if (!result) {
      if (ttsEnabled) speak(`Could not find ${spokenName} in your cart.`, lang);
      setActionResult({ type: 'error', msg: `Could not find "${spokenName}" to remove.` });
      setStep('error');
      return;
    }
    try {
      // Always fetch fresh cart so we don't rely on stale state
      const { data: freshCart } = await axios.get(`${API}/cart/get`);
      setCartItems(freshCart || []);
      const productId = result.product._id;
      const cartItem = (freshCart || []).find(i => {
        const id = i.product?._id ?? i.product;
        return String(id) === String(productId);
      });
      if (!cartItem) {
        if (ttsEnabled) speak(`${result.product.name} is not in your cart.`, lang);
        setActionResult({ type: 'error', msg: `${result.product.name} is not in your cart.` });
        setStep('error');
        return;
      }
      await axios.delete(`${API}/cart/remove/${cartItem._id}`);
      setCartItems(prev => prev.filter(i => i._id !== cartItem._id));
      if (ttsEnabled) speak(`${result.product.name} removed from cart.`, lang);
      setActionResult({ type: 'success', msg: `${result.product.name} removed from cart.` });
      setStep('done');
      setTimeout(onClose, 1500);
    } catch {
      setActionResult({ type: 'error', msg: 'Failed to remove item.' });
      setStep('error');
    }
  };

  // ── Confirm add to cart ──────────────────────────────────────────
  const handleConfirm = async () => {
    for (const { product, qty } of recognized) {
      await onAddToCart(product._id, qty);
    }
    const names = recognized.map(r => `${r.qty} ${r.product.name}`).join(', ');
    if (ttsEnabled) speak(`Added ${names} to your cart.`, lang);
    setStep('done');
    setTimeout(onClose, 1500);
  };

  // ── Start / stop listening ───────────────────────────────────────
  const startListening = () => {
    if (!supported) return;
    const rec = buildRecognition(continuous);
    if (!rec) return;
    recognitionRef.current = rec;
    setTranscript('');
    setRecognized([]);
    setUnmatched([]);
    setActionResult(null);
    setTranslatedText('');
    setIsTranslating(false);
    try { rec.start(); } catch {}
  };

  const stopListening = () => {
    try { recognitionRef.current?.stop(); } catch {}
    setIsListening(false);
  };

  const handleRetry = () => {
    setTranscript('');
    setRecognized([]);
    setUnmatched([]);
    setActionResult(null);
    setTranslatedText('');
    setIsTranslating(false);
    setStep('idle');
  };

  // ── Render ───────────────────────────────────────────────────────
  if (!supported) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto text-center">
        <MicOff className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-red-600 mb-2">Voice Not Supported</h3>
        <p className="text-gray-500 mb-4">Try Chrome or Edge browser.</p>
        <button onClick={onClose} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl font-semibold">Close</button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-auto max-h-[90vh] overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Voice Shopping
          </h2>
          <p className="text-gray-400 text-xs mt-0.5">Say "Hey FreshMart" anytime to activate</p>
        </div>
        <div className="flex items-center gap-2">
          {/* TTS Toggle */}
          <button
            onClick={() => setTtsEnabled(v => !v)}
            title={ttsEnabled ? 'Mute voice feedback' : 'Enable voice feedback'}
            className={`p-2 rounded-full transition-colors ${ttsEnabled ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}
          >
            <Volume2 className="w-4 h-4" />
          </button>
          {/* Continuous mode */}
          <button
            onClick={() => setContinuous(v => !v)}
            title={continuous ? 'Disable continuous mode' : 'Enable continuous mode'}
            className={`p-2 rounded-full transition-colors text-xs font-bold ${continuous ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
          >
            ∞
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Language Selector */}
      <div className="relative mb-4">
        <button
          onClick={() => setShowLangMenu(v => !v)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors w-full"
        >
          <Globe className="w-4 h-4 text-purple-500" />
          {LANGUAGES.find(l => l.code === lang)?.label || 'English'}
          <ChevronDown className="w-4 h-4 ml-auto text-gray-400" />
        </button>
        <AnimatePresence>
          {showLangMenu && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden"
            >
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); setShowLangMenu(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 transition-colors ${lang === l.code ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-gray-700'}`}
                >
                  {l.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mic Button */}
      <div className="flex justify-center mb-4">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={step === 'confirming' || step === 'done'}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${
            isListening
              ? 'bg-gradient-to-br from-red-400 to-pink-500 scale-110'
              : 'bg-gradient-to-br from-purple-500 to-indigo-600 hover:scale-105'
          }`}
        >
          {isListening
            ? <MicOff className="w-10 h-10 text-white" />
            : <Mic className="w-10 h-10 text-white" />
          }
        </button>
      </div>

      {/* Listening wave animation */}
      {isListening && (
        <div className="flex justify-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 bg-purple-500 rounded-full"
              animate={{ height: ['8px', '24px', '8px'] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </div>
      )}

      {/* Status */}
      <div className="text-center mb-3 text-sm font-medium">
        {step === 'idle' && <span className="text-gray-500">Tap mic or say "Hey FreshMart"</span>}
        {step === 'listening' && <span className="text-purple-600 flex items-center justify-center gap-1"><Volume2 className="w-4 h-4 animate-pulse" /> Listening...</span>}
        {step === 'confirming' && <span className="text-blue-600">Review below</span>}
        {step === 'done' && <span className="text-green-600 flex items-center justify-center gap-1"><CheckCircle2 className="w-4 h-4" /> Done!</span>}
        {step === 'error' && <span className="text-red-500 flex items-center justify-center gap-1"><AlertCircle className="w-4 h-4" /> Something went wrong</span>}
      </div>

      {/* Transcript + translation */}
      {transcript && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 mb-3">
          <p className="text-xs text-gray-400 mb-0.5">You said:</p>
          <p className="text-gray-800 text-sm font-medium italic">"{transcript}"</p>
          {isTranslating && (
            <p className="text-xs text-purple-500 mt-1 animate-pulse">Translating...</p>
          )}
          {translatedText && !isTranslating && (
            <p className="text-xs text-blue-500 mt-1">Translated: "{translatedText}"</p>
          )}
        </div>
      )}

      {/* Confirming: Add items */}
      {step === 'confirming' && !actionResult && (
        <div className="space-y-3 mb-4">
          {recognized.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-xs font-bold text-green-700 mb-2 uppercase tracking-wide">Items Found</p>
              <div className="space-y-2">
                {recognized.map(({ product, qty, score }, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-green-600 shrink-0" />
                      <div>
                        <span className="font-semibold text-gray-800 text-sm">{product.name}</span>
                        {score && <span className="ml-1 text-xs text-gray-400">({Math.round(score * 100)}% match)</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">×{qty}</span>
                      <span className="font-bold text-green-600 text-sm">₹{(product.price * qty).toFixed(0)}</span>
                    </div>
                  </div>
                ))}
                <div className="border-t border-green-200 pt-2 flex justify-between text-sm font-bold text-green-700">
                  <span>Total</span>
                  <span>₹{recognized.reduce((s, r) => s + r.product.price * r.qty, 0).toFixed(0)}</span>
                </div>
              </div>
            </div>
          )}
          {unmatched.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-xs font-bold text-red-600 mb-1 uppercase tracking-wide">Not Found</p>
              <p className="text-sm text-red-500">{unmatched.join(', ')}</p>
              <p className="text-xs text-red-400 mt-1">Try saying the exact product name</p>
            </div>
          )}
          {recognized.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
              <p className="text-yellow-700 font-medium text-sm">No products matched.</p>
              <p className="text-yellow-500 text-xs mt-1">Tap the mic to try again.</p>
            </div>
          )}
        </div>
      )}

      {/* Filter result */}
      {step === 'confirming' && actionResult?.type === 'filter' && recognized.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
          <p className="text-xs font-bold text-purple-700 mb-2 uppercase tracking-wide">
            {actionResult.label} products
          </p>
          <div className="space-y-2">
            {recognized.map(({ product }, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-800 font-medium">{product.name}</span>
                <span className="font-bold text-purple-600">₹{product.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cart read result */}
      {step === 'confirming' && actionResult?.type === 'cart' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <p className="text-xs font-bold text-blue-700 mb-2 uppercase tracking-wide">Your Cart</p>
          <div className="space-y-1.5">
            {actionResult.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-700">{item.product?.name}</span>
                <span className="text-gray-500">×{item.qty} — ₹{(item.product?.price * item.qty).toFixed(0)}</span>
              </div>
            ))}
            <div className="border-t border-blue-200 pt-1.5 flex justify-between font-bold text-blue-700 text-sm">
              <span>Total</span><span>₹{actionResult.total?.toFixed(0)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action result (success/error/info) */}
      {(step === 'done' || step === 'error') && actionResult && (
        <div className={`rounded-xl p-4 mb-4 text-sm font-medium text-center ${
          actionResult.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
          actionResult.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' :
          'bg-blue-50 text-blue-600 border border-blue-200'
        }`}>
          {actionResult.msg}
        </div>
      )}

      <div className="flex flex-col gap-2 mb-4">
        {step === 'confirming' && recognized.length > 0 && (!actionResult || actionResult.type === 'filter') && (
          <>
            <div className="flex gap-2">
              <button onClick={handleConfirm} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Add to Cart
              </button>
              <button onClick={handleRetry} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1.5">
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
            </div>
            <p className="text-xs text-purple-500 animate-pulse flex items-center justify-center gap-1">
              <Mic className="w-3 h-3" /> Mic is on — say "Yes" to add or "No" to cancel
            </p>
          </>
        )}
        {step === 'confirming' && (recognized.length === 0 || (actionResult && actionResult.type !== 'filter')) && (
          <button onClick={handleRetry} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1.5">
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        )}
        {step === 'error' && (
          <button onClick={handleRetry} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1.5">
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        )}
        {(step === 'idle' || step === 'listening') && (
          <button onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-1.5">
            <X className="w-4 h-4" /> Cancel
          </button>
        )}
      </div>

      {/* Quick command chips */}
      {step === 'idle' && (
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2 font-medium">Quick commands:</p>
          <div className="flex flex-wrap gap-1.5">
            {[
              'Add 2 apples',
              'Remove 2 milk',
              'Clear cart',
              'Show cheap items',
              'What\'s in my cart?',
              'Reorder last order',
              'Checkout',
            ].map(cmd => (
              <button
                key={cmd}
                onClick={() => { setTranscript(cmd); handleFinalTranscript(cmd); }}
                className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full hover:bg-purple-100 transition-colors"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
        <p className="text-xs font-bold text-purple-700 mb-1.5 flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5" /> Voice Commands:
        </p>
        <ul className="text-xs text-purple-600 space-y-0.5">
          <li>• "Add 2 apples and 3 bananas"</li>
          <li>• "Remove 2 milk from cart"</li>
          <li>• "Show me cheap items"</li>
          <li>• "Show dairy products"</li>
          <li>• "Clear my cart"</li>
          <li>• "What's in my cart?"</li>
          <li>• "Reorder my last order"</li>
          <li>• "Checkout"</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default VoiceOrdering;
