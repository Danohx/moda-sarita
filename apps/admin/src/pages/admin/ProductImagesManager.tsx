import React, { useCallback, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ImagePlus, RefreshCw, Star, Trash2, X } from "lucide-react";
import styles from "../../../styles/ProductImagesManager.module.css";
import { productoImagenesService } from "@admin/services/productoImagenes.service";
import AdminBreadcrumbs from "@admin/components/layout/AdminBreadcrumbs";
import type { BreadcrumbItem } from "@admin/components/layout/AdminBreadcrumbs";
import { useBreadcrumbContext } from "@shared/hooks/useBreadcrumbContext";

type ProductImage = {
  id: string | number;
  producto_id?: string | number;
  url: string;
  public_id?: string;
  orden?: number;
  es_principal?: boolean;
};

const MAX_FILES_PER_UPLOAD = 5;

const ProductImagesManager: React.FC = () => {
  const { id = "" } = useParams();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [items, setItems] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const ctx = useBreadcrumbContext();
  const breadcrumbItems: BreadcrumbItem[] =
    ctx.from === "detail"
      ? [
          { label: "Productos", to: "/products" },
          { label: "Detalles del producto", to: `/productos/${id}` },
          { label: "Imagenes del producto" },
        ]
      : [
          { label: "Productos", to: "/products" },
          { label: "Imagenes del producto" },
        ];

  const loadItems = useCallback(
    async (isRefresh = false) => {
      if (!id) {
        setItems([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        setError(null);

        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        const data = await productoImagenesService.getByProductoId(id);
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setItems([]);
        setError("No se pudieron cargar las imágenes.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id],
  );

  React.useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const mainImageId = useMemo(
    () => items.find((image) => image.es_principal)?.id ?? null,
    [items],
  );

  const resetFileInput = () => {
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const incomingFiles = Array.from(event.target.files ?? []);

    if (incomingFiles.length === 0) {
      event.target.value = "";
      return;
    }

    setFiles((prev) => {
      const merged = [...prev, ...incomingFiles];

      const uniqueFiles = merged.filter(
        (file, index, self) =>
          index ===
          self.findIndex(
            (item) =>
              item.name === file.name &&
              item.size === file.size &&
              item.lastModified === file.lastModified,
          ),
      );

      const limitedFiles = uniqueFiles.slice(0, MAX_FILES_PER_UPLOAD);

      if (uniqueFiles.length > MAX_FILES_PER_UPLOAD) {
        setError(
          `Solo puedes subir hasta ${MAX_FILES_PER_UPLOAD} imágenes por carga.`,
        );
      } else {
        setError(null);
      }

      return limitedFiles;
    });

    event.target.value = "";
  };

  const removeSelectedFile = (index: number) => {
    setFiles((prev) => {
      const next = prev.filter((_, currentIndex) => currentIndex !== index);

      if (next.length === 0 && fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return next;
    });
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!id || files.length === 0) return;

    try {
      setSaving(true);
      setError(null);

      for (const file of files) {
        const formData = new FormData();
        formData.append("imagen", file);
        await productoImagenesService.upload(id, formData);
      }

      resetFileInput();
      await loadItems(true);
    } catch (err) {
      console.error(err);
      setError("No se pudieron subir una o más imágenes.");
    } finally {
      setSaving(false);
    }
  };

  const handleSetPrincipal = async (imagenId: string | number) => {
    if (!id) return;

    try {
      setSaving(true);
      setError(null);
      await productoImagenesService.setPrincipal(id, imagenId);
      await loadItems(true);
    } catch (err) {
      console.error(err);
      setError("No se pudo marcar la imagen como principal.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (imagenId: string | number) => {
    if (!id) return;

    const confirmed = window.confirm("¿Eliminar esta imagen?");
    if (!confirmed) return;

    try {
      setSaving(true);
      setError(null);
      await productoImagenesService.remove(id, imagenId);
      await loadItems(true);
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar la imagen.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <AdminBreadcrumbs items={breadcrumbItems} />
          <h1 className={styles.title}>Imágenes del producto</h1>
          <p className={styles.subtitle}>
            Carga, organiza y define la imagen principal del producto.
          </p>
        </div>

        <button
          type="button"
          className={styles.refreshBtn}
          onClick={() => void loadItems(true)}
          disabled={refreshing || saving}
        >
          <RefreshCw size={18} className={refreshing ? styles.spinning : ""} />
          {refreshing ? "Recargando..." : "Recargar"}
        </button>
      </header>

      {error ? <div className={styles.errorBox}>{error}</div> : null}

      <section className={styles.uploadCard}>
        <h2 className={styles.sectionTitle}>Subir imágenes</h2>

        <form className={styles.uploadForm} onSubmit={handleUpload}>
          <div className={styles.uploadControls}>
            <label className={styles.filePicker}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesChange}
                disabled={saving}
              />
              Elegir imágenes
            </label>

            <div className={styles.uploadInfo}>
              {files.length > 0
                ? `${files.length} imagen${files.length === 1 ? "" : "es"} seleccionada${files.length === 1 ? "" : "s"}`
                : "No se eligió ninguna imagen"}
            </div>

            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={files.length === 0 || saving}
            >
              <ImagePlus size={18} />
              {saving ? "Subiendo..." : "Subir imágenes"}
            </button>
          </div>

          {files.length > 0 ? (
            <div className={styles.selectedFiles}>
              {files.map((selectedFile, index) => (
                <div
                  key={`${selectedFile.name}-${index}`}
                  className={styles.fileChip}
                >
                  <span className={styles.fileChipName}>
                    {selectedFile.name}
                  </span>
                  <button
                    type="button"
                    className={styles.fileChipRemove}
                    onClick={() => removeSelectedFile(index)}
                    disabled={saving}
                    aria-label={`Quitar ${selectedFile.name}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </form>
      </section>

      <section className={styles.galleryCard}>
        <h2 className={styles.sectionTitle}>Galería</h2>

        {loading ? (
          <div className={styles.centerState}>Cargando galería...</div>
        ) : items.length === 0 ? (
          <div className={styles.centerState}>
            Todavía no hay imágenes para este producto.
          </div>
        ) : (
          <div className={styles.grid}>
            {items.map((image, index) => {
              const isMain = Boolean(image.es_principal);
              const displayOrder = Number.isFinite(Number(image.orden))
                ? Number(image.orden)
                : index;
              const disablePrincipal =
                saving || isMain || mainImageId === image.id;

              return (
                <article key={image.id} className={styles.imageCard}>
                  <div className={styles.imageFrame}>
                    <img
                      src={image.url}
                      alt={`Producto ${displayOrder + 1}`}
                      className={styles.image}
                    />
                  </div>

                  <div className={styles.imageFooter}>
                    <span
                      className={isMain ? styles.mainBadge : styles.normalBadge}
                    >
                      {isMain ? "Principal" : `Orden ${displayOrder + 1}`}
                    </span>
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => void handleSetPrincipal(image.id)}
                        disabled={disablePrincipal}
                        title={isMain ? "Imagen principal" : "Marcar principal"}
                      >
                        <Star size={16} />
                      </button>
                      <button
                        type="button"
                        className={styles.iconBtnDanger}
                        onClick={() => void handleDelete(image.id)}
                        disabled={saving}
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
};

export default ProductImagesManager;
