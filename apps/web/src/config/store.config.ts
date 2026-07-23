export const STORE_CONFIG = {
  name: "Moda Sarita",
  tagline: "Estilo cercano, piezas que te hacen sentir tú.",
  phoneDisplay: "771 302 1092",
  phoneHref: "+527713021092",
  address: "Av. Juárez #14 B, Juárez, 43000 Huejutla de Reyes, Hgo.",
  facebookUrl: "https://www.facebook.com/profile.php?id=100064330681893",
  pickupLabel: "Recoge sin costo en boutique",
  deliveryLabel: "Entrega disponible según tu zona",
  finalSaleMessage: "Ventas finales. Actualmente no se realizan cambios.",
} as const;

export const FALLBACK_CATEGORIES = [
  {
    id: "vestidos",
    nombre: "Vestidos",
    descripcion: "Siluetas femeninas para ocasiones especiales y días casuales.",
  },
  {
    id: "blusas",
    nombre: "Blusas",
    descripcion: "Prendas versátiles para combinar con tu estilo diario.",
  },
  {
    id: "pantalones",
    nombre: "Pantalones",
    descripcion: "Cortes cómodos y modernos para completar cualquier look.",
  },
  {
    id: "accesorios",
    nombre: "Accesorios",
    descripcion: "Bolsos, carteras y detalles que transforman tu outfit.",
  },
] as const;
