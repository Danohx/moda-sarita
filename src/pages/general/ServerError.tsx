import ErrorLayout from '../../components/layout/ErrorLayout';

const ServerError = () => {
  return (
    <ErrorLayout 
      code="500"
      title="Error en el taller"
      message="Nuestros sastres digitales tuvieron un problema. Intenta de nuevo en unos minutos."
      icon="engineering"
    />
  );
};

export default ServerError;