// src/components/TokenModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { TokenInfo } from '@solana/spl-token-registry';

interface TokenModalProps {
  tokens: TokenInfo[];
  isOpen: boolean;
  onClose: () => void;
  onSelectToken: (token: TokenInfo) => void;
}

const TokenModal: React.FC<TokenModalProps> = ({ tokens, isOpen, onClose, onSelectToken }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTokens, setFilteredTokens] = useState(tokens);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredTokens(tokens);
    } else {
      const lowercasedFilter = searchTerm.toLowerCase();
      const filtered = tokens.filter(token =>
        token.name.toLowerCase().includes(lowercasedFilter) ||
        token.symbol.toLowerCase().includes(lowercasedFilter)
      );
      setFilteredTokens(filtered);
    }
  }, [searchTerm, tokens]);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-phoenix-container-bg border border-phoenix-border rounded-lg p-5 w-full max-w-md max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-semibold text-center mb-4">Select a Token</h3>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search name or symbol"
          className="w-full bg-phoenix-bg border border-phoenix-border rounded-lg p-3 mb-4 text-phoenix-text-primary outline-none focus:border-phoenix-accent"
        />
        <ul className="flex-grow overflow-y-auto space-y-2 pr-2">
          {filteredTokens.map(token => (
            <li key={token.address}>
              <button
                onClick={() => { onSelectToken(token); onClose(); }}
                className="w-full flex items-center gap-3 p-2.5 rounded-md hover:bg-phoenix-border transition-colors"
              >
                <img src={token.logoURI} alt={token.symbol} className="h-7 w-7 rounded-full" />
                <div>
                  <p className="font-semibold text-left">{token.name}</p>
                  <p className="text-xs text-phoenix-text-secondary text-left">{token.symbol}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TokenModal;