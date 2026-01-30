import ErrorLayout from '../../components/layout/ErrorLayout';

const NotFound = () => {
  return (
    <ErrorLayout 
      code="404"
      title="Prenda no encontrada"
      message="Parece que esta sección pasó de moda o ya no está en nuestro inventario."
      icon="checkroom"
    />
  );
};

export default NotFound;