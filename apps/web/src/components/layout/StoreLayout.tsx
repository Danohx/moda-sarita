import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { ScrollManager } from "@web/components/navigation/ScrollManager";
import styles from "./StoreLayout.module.css";

export function StoreLayout() {
  return (
    <div className={styles.shell}>
      <ScrollManager />
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
