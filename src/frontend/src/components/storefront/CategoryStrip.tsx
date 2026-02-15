import { Sofa, Armchair, Table2, Bed, Package } from 'lucide-react';

interface CategoryStripProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

// Map known category names to icons with a fallback
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('sofa')) return Sofa;
  if (name.includes('chair')) return Armchair;
  if (name.includes('table')) return Table2;
  if (name.includes('bed')) return Bed;
  return Package; // Default icon for unknown categories
};

export default function CategoryStrip({ categories, selectedCategory, onSelectCategory }: CategoryStripProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {/* All Categories Option */}
      <button
        onClick={() => onSelectCategory(null)}
        className={`flex flex-col items-center justify-center p-6 rounded border transition-all ${
          selectedCategory === null
            ? 'bg-primary text-primary-foreground border-primary shadow-md'
            : 'bg-card hover:bg-accent hover:border-primary/20'
        }`}
      >
        <div className="h-8 w-8 mb-3 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-0.5">
            <div className="h-3 w-3 rounded-sm bg-current opacity-70" />
            <div className="h-3 w-3 rounded-sm bg-current opacity-70" />
            <div className="h-3 w-3 rounded-sm bg-current opacity-70" />
            <div className="h-3 w-3 rounded-sm bg-current opacity-70" />
          </div>
        </div>
        <span className="text-sm font-medium">All</span>
      </button>

      {/* Dynamic Category Options from Backend */}
      {categories.map((category) => {
        const Icon = getCategoryIcon(category);
        const isSelected = selectedCategory?.toLowerCase() === category.toLowerCase();
        return (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`flex flex-col items-center justify-center p-6 rounded border transition-all ${
              isSelected
                ? 'bg-primary text-primary-foreground border-primary shadow-md'
                : 'bg-card hover:bg-accent hover:border-primary/20'
            }`}
          >
            <Icon
              className={`h-8 w-8 mb-3 transition-colors ${
                isSelected ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'
              }`}
            />
            <span className="text-sm font-medium">{category}</span>
          </button>
        );
      })}
    </div>
  );
}
