import { useState } from 'react';
import { useFinanceStore } from '@/store';
import { InlineError } from '../common';

const COMMON_TICKERS = [
  { value: 'AAPL', label: 'Apple (AAPL)' },
  { value: 'GOOGL', label: 'Alphabet (GOOGL)' },
  { value: 'AMZN', label: 'Amazon (AMZN)' },
  { value: 'TSLA', label: 'Tesla (TSLA)' },
  { value: 'NVDA', label: 'NVIDIA (NVDA)' },
  { value: 'META', label: 'Meta (META)' },
  { value: 'JPM', label: 'JPMorgan Chase (JPM)' },
  { value: 'V', label: 'Visa (V)' },
  { value: 'WMT', label: 'Walmart (WMT)' },
  { value: 'JNJ', label: 'Johnson & Johnson (JNJ)' },
];

export function CompanySelector() {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<typeof COMMON_TICKERS>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addCustomCompany = useFinanceStore((state) => state.addCustomCompany);
  const customSymbols = useFinanceStore((state) => state.customSymbols);

  const validateSymbol = (symbol: string): boolean => {
    return /^[A-Z]{1,5}$/.test(symbol.toUpperCase());
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setError(null);
    const upper = value.toUpperCase();
    if (upper.length >= 1) {
      const filtered = COMMON_TICKERS.filter(
        (t) => t.value.startsWith(upper) || t.label.toUpperCase().includes(upper)
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelect = (symbol: string) => {
    if (!validateSymbol(symbol)) {
      setError(`Invalid symbol: ${symbol}. Use 1-5 uppercase letters.`);
      return;
    }
    const upperSymbol = symbol.toUpperCase();
    if (customSymbols.includes(upperSymbol)) {
      setError(`${upperSymbol} already added`);
      return;
    }
    addCustomCompany(upperSymbol, {
      symbol: upperSymbol,
      name: upperSymbol,
      color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
      isPrimary: false,
    });
    setInputValue('');
    setShowSuggestions(false);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      handleSelect(inputValue.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => inputValue && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Add ticker (e.g., AAPL)..."
          className="w-48 sm:w-64 px-3 py-2 border border-[#e5e7eb] rounded-lg bg-white text-[#1f2328] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#3b82d4] focus:border-transparent text-sm uppercase"
          aria-autocomplete="list"
          aria-controls="ticker-suggestions"
          aria-expanded={showSuggestions}
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul
            id="ticker-suggestions"
            className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-[#e5e7eb] rounded-lg shadow-lg max-h-48 overflow-auto"
            role="listbox"
          >
            {suggestions.map((ticker) => (
              <li
                key={ticker.value}
                role="option"
                onClick={() => handleSelect(ticker.value)}
                className="px-3 py-2 text-sm text-[#1f2328] hover:bg-[#f7f8fa] cursor-pointer"
              >
                {ticker.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <InlineError message={error} className="mt-1.5" />}
    </form>
  );
}