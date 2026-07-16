import React, { useState, useMemo } from "react";
import { Search, Filter, BookOpen, ChevronRight, Briefcase } from "lucide-react";
import { RAW_INSIGHTS, Insight } from "../report-data";

export default function InsightsExplorer() {
  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Trader", "Exchange", "Investor", "Risk"];

  // Filter insights based on search term and category
  const filteredInsights = useMemo(() => {
    return RAW_INSIGHTS.filter((insight) => {
      const matchesSearch = 
        insight.title.toLowerCase().includes(search.toLowerCase()) ||
        insight.description.toLowerCase().includes(search.toLowerCase()) ||
        insight.implication.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === "All" || insight.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case "Trader":
        return "text-indigo-700 bg-indigo-50 border-indigo-200";
      case "Exchange":
        return "text-cyan-700 bg-cyan-50 border-cyan-200";
      case "Investor":
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "Risk":
        return "text-rose-700 bg-rose-50 border-rose-200";
      default:
        return "text-[#717171] bg-[#F5F5F5] border-[#EDEDED]";
    }
  };

  return (
    <div id="insights-explorer-card" className="bg-white border border-[#EDEDED] p-6 shadow-sm space-y-6 rounded-none text-[#1A1A1A]">
      {/* Search & Filter Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#EDEDED] pb-4">
        <div>
          <h4 className="font-display font-semibold text-sm text-black uppercase tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-black" />
            15 Professional Business Insights
          </h4>
          <p className="text-xs text-[#717171] font-sans mt-0.5">
            Cross-sectional takeaways for traders, investors, risk desks, and perpetual exchange operators.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2 w-4 h-4 text-[#A1A1A1]" />
            <input
              id="insights-search-field"
              type="text"
              placeholder="Search insights..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 bg-white border border-[#EDEDED] focus:border-black rounded-none py-1.5 pl-9 pr-4 text-xs text-black focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-[#EDEDED] pb-3">
        {categories.map((cat) => (
          <button
            key={cat}
            id={`filter-tab-${cat.toLowerCase()}`}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-none text-xs font-mono transition-all border uppercase tracking-wider font-bold cursor-pointer ${
              selectedCategory === cat
                ? "bg-[#1A1A1A] border-black text-white"
                : "bg-white border-[#EDEDED] text-[#717171] hover:text-black hover:border-black"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Cards */}
      {filteredInsights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInsights.map((insight, index) => {
            const styles = getCategoryStyles(insight.category);
            return (
              <div 
                key={insight.id}
                id={`insight-card-${insight.id}`}
                className="bg-white border border-[#EDEDED] p-5 transition-all flex flex-col justify-between group h-full hover:shadow-sm hover:border-[#A1A1A1] rounded-none"
              >
                <div className="space-y-3">
                  {/* Card Header: ID & Badge */}
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-[#A1A1A1] font-bold uppercase tracking-widest">
                      Insight {index + 1}
                    </span>
                    <span className={`px-2 py-0.5 border text-[9px] font-mono font-semibold tracking-wider uppercase rounded-none ${styles}`}>
                      {insight.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h5 className="font-display font-semibold text-xs text-black leading-snug uppercase tracking-tight">
                    {insight.title}
                  </h5>

                  {/* Description */}
                  <p className="text-xs text-[#4A4A4A] leading-relaxed font-sans font-light">
                    {insight.description}
                  </p>
                </div>

                {/* Implication Section */}
                <div className="mt-4 pt-3 border-t border-[#EDEDED] space-y-1 bg-[#FAFAFA] rounded-none p-3">
                  <div className="text-[9px] font-mono font-bold text-black flex items-center gap-1 uppercase tracking-wider">
                    <Briefcase className="w-3.5 h-3.5 text-[#717171]" />
                    Actionable Implication
                  </div>
                  <p className="text-[11px] text-[#4A4A4A] font-sans italic leading-relaxed">
                    {insight.implication}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-[#EDEDED] rounded-none bg-[#FAFAFA]">
          <p className="text-[#717171] text-xs">No insights match your filter criteria.</p>
          <button 
            id="reset-insights-search-btn"
            onClick={() => { setSearch(""); setSelectedCategory("All"); }}
            className="mt-3 text-xs font-mono font-bold uppercase tracking-wider text-black hover:underline cursor-pointer"
          >
            Clear Search & Filters
          </button>
        </div>
      )}
    </div>
  );
}
