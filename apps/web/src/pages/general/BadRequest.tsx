import ErrorLayout from '@shared/components/layout/ErrorLayout';

const BadRequest = () => {
  return (
    <ErrorLayout 
      code="400"
      title="Talla incorrecta"
      message="La solicitud enviada no se ajusta a nuestros patrones. Verifica la dirección URL."
      icon="content_cut"
    />
  );
};

export default BadRequest;