import styles from "./LoadingCards.module.css";

type LoadingCardsProps = {
  count?: number;
};

export function LoadingCards({ count = 4 }: LoadingCardsProps) {
  return (
    <div className={styles.grid} aria-label="Cargando contenido">
      {Array.from({ length: count }, (_, index) => (
        <div className={styles.card} key={index} aria-hidden="true">
          <div className={styles.image} />
          <div className={styles.line} />
          <div className={styles.lineShort} />
        </div>
      ))}
    </div>
  );
}
