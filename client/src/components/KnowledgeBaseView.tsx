import { useState } from "react";
import { 
  BookOpen, Search, Filter, ExternalLink, Calendar, 
  Users, Award, Bookmark, ArrowUpRight 
} from "lucide-react";

interface KnowledgeBaseViewProps {
  onSearchSuggest: (query: string) => void;
}

export function KnowledgeBaseView({ onSearchSuggest }: KnowledgeBaseViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Oncology", "Cardiology", "Immunology", "Neurology", "Genetics"];

  const publications = [
    {
      title: "Targeted Oncology in EGFR-Mutant Non-Small Cell Lung Cancer: 2026 Guidelines",
      authors: ["Jenkins S.", "Mayer A.", "Chen M."],
      journal: "Journal of Thoracic Oncology",
      year: 2026,
      category: "Oncology",
      abstract: "This review synthesizes clinical trial results for third-generation EGFR inhibitors (osimertinib) in combination with pembrolizumab, discussing resistance management and mutation-directed guidelines.",
      citations: 342,
      impactFactor: "20.1",
      url: "https://pubmed.ncbi.nlm.nih.gov"
    },
    {
      title: "CAR-T Cell Therapy Expansion in Relapsed Diffuse Large B-Cell Lymphoma",
      authors: ["Gomez L.", "Harlan R."],
      journal: "The Lancet Haematology",
      year: 2025,
      category: "Immunology",
      abstract: "A multi-center analysis of long-term survival metrics for patients undergoing CD19-targeted CAR-T infusion, focusing on cytokine release syndrome mitigation protocols.",
      citations: 189,
      impactFactor: "18.9",
      url: "https://pubmed.ncbi.nlm.nih.gov"
    },
    {
      title: "SGLT2 Inhibitors and Cardiovascular Risk Reduction in Type 2 Diabetes",
      authors: ["Patel R.", "O'Connor D.", "Stein E."],
      journal: "New England Journal of Medicine",
      year: 2025,
      category: "Cardiology",
      abstract: "Analyzing cardiorenal protection mechanisms of empagliflozin in patients with heart failure with preserved ejection fraction (HFpEF) across random double-blind trials.",
      citations: 512,
      impactFactor: "74.6",
      url: "https://pubmed.ncbi.nlm.nih.gov"
    },
    {
      title: "Tau-Targeted Antisense Oligonucleotides in Early-Stage Alzheimer's Disease",
      authors: ["Watanabe T.", "Vogel J."],
      journal: "Nature Medicine",
      year: 2026,
      category: "Neurology",
      abstract: "Phase I/II clinical trial outcomes for intrathecal administration of BIIB080, demonstrating reduction in soluble tau protein levels in cerebrospinal fluid.",
      citations: 88,
      impactFactor: "28.7",
      url: "https://pubmed.ncbi.nlm.nih.gov"
    },
    {
      title: "CRISPR-Cas9 Gene Editing for Severe Transfusion-Dependent Beta-Thalassemia",
      authors: ["Fraser K.", "Dumas P.", "Kowalski R."],
      journal: "Nature Genetics",
      year: 2024,
      category: "Genetics",
      abstract: "Reporting durable fetal hemoglobin elevation in patients following autologous CRISPR-edited hematopoietic stem cell transplantation (exagamglogene autotemcel).",
      citations: 620,
      impactFactor: "31.7",
      url: "https://pubmed.ncbi.nlm.nih.gov"
    }
  ];

  const filteredPubs = publications.filter(pub => {
    const matchesSearch = pub.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          pub.abstract.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || pub.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">
          Medical Knowledge Base
        </h1>
        <p className="text-sm text-slate-400 font-light mt-1">
          Explore curated guidelines, high-impact clinical journals, and therapeutic reference documentation.
        </p>
      </div>

      {/* Filter and Search Layout */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search literature, authors, journals..."
            className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/40"
          />
        </div>

        {/* Category Toggles */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                activeCategory === cat 
                  ? "bg-primary text-white" 
                  : "text-slate-400 bg-slate-900 border border-slate-850 hover:bg-slate-850"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Results Listing */}
      <div className="space-y-4">
        {filteredPubs.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-2xl border border-white/5 space-y-3">
            <BookOpen className="h-10 w-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">No guidelines matched your query</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto font-light">
              Try adjusting your search terms or selecting a different clinical category filter.
            </p>
          </div>
        ) : (
          filteredPubs.map((pub, idx) => (
            <div 
              key={idx} 
              className="glass-card p-6 rounded-2xl border border-white/5 transition-all hover:border-white/10 duration-300 relative group overflow-hidden"
            >
              {/* Top Meta info */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                    {pub.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Impact Factor: <strong className="text-slate-300">{pub.impactFactor}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <button className="text-slate-500 hover:text-cyan-400 transition-colors">
                    <Bookmark className="h-3.5 w-3.5" />
                  </button>
                  <a 
                    href={pub.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Title & Click redirection */}
              <h3 
                onClick={() => onSearchSuggest(pub.title)}
                className="text-sm font-bold text-slate-100 hover:text-primary transition-colors cursor-pointer leading-snug font-display pr-6"
              >
                {pub.title}
              </h3>

              {/* Abstract */}
              <p className="text-xs text-slate-400 mt-2.5 font-light leading-relaxed">
                {pub.abstract}
              </p>

              {/* Footer info */}
              <div className="mt-4 pt-4 border-t border-slate-800/40 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-500 font-light">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    {pub.authors.join(", ")}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-slate-400">
                    <Calendar className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    {pub.journal} ({pub.year})
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <span>Citations: <strong className="font-semibold text-slate-300">{pub.citations}</strong></span>
                  <button 
                    onClick={() => onSearchSuggest(pub.title)}
                    className="text-[10px] font-semibold text-cyan-400 hover:underline flex items-center gap-0.5 group"
                  >
                    Query Literature
                    <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:translate-y-[-0.5px] transition-transform" />
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
