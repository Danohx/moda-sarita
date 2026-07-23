import { useEffect, useState } from "react";
import { BenefitsSection } from "@web/features/home/components/BenefitsSection";
import { CategorySection } from "@web/features/home/components/CategorySection";
import { FeaturedProductsSection } from "@web/features/home/components/FeaturedProductsSection";
import { FulfillmentSection } from "@web/features/home/components/FulfillmentSection";
import { HeroSection } from "@web/features/home/components/HeroSection";
import {
  getHomeData,
  type HomeData,
} from "@web/features/home/services/home.service";
import styles from "./HomePage.module.css";

const initialData: HomeData = {
  categories: [],
  products: [],
  hasApiWarning: false,
};

export function HomePage() {
  const [data, setData] = useState<HomeData>(initialData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await getHomeData();
        if (active) setData(response);
      } catch {
        if (active) {
          setData((current) => ({ ...current, hasApiWarning: true }));
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      {data.hasApiWarning && (
        <div className={styles.apiWarning} role="status">
          La tienda está usando contenido de respaldo mientras se restablece la conexión con la API.
        </div>
      )}
      <HeroSection />
      <BenefitsSection />
      <CategorySection categories={data.categories} />
      <FeaturedProductsSection products={data.products} loading={loading} />
      <FulfillmentSection />
    </>
  );
}
