import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./NotFoundPage.module.css";

export function NotFoundPage() {
  return (
    <section className={`${styles.section} container`}>
      <p>404</p>
      <h1>Esta página no está disponible.</h1>
      <span>La dirección puede ser incorrecta o el contenido pudo haberse movido.</span>
      <Link className="button button-primary" to="/">
        <ArrowLeft size={18} />
        Regresar al inicio
      </Link>
    </section>
  );
}
