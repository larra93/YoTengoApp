import type {
  Category,
  ChatMessageWithSender,
  NeedWithRelations,
  OfferStatus,
  OfferWithSupplier,
  Profile,
  ProfileStats,
  PublicProfile,
} from '@/types';

export const CURRENT_USER_ID = 'me';

export const MOCK_PROFILE: Profile = {
  id: CURRENT_USER_ID,
  full_name: 'Camila Rojas',
  avatar_url: null,
  phone: '+56 9 5555 1234',
  rating_avg: 4.9,
  rating_count: 12,
  location: 'SRID=4326;POINT(-70.6105 -33.4521)',
  neighborhood: 'Ñuñoa, Santiago',
  created_at: '2026-01-12T10:00:00-03:00',
  updated_at: '2026-11-06T18:00:00-03:00',
};

const JAVIER: PublicProfile = {
  id: 'javier',
  full_name: 'Javier Morales',
  avatar_url: null,
  rating_avg: 4.8,
  rating_count: 21,
  neighborhood: 'Ñuñoa, Santiago',
};

const MARIA: PublicProfile = {
  id: 'maria',
  full_name: 'María José Pinto',
  avatar_url: null,
  rating_avg: 5,
  rating_count: 8,
  neighborhood: 'Providencia, Santiago',
};

const DIEGO: PublicProfile = {
  id: 'diego',
  full_name: 'Diego Fuentes',
  avatar_url: null,
  rating_avg: 4.6,
  rating_count: 15,
  neighborhood: 'La Reina, Santiago',
};

const CAMILA: PublicProfile = {
  id: CURRENT_USER_ID,
  full_name: MOCK_PROFILE.full_name,
  avatar_url: null,
  rating_avg: MOCK_PROFILE.rating_avg,
  rating_count: MOCK_PROFILE.rating_count,
  neighborhood: MOCK_PROFILE.neighborhood,
};

export const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: 'Disfraces', slug: 'disfraces', icon: 'shirt-outline', sort_order: 1 },
  { id: 2, name: 'Herramientas', slug: 'herramientas', icon: 'construct-outline', sort_order: 2 },
  { id: 3, name: 'Libros', slug: 'libros', icon: 'book-outline', sort_order: 3 },
  { id: 4, name: 'Juegos', slug: 'juegos', icon: 'game-controller-outline', sort_order: 4 },
  { id: 5, name: 'Deportes', slug: 'deportes', icon: 'basketball-outline', sort_order: 5 },
  { id: 6, name: 'Fiestas', slug: 'fiestas', icon: 'sparkles-outline', sort_order: 6 },
  { id: 7, name: 'Hogar', slug: 'hogar', icon: 'home-outline', sort_order: 7 },
  { id: 8, name: 'Música', slug: 'musica', icon: 'musical-notes-outline', sort_order: 8 },
];

function category(slug: string) {
  return MOCK_CATEGORIES.find((item) => item.slug === slug) ?? null;
}

const NEEDS: NeedWithRelations[] = [
  {
    id: 'need-1',
    user_id: JAVIER.id,
    category_id: 2,
    title: 'Taladro percutor para colgar repisas',
    description:
      'Necesito un taladro percutor para instalar tres repisas en el living. La idea es usarlo el sábado en la mañana y devolverlo el mismo día.',
    deal_type: 'loan',
    budget_or_offer_details: '$5.000 / día',
    start_date: '2026-11-08',
    end_date: '2026-11-08',
    status: 'open',
    reference_image_url: null,
    location: 'SRID=4326;POINT(-70.6121 -33.4515)',
    address_label: 'Av. Irarrázaval 3400, Ñuñoa',
    created_at: '2026-11-07T08:15:00-03:00',
    updated_at: '2026-11-07T08:15:00-03:00',
    category: category('herramientas'),
    author: JAVIER,
    offers_count: 3,
    distance_km: 0.8,
  },
  {
    id: 'need-2',
    user_id: MARIA.id,
    category_id: 1,
    title: 'Disfraz de astronauta talla 8',
    description:
      'Mi hijo tiene una presentación el lunes y necesita un disfraz de astronauta talla 8. Prefiero arrendarlo por dos días.',
    deal_type: 'rent',
    budget_or_offer_details: '$8.000 / día',
    start_date: '2026-11-15',
    end_date: '2026-11-17',
    status: 'open',
    reference_image_url: null,
    location: 'SRID=4326;POINT(-70.6155 -33.4388)',
    address_label: 'Av. Providencia 2100, Providencia',
    created_at: '2026-11-06T19:40:00-03:00',
    updated_at: '2026-11-06T19:40:00-03:00',
    category: category('disfraces'),
    author: MARIA,
    offers_count: 2,
    distance_km: 1.2,
  },
  {
    id: 'need-3',
    user_id: DIEGO.id,
    category_id: 3,
    title: 'Intercambio libros de preparación PAES',
    description:
      'Busco los libros de Matemática y Lenguaje de la editorial SM. Tengo novelas, libros de historia y juegos de mesa para intercambiar.',
    deal_type: 'swap',
    budget_or_offer_details: 'Café + devolución',
    start_date: '2026-11-09',
    end_date: null,
    status: 'open',
    reference_image_url: null,
    location: 'SRID=4326;POINT(-70.5968 -33.4471)',
    address_label: 'Vicuña Mackenna 7200, La Reina',
    created_at: '2026-11-06T14:10:00-03:00',
    updated_at: '2026-11-06T14:10:00-03:00',
    category: category('libros'),
    author: DIEGO,
    offers_count: 1,
    distance_km: 2.4,
  },
  {
    id: 'need-4',
    user_id: CURRENT_USER_ID,
    category_id: 6,
    title: 'Carpa 3x3 para cumpleaños infantil',
    description:
      'Busco una carpa de 3x3 metros para el cumpleaños de mi hija. La necesito desde el viernes en la tarde hasta el domingo.',
    deal_type: 'rent',
    budget_or_offer_details: '$10.000 / día',
    start_date: '2026-11-13',
    end_date: '2026-11-15',
    status: 'open',
    reference_image_url: null,
    location: 'SRID=4326;POINT(-70.6105 -33.4521)',
    address_label: 'Exequiel Fernández 1500, Ñuñoa',
    created_at: '2026-11-05T17:20:00-03:00',
    updated_at: '2026-11-07T09:00:00-03:00',
    category: category('fiestas'),
    author: CAMILA,
    offers_count: 3,
    distance_km: undefined,
  },
  {
    id: 'need-5',
    user_id: CURRENT_USER_ID,
    category_id: 7,
    title: 'Escalera de tijera para limpiar canaletas',
    description:
      'Necesito una escalera de tijera de al menos 2 metros para limpiar las canaletas del segundo piso. La usaría un par de horas.',
    deal_type: 'loan',
    budget_or_offer_details: '$4.000 / día',
    start_date: '2026-11-10',
    end_date: '2026-11-11',
    status: 'completed',
    reference_image_url: null,
    location: 'SRID=4326;POINT(-70.6105 -33.4521)',
    address_label: 'Exequiel Fernández 1500, Ñuñoa',
    created_at: '2026-10-28T09:00:00-03:00',
    updated_at: '2026-11-01T18:00:00-03:00',
    category: category('hogar'),
    author: CAMILA,
    offers_count: 4,
    distance_km: undefined,
  },
  {
    id: 'need-6',
    user_id: CURRENT_USER_ID,
    category_id: 4,
    title: 'Juego de mesa Catan para noche de amigos',
    description:
      'Busco Catan para una noche de juegos. Puedo intercambiarlo por una pizza grande o prestar mis libros de historia.',
    deal_type: 'swap',
    budget_or_offer_details: 'Intercambio por pizza',
    start_date: '2026-11-21',
    end_date: '2026-11-22',
    status: 'open',
    reference_image_url: null,
    location: 'SRID=4326;POINT(-70.6105 -33.4521)',
    address_label: 'Exequiel Fernández 1500, Ñuñoa',
    created_at: '2026-11-04T21:00:00-03:00',
    updated_at: '2026-11-04T21:00:00-03:00',
    category: category('juegos'),
    author: CAMILA,
    offers_count: 2,
    distance_km: undefined,
  },
];

export const MOCK_NEEDS = NEEDS;
export const MOCK_MY_NEEDS = NEEDS.filter((need) => need.user_id === CURRENT_USER_ID);

function mockOffer(
  id: string,
  needId: string,
  supplier: PublicProfile,
  price: number | null,
  details: string,
  conditions: string,
  status: OfferStatus,
  createdAt: string,
): OfferWithSupplier {
  return {
    id,
    need_id: needId,
    supplier_id: supplier.id,
    price_offered: price,
    swap_offered_details: details,
    conditions,
    item_photo_url: null,
    status,
    created_at: createdAt,
    updated_at: createdAt,
    supplier,
  };
}

export const MOCK_RECEIVED_OFFERS: OfferWithSupplier[] = [
  mockOffer(
    'offer-1',
    'need-4',
    JAVIER,
    10000,
    'Carpa 3x3 impermeable',
    'Incluye 4 sacos de arena y armado. Disponible desde el viernes.',
    'pending',
    '2026-11-07T09:30:00-03:00',
  ),
  mockOffer(
    'offer-2',
    'need-4',
    MARIA,
    8500,
    'Carpa azul 3x3 + mesa plegable',
    'Puedo llevarla y retirarla yo. La mesa es de regalo por el fin de semana.',
    'pending',
    '2026-11-06T18:10:00-03:00',
  ),
  mockOffer(
    'offer-3',
    'need-4',
    DIEGO,
    12000,
    'Carpa blanca 3x3',
    'Incluye toldo lateral y bolso de transporte.',
    'pending',
    '2026-11-06T12:45:00-03:00',
  ),
];

export const MOCK_SENT_OFFERS: OfferWithSupplier[] = [
  mockOffer(
    'offer-4',
    'need-1',
    CAMILA,
    5000,
    'Taladro Bosch GSB 550 + set de brocas',
    'Tengo disponible el sábado en la mañana. Incluye brocas para concreto.',
    'pending',
    '2026-11-07T10:10:00-03:00',
  ),
  mockOffer(
    'offer-5',
    'need-2',
    CAMILA,
    7000,
    'Disfraz de astronauta + casco',
    'Talla 8, en perfecto estado. Incluye casco y guantes.',
    'accepted',
    '2026-11-06T20:05:00-03:00',
  ),
];

export const MOCK_ALL_OFFERS = [...MOCK_RECEIVED_OFFERS, ...MOCK_SENT_OFFERS];

export const MOCK_CHAT_MESSAGES: ChatMessageWithSender[] = [
  {
    id: 'msg-1',
    need_id: 'need-4',
    offer_id: 'offer-1',
    sender_id: JAVIER.id,
    receiver_id: CURRENT_USER_ID,
    message: 'Hola Camila, vi tu pedido de la carpa. Tengo una 3x3 impermeable.',
    created_at: '2026-11-07T10:02:00-03:00',
    sender: JAVIER,
  },
  {
    id: 'msg-2',
    need_id: 'need-4',
    offer_id: 'offer-1',
    sender_id: CURRENT_USER_ID,
    receiver_id: JAVIER.id,
    message: '¡Hola Javier! ¿Incluye los sacos de arena?',
    created_at: '2026-11-07T10:04:00-03:00',
    sender: CAMILA,
  },
  {
    id: 'msg-3',
    need_id: 'need-4',
    offer_id: 'offer-1',
    sender_id: JAVIER.id,
    receiver_id: CURRENT_USER_ID,
    message: 'Sí, incluye 4 sacos y el armado. Te la puedo llevar el viernes.',
    created_at: '2026-11-07T10:05:00-03:00',
    sender: JAVIER,
  },
  {
    id: 'msg-4',
    need_id: 'need-4',
    offer_id: 'offer-1',
    sender_id: CURRENT_USER_ID,
    receiver_id: JAVIER.id,
    message: 'Perfecto, ¿te sirve $10.000 por el fin de semana?',
    created_at: '2026-11-07T10:06:00-03:00',
    sender: CAMILA,
  },
  {
    id: 'msg-5',
    need_id: 'need-4',
    offer_id: 'offer-1',
    sender_id: JAVIER.id,
    receiver_id: CURRENT_USER_ID,
    message: 'Me sirve. ¿La dejamos reservada?',
    created_at: '2026-11-07T10:07:00-03:00',
    sender: JAVIER,
  },
];

export const MOCK_CURRENT_PUBLIC_PROFILE = CAMILA;

export function getMockChatMessages(
  need: NeedWithRelations,
  other: PublicProfile,
): ChatMessageWithSender[] {
  const existing = MOCK_CHAT_MESSAGES.filter(
    (message) =>
      message.need_id === need.id &&
      (message.sender_id === other.id || message.receiver_id === other.id),
  );

  if (existing.length > 0) {
    return existing;
  }

  const isOwner = need.user_id === CURRENT_USER_ID;
  const openingMessage = isOwner
    ? `Hola, vi tu pedido "${need.title}". Tengo algo que puede servirte y podemos coordinarlo esta semana.`
    : `Hola, vi tu oferta para mi pedido "${need.title}". Me interesa, ¿podemos coordinar los detalles?`;
  const replyMessage = isOwner
    ? '¡Hola! Gracias por escribir. ¿Me cuentas las condiciones y horarios?'
    : '¡Hola! Claro, te cuento: está disponible y puedo coordinar entrega y retiro.';
  const followUpMessage = isOwner
    ? 'Perfecto, te dejo los detalles por acá. Podemos coordinar entrega y retiro.'
    : 'Genial, te dejo los detalles por acá. ¿Te sirve el viernes en la tarde?';

  return [
    {
      id: `mock-${need.id}-1`,
      need_id: need.id,
      offer_id: null,
      sender_id: other.id,
      receiver_id: CURRENT_USER_ID,
      message: openingMessage,
      created_at: '2026-11-07T10:02:00-03:00',
      sender: other,
    },
    {
      id: `mock-${need.id}-2`,
      need_id: need.id,
      offer_id: null,
      sender_id: CURRENT_USER_ID,
      receiver_id: other.id,
      message: replyMessage,
      created_at: '2026-11-07T10:04:00-03:00',
      sender: MOCK_CURRENT_PUBLIC_PROFILE,
    },
    {
      id: `mock-${need.id}-3`,
      need_id: need.id,
      offer_id: null,
      sender_id: other.id,
      receiver_id: CURRENT_USER_ID,
      message: followUpMessage,
      created_at: '2026-11-07T10:06:00-03:00',
      sender: other,
    },
  ];
}

export const MOCK_PROFILE_STATS: ProfileStats = {
  needs: 3,
  offers: 7,
  matches: 5,
};

export const MOCK_QUICK_REPLIES = [
  'Sí, me sirve',
  '¿Incluye el envío?',
  '¿Podemos coordinar por acá?',
];
