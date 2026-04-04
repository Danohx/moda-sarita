import React from "react";
import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "../../../../styles/AdminBreadcrumbs.module.css";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface AdminBreadcrumbsProps {
  items: BreadcrumbItem[];
}

const AdminBreadcrumbs: React.FC<AdminBreadcrumbsProps> = ({ items }) => {
  if (!items.length) return null;

  return (
    <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
      <ol className={styles.list}>
        <li className={styles.item}>
          <Link to="/dashboard" className={styles.link}>
            <Home size={14} />
            <span>Dashboard</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={`${item.label}-${index}`}>
              <li className={styles.separator} aria-hidden="true">
                <ChevronRight size={14} />
              </li>

              <li className={styles.item}>
                {isLast || !item.to ? (
                  <span className={styles.current}>{item.label}</span>
                ) : (
                  <Link to={item.to} className={styles.link}>
                    {item.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default AdminBreadcrumbs;