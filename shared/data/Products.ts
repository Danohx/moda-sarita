// BORRAR CUANDO HAYA BASE DE DATOS
import blusa_seda from '../assets/images/blusa_seda.jpg'
import chaqueta_piel from '../assets/images/chaqueta_piel.jpg'
import jeans_skinny from '../assets/images/jeans_skinny.jpg'
import vestido_floral from '../assets/images/vestido_floral.jpg'

export const PRODUCTS = [
  { 
    id: 1, 
    title: 'Blusa Seda', 
    description: 'Elegancia pura para tus eventos de noche. Tela suave y transpirable.', 
    price: 450, 
    category: 'blusas',
    image: blusa_seda
  },
  { 
    id: 2, 
    title: 'Vestido Floral', 
    description: 'Diseño primaveral fresco y cómodo. Ideal para el día.', 
    price: 600, 
    category: 'vestidos',
    image: chaqueta_piel 
  },
  { 
    id: 3, 
    title: 'Jeans Skinny', 
    description: 'Ajuste perfecto que moldea tu figura. Mezclilla premium.', 
    price: 550, 
    category: 'pantalones',
    image: jeans_skinny 
  },
  { 
    id: 4, 
    title: 'Chaqueta Piel', 
    description: 'Estilo rebelde con un toque chic. Piel sintética de alta calidad.', 
    price: 800, 
    category: 'chaquetas',
    image: vestido_floral 
  },
];