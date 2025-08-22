import { categories, guides } from "@/lib/data";
import { CategoryCard } from "@/components/dashboard/category-card";

export default function Home() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Welcome to NgBeta Learn</h1>
        <p className="text-muted-foreground mt-2">
          Your journey to mastery starts here. Choose a category to begin.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const categoryGuides = guides.filter(
            (guide) => guide.category === category.slug
          );
          return (
            <CategoryCard
              key={category.slug}
              category={category}
              guides={categoryGuides}
            />
          );
        })}
      </div>
    </div>
  );
}
