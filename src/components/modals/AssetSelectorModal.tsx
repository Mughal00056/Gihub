import React, { useState, useMemo } from 'react';
import { Search, Star, X, Check } from 'lucide-react';
import { Asset } from '../../types/trading';
import { sound } from '../../utils/audio';

interface AssetSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  selectedAsset: Asset;
  onSelectAsset: (asset: Asset) => void;
}

export const AssetSelectorModal: React.FC<AssetSelectorModalProps> = ({
  isOpen,
  onClose,
  assets,
  selectedAsset,
  onSelectAsset,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'forex' | 'crypto' | 'commodities' | 'stocks'>('forex');
  const [favorites, setFavorites] = useState<string[]>(['eur-aud-otc', 'eur-usd', 'xau-usd']);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    setFavorites((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            asset.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (activeTab === 'favorites' && !favorites.includes(asset.id)) return false;
      if (selectedCategory !== 'all' && asset.type !== selectedCategory) return false;
      return true;
    });
  }, [assets, searchQuery, activeTab, selectedCategory, favorites]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh] z-10 animate-in zoom-in-95 duration-150">
        
        {/* Header & Search */}
        <div className="p-3.5 border-b border-gray-100 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-base">Select Asset</h2>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input Bar (Matches screenshot "Search assets...") */}
          <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
            <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent focus:outline-none text-gray-800 placeholder-gray-400 text-sm"
              autoFocus
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Top Tabs: Favorites / Fixed Time */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('favorites');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'favorites' 
                  ? 'bg-amber-50 text-amber-700 border border-amber-200/80 font-bold' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${activeTab === 'favorites' ? 'fill-amber-500 text-amber-500' : ''}`} />
              Favorites ({favorites.length})
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('all');
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'all' 
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-bold' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Fixed Time
            </button>
          </div>

          {/* Category Chips: Currency pairs 53, Crypto, Commodities, Stocks */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {[
              { id: 'forex', label: 'Currency pairs 53' },
              { id: 'crypto', label: 'Crypto' },
              { id: 'commodities', label: 'Commodities' },
              { id: 'stocks', label: 'Stocks' },
              { id: 'all', label: 'All' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedCategory(cat.id as any);
                }}
                className={`px-3 py-1 rounded-full whitespace-nowrap font-medium text-xs transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-gray-900 text-white font-bold shadow-xs'
                    : 'bg-gray-100 hover:bg-gray-200/80 text-gray-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Assets Table List Header */}
        <div className="grid grid-cols-12 px-4 py-2 bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          <div className="col-span-7">Asset</div>
          <div className="col-span-2 text-right">24h</div>
          <div className="col-span-3 text-right">Profit</div>
        </div>

        {/* Scrollable Asset List */}
        <div className="overflow-y-auto flex-1 divide-y divide-gray-100 max-h-[420px]">
          {filteredAssets.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No matching trading assets found
            </div>
          ) : (
            filteredAssets.map((asset) => {
              const isSelected = asset.id === selectedAsset.id;
              const isFav = favorites.includes(asset.id);
              const isPositive = asset.change24h >= 0;

              return (
                <div
                  key={asset.id}
                  onClick={() => {
                    sound.playClick();
                    onSelectAsset(asset);
                    onClose();
                  }}
                  className={`grid grid-cols-12 items-center px-4 py-3 hover:bg-blue-50/40 cursor-pointer transition-colors ${
                    isSelected ? 'bg-indigo-50/50' : ''
                  }`}
                >
                  {/* Left: Star + Flag + Name */}
                  <div className="col-span-7 flex items-center gap-2.5">
                    <button
                      onClick={(e) => toggleFavorite(asset.id, e)}
                      className="p-1 text-gray-300 hover:text-amber-500 transition-colors"
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>

                    <div className="flex items-center text-base sm:text-lg leading-none shrink-0">
                      <span>{asset.flag1}</span>
                      {asset.flag2 && <span className="-ml-1">{asset.flag2}</span>}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-xs sm:text-sm text-gray-900 truncate">
                        {asset.name}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {asset.symbol}
                      </span>
                    </div>

                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 ml-1" />
                    )}
                  </div>

                  {/* 24h Change */}
                  <div className={`col-span-2 text-right font-mono text-xs font-semibold ${
                    isPositive ? 'text-emerald-600' : 'text-rose-500'
                  }`}>
                    {isPositive ? '+' : ''}{asset.change24h}%
                  </div>

                  {/* Profit Payout Tag (e.g. 92% in bright green pill) */}
                  <div className="col-span-3 text-right">
                    <span className="inline-block px-2 py-0.5 rounded-md text-xs font-bold bg-[#00b15d] text-white shadow-2xs font-mono">
                      {asset.payout}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
