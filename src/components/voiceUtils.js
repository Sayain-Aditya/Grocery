
const API = 'https://backend-g-gold.vercel.app/api';

// ─── Number word map ───────────────────────────────────────────────
const WORD_NUMBERS = {
  zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,
  nine:9,ten:10,eleven:11,twelve:12,fifteen:15,twenty:20,a:1,an:1,
};

// ─── Supported languages ───────────────────────────────────────────
const LANGUAGES = [
  { code: 'en-US', label: 'English' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'ta-IN', label: 'Tamil' },
  { code: 'te-IN', label: 'Telugu' },
  { code: 'mr-IN', label: 'Marathi' },
  { code: 'bn-IN', label: 'Bengali' },
];

// ─── Text-to-speech helper ─────────────────────────────────────────
const speak = (text, lang = 'en-US') => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.95;
  window.speechSynthesis.speak(u);
};

// ─── Normalize text ────────────────────────────────────────────────
const normalizeText = (text) => {
  let r = text.toLowerCase().trim();
  Object.entries(WORD_NUMBERS).forEach(([w, n]) => {
    r = r.replace(new RegExp(`\\b${w}\\b`, 'g'), String(n));
  });
  return r;
};

// ─── Fuzzy match score (0–1) ───────────────────────────────────────
const matchScore = (spoken, productName) => {
  const s = spoken.toLowerCase();
  const p = productName.toLowerCase();
  if (p === s) return 1;
  if (p.includes(s) || s.includes(p)) return 0.9;
  const sW = s.split(/\s+/);
  const pW = p.split(/\s+/);
  let hits = 0;
  sW.forEach(sw => { if (pW.some(pw => pw.includes(sw) || sw.includes(pw))) hits++; });
  return hits / Math.max(sW.length, pW.length);
};

const findProduct = (spokenItem, products) => {
  let best = null, bestScore = 0;
  products.forEach(p => {
    const score = matchScore(spokenItem, p.name);
    if (score > bestScore) { bestScore = score; best = p; }
  });
  return bestScore >= 0.35 ? { product: best, score: bestScore } : null;
};

// ─── Parse voice command ───────────────────────────────────────────
const parseCommand = (raw) => {
  const text = normalizeText(raw);

  // Cart management
  if (/\b(clear|empty|remove all|delete all)\b.*cart|\bcart\b.*(clear|empty)/.test(text)) return { action: 'clear_cart' };
  if (/\b(what('s| is) in my cart|show (my )?cart|read (my )?cart|cart items|list (my )?cart)\b/.test(text)) return { action: 'read_cart' };
  if (/\b(checkout|place order|order now|proceed to (pay|checkout))\b/.test(text)) return { action: 'checkout' };
  if (/\b(reorder|order again|repeat (my |last )?order|same as (last|before))\b/.test(text)) return { action: 'reorder' };

  // Filter: "show me cheap items", "show expensive products", "show dairy"
  const cheapMatch = /\b(cheap|cheapest|low(est)? price|affordable|budget|under \d+)\b/.test(text);
  const expensiveMatch = /\b(expensive|costly|premium|high(est)? price)\b/.test(text);
  const showMatch = text.match(/\b(show|find|search|filter|display)\b.*\b(me\s+)?(\w+)\b/);
  if (cheapMatch) return { action: 'filter', sort: 'cheap' };
  if (expensiveMatch) return { action: 'filter', sort: 'expensive' };
  if (showMatch && /\b(show|find|search|filter)\b/.test(text) && !/(add|get|give|put|i need|i want)/.test(text)) {
    // extract category keyword — last meaningful word after show/find
    const keyword = text
      .replace(/\b(show|find|search|filter|display|me|all|the|items?|products?)\b/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .join(' ');
    if (keyword) return { action: 'filter', category: keyword };
  }

  // Remove item: "remove 2 apples", "delete milk", "take out 3 bananas"
  const removeMatch = text.match(/\b(remove|delete|take out|drop)\b\s+(?:(\d+)\s+)?(.+)/);
  if (removeMatch) {
    const name = removeMatch[3].replace(/\b(from (my |the )?cart|please)\b/g, '').trim();
    return { action: 'remove', qty: parseInt(removeMatch[2]) || 1, name };
  }

  // Add items (default) — handles "add 2 apples and 3 bananas"
  const segments = text.split(/\band\b|,/);
  const items = [];
  segments.forEach(seg => {
    seg = seg.replace(/\b(add|get|i need|i want|give me|put|please|some|the|order|buy)\b/g, ' ').trim();
    let m = seg.match(/^(\d+)\s+(.+)$/);
    if (m) { items.push({ name: m[2].trim(), qty: parseInt(m[1]) }); return; }
    m = seg.match(/^(.+?)\s+(\d+)$/);
    if (m) { items.push({ name: m[1].trim(), qty: parseInt(m[2]) }); return; }
    if (seg.length > 1) items.push({ name: seg.trim(), qty: 1 });
  });
  return { action: 'add', items };
};

// ─── Translate any language to English via MyMemory (free, no key) ──
const translateToEnglish = async (text, sourceLang) => {
  // Extract just the lang code e.g. 'hi' from 'hi-IN'
  const src = sourceLang.split('-')[0];
  if (src === 'en') return text; // already English
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${src}|en`
    );
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    // MyMemory returns the original if it can't translate
    if (translated && translated.toLowerCase() !== text.toLowerCase()) {
      return translated;
    }
    return text;
  } catch {
    return text; // fallback to original on network error
  }
};

export { speak, LANGUAGES, findProduct, parseCommand, normalizeText, translateToEnglish, API };
