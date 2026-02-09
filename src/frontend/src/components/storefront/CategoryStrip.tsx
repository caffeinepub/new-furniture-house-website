import { Sofa, Armchair, Table2, Bed } from 'lucide-react';

const categories = [
  { name: 'Sofas', icon: Sofa },
  { name: 'Chairs', icon: Armchair },
  { name: 'Tables', icon: Table2 },
  { name: 'Beds', icon: Bed },
];

interface CategoryStripProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export default function CategoryStrip({ selectedCategory, onSelectCategory }: CategoryStripProps) {
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

      {/* Category Options */}
      {categories.map((category) => {
        const Icon = category.icon;
        const isSelected = selectedCategory === category.name;
        return (
          <button
            key={category.name}
            onClick={() => onSelectCategory(category.name)}
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
            <span className="text-sm font-medium">{category.name}</span>
          </button>
        );
      })}
    </div>
  );
}
