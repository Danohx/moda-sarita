import { Heart, Shirt, ShoppingBag, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { SectionHeading } from "@web/components/ui/SectionHeading";
import type { HomeCategory } from "@web/features/home/services/home.service";
import styles from "./CategorySection.module.css";

const categoryIcons = [Shirt, Sparkles, Heart, ShoppingBag];

const fallbackDescriptions = [
  "Prendas seleccionadas para renovar tus looks.",
  "Opciones femeninas para cada momento del día.",
  "Combina comodidad, estilo y personalidad.",
  "Detalles que completan tu outfit.",
];

type CategorySectionProps = {
  categories: HomeCategory[];
};

export function CategorySection({ categories }: CategorySectionProps) {
  return (
    <section className="section" aria-labelledby="categories-title">
      <div className="container">
        <SectionHeading
          eyebrow="Encuentra tu estilo"
          title="Compra por categoría"
          description="Explora una selección organizada para encontrar más rápido lo que estás buscando."
        />

        <div className={styles.grid}>
          {categories.map((category, index) => {
            const Icon = categoryIcons[index % categoryIcons.length] ?? Shirt;

            return (
              <Link
                className={styles.card}
                key={String(category.id)}
                to={`/catalogo?categoriaId=${encodeURIComponent(String(category.id))}`}
              >
                <span className={styles.icon} aria-hidden="true">
                  <Icon size={28} strokeWidth={1.7} />
                </span>
                <span className={styles.content}>
                  <strong>{category.nombre}</strong>
                  <small>
                    {category.descripcion || fallbackDescriptions[index % fallbackDescriptions.length]}
                  </small>
                </span>
                <span className={styles.arrow} aria-hidden="true">
                  →
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
