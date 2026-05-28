import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    category: 'acoustic',
    title: 'Акустическая гитара Yamaha F310',
    price: 17900,
    old_price: null,
    rating: 4.8,
    reviews: 256,
    badge: null,
    emoji: '🎸',
    brand: 'Yamaha',
    specs: {
      'Тип': 'Акустическая дредноут',
      'Верхняя дека': 'Ель',
      'Нижняя дека': 'Меранти',
      'Гриф': 'Нато',
      'Мензура': '634 мм',
      'Струны': '6 струн, металл'
    },
    description: 'Классическая акустическая гитара для начинающих и любителей. Отличное сбалансированное звучание, мягкий гриф и высочайшая надежность сборки от легендарной компании Yamaha.',
    image_class: 'bg-gradient-to-br from-amber-50 to-orange-100'
  },
  {
    id: 2,
    category: 'acoustic',
    title: 'Акустическая гитара Fender CD-60S',
    price: 28900,
    old_price: 32900,
    rating: 4.7,
    reviews: 189,
    badge: 'sale',
    emoji: '🎸',
    brand: 'Fender',
    specs: {
      'Тип': 'Акустическая дредноут',
      'Верхняя дека': 'Массив ели',
      'Нижняя дека': 'Красное дерево (Mahogany)',
      'Гриф': 'Красное дерево, удобный профиль Easy-to-Play',
      'Мензура': '643 мм',
      'Лады': '20'
    },
    description: 'Один из самых популярных инструментов бренда Fender. За счет верхней деки из цельного массива ели выдает чистый звуковой резонанс, глубокий бас и кристальные высокие частоты.',
    image_class: 'bg-gradient-to-br from-amber-100 to-amber-200'
  },
  {
    id: 3,
    category: 'electric',
    title: 'Электрогитара Fender Player Stratocaster',
    price: 89900,
    old_price: null,
    rating: 4.9,
    reviews: 412,
    badge: 'new',
    emoji: '🎸⚡',
    brand: 'Fender',
    specs: {
      'Тип корпуса': 'Stratocaster',
      'Звукосниматели': '3 сингла (S-S-S) Player Series Alnico 5',
      'Гриф': 'Клен (Maple), профиль Modern C',
      'Накладка': 'Пау Ферро',
      'Лады': '22 Medium Jumbo',
      'Крепление': 'На болтах'
    },
    description: 'Легендарное яркое стекло стратокастера. Модель серии Player предлагает классический винтажный дизайн с современными доработками для выступлений и студийной работы.',
    image_class: 'bg-gradient-to-br from-blue-50 to-indigo-100'
  },
  {
    id: 4,
    category: 'electric',
    title: 'Электрогитара Gibson Les Paul Studio',
    price: 159000,
    old_price: 179000,
    rating: 4.8,
    reviews: 298,
    badge: 'sale',
    emoji: '🎸🔥',
    brand: 'Gibson',
    specs: {
      'Тип корпуса': 'Les Paul',
      'Звукосниматели': '2 хамбакера 490R & 498T',
      'Корпус': 'Красное дерево с кленовым топом',
      'Гриф': 'Красное дерево, профиль Slim Taper',
      'Накладка': 'Палисандр',
      'Лады': '22 ультра-низких'
    },
    description: 'Инструмент великих рок-музыкантов. Мощнейший жирный сустейн, потрясающая читаемость в миксе и классическое премиальное качество инструментов ручной сборки в США.',
    image_class: 'bg-gradient-to-br from-red-50 to-orange-100'
  },
  {
    id: 5,
    category: 'electric',
    title: 'Электрогитара Ibanez RG550 Genesis',
    price: 74900,
    old_price: null,
    rating: 4.6,
    reviews: 167,
    badge: null,
    emoji: '🎸',
    brand: 'Ibanez',
    specs: {
      'Тип корпуса': 'Superstrat',
      'Звукосниматели': 'H-S-H (V7, S1, V8)',
      'Гриф': 'Super Wizard из 5 кусков клена/ореха',
      'Тремоло': 'Edge double-locking tremolo bridge',
      'Лады': '24 Jumbo',
      'Производство': 'Япония'
    },
    description: 'Культовый японский инструмент для шреддеров и виртуозов. Тончайший сверхскоростной гриф и превосходная стабильность строя благодаря профессиональной системе Edge Tremolo.',
    image_class: 'bg-gradient-to-br from-yellow-50 to-amber-100'
  },
  {
    id: 6,
    category: 'bass',
    title: 'Бас-гитара Fender Precision Bass',
    price: 105000,
    old_price: 120000,
    rating: 4.9,
    reviews: 134,
    badge: 'sale',
    emoji: '🎸🎵',
    brand: 'Fender',
    specs: {
      'Тип': 'Сплит-сингл бас',
      'Звукосниматель': 'Player Series Alnico 5 Split Single-Coil',
      'Гриф': 'Клен, Modern C',
      'Мензура': '864 мм (34 дюйма)',
      'Струны': '4 струны',
      'Управление': '1 громкость, 1 тон'
    },
    description: 'Эталон басового звука во всем мире, сформировавший современную музыку. Плотная, пробивная середина и непревзойденный читаемый низкочастотный фундамент.',
    image_class: 'bg-gradient-to-br from-purple-50 to-indigo-100'
  },
  {
    id: 7,
    category: 'bass',
    title: 'Бас-гитара Ibanez SR300E',
    price: 35900,
    old_price: null,
    rating: 4.5,
    reviews: 98,
    badge: null,
    emoji: '🎸',
    brand: 'Ibanez',
    specs: {
      'Электроника': 'Активный 3-полосный EQ с переключателем Power Tap',
      'Звукосниматели': 'Пассивные PowerSpan Dual Coil',
      'Корпус': 'Ньято',
      'Гриф': '5 кусков клена/ореха, на болтах',
      'Количество струн': '4 струны'
    },
    description: 'Прекрасный активный бас для многожанровых исполнителей. Сбалансированный тонкий корпус, удобный гриф и гибкие настройки электроники позволяют нарулить абсолютно любой звук.',
    image_class: 'bg-gradient-to-br from-emerald-50 to-teal-100'
  },
  {
    id: 8,
    category: 'ukulele',
    title: 'Укулеле Kala KA-15S',
    price: 5900,
    old_price: null,
    rating: 4.7,
    reviews: 320,
    badge: null,
    emoji: '🪕',
    brand: 'Kala',
    specs: {
      'Размер': 'Сопрано (Soprano)',
      'Материал корпуса': 'Красное дерево (Mahogany)',
      'Струны': 'Aquila Super Nylgut',
      'Лады': '12 ладов'
    },
    description: 'Самое популярное сопрано-укулеле в мире. Идеальное соотношение чистоты звука, прочности материалов и приятной гавайской аутентичности.',
    image_class: 'bg-gradient-to-br from-yellow-50 to-orange-100'
  },
  {
    id: 9,
    category: 'ukulele',
    title: 'Укулеле концертное Lanikai LU-21C',
    price: 8900,
    old_price: 10900,
    rating: 4.4,
    reviews: 87,
    badge: 'sale',
    emoji: '🪕',
    brand: 'Lanikai',
    specs: {
      'Размер': 'Концертное (Concert)',
      'Материал': 'Нато (Nato)',
      'Накладка грифа': 'Палисандр',
      'Колки': 'Хромированные литые'
    },
    description: 'Концертная версия укулеле с увеличенной мензурой и расширенным диапазоном. Имеет глубокое обертонистое звучание и мягкое скольжение пальцев по грифу.',
    image_class: 'bg-gradient-to-br from-orange-50 to-orange-100'
  },
  {
    id: 10,
    category: 'accessory',
    title: "Струны для акустической гитары D'Addario EJ16",
    price: 890,
    old_price: null,
    rating: 4.9,
    reviews: 1500,
    badge: null,
    emoji: '🧵',
    brand: "D'Addario",
    specs: {
      'Материал': 'Фосфорная бронза (Phosphor Bronze)',
      'Калибр': '12-53 Light',
      'Натяжение': 'Сбалансированное',
      'Защитное покрытие': 'Магнитное запечатывание'
    },
    description: 'Профессиональные струны с теплым ярким тоном и долгим сустейном. Самый популярный выбор гитаристов по всему миру.',
    image_class: 'bg-gradient-to-br from-teal-50 to-teal-100'
  },
  {
    id: 11,
    category: 'accessory',
    title: 'Чехол для электрогитары Gator Cases GBE-ELECT',
    price: 4500,
    old_price: 5500,
    rating: 4.6,
    reviews: 203,
    badge: 'sale',
    emoji: '🧳',
    brand: 'Gator',
    specs: {
      'Материал': 'Нейлон плотностью 600 Den',
      'Защитный слой': '20 мм вспененный полиуретан',
      'Карманы': 'Большой внешний карман для аксессуаров'
    },
    description: 'Надежный влагоотталкивающий чехол для электрогитары. Идеален для ежедневной транспортировки инструмента в метро или машине при любой погоде.',
    image_class: 'bg-gradient-to-br from-slate-50 to-slate-200'
  },
  {
    id: 12,
    category: 'accessory',
    title: 'Тюнер хроматический Korg GA-50',
    price: 1500,
    old_price: null,
    rating: 4.8,
    reviews: 670,
    badge: null,
    emoji: '🎛️',
    brand: 'Korg',
    specs: {
      'Режимы настройки': 'Гитара, Бас, Хроматический',
      'Точность': '±1 цент',
      'Питание': '2 батарейки типа AAA',
      'Разъемы': 'Вход 1/4" Jack, Выход 1/4" Jack'
    },
    description: 'Карманный высокоточный тюнер с огромным ЖК-дисплеем и индикацией названия струны. Идеальное решение в жестких концертных условиях.',
    image_class: 'bg-gradient-to-br from-cyan-50 to-cyan-100'
  },
  {
    id: 13,
    category: 'acoustic',
    title: 'Акустическая гитара Cort AD810 OP',
    price: 13400,
    old_price: null,
    rating: 4.5,
    reviews: 145,
    badge: null,
    emoji: '🎸',
    brand: 'Cort',
    specs: {
      'Тип деки': 'Дредноут (Dreadnought)',
      'Верхняя дека': 'Ель (Spruce)',
      'Задняя дека': 'Красное дерево (Mahogany)',
      'Покрытие': 'Матовое Open Pore (дышащее лаковое покрытие)'
    },
    description: 'Лучшая гитара в бюджетном сегменте. Тончайшее матовое покрытие Open Pore позволяет деке свободно резонировать и издавать сочный, открытый и полетный саунд.',
    image_class: 'bg-gradient-to-br from-amber-50 to-stone-100'
  },
  {
    id: 14,
    category: 'electric',
    title: 'Электрогитара Squier Affinity Telecaster',
    price: 29900,
    old_price: 34900,
    rating: 4.4,
    reviews: 210,
    badge: 'sale',
    emoji: '🎸',
    brand: 'Squier',
    specs: {
      'Тип корпуса': 'Telecaster',
      'Звукосниматели': '2 сингла Ceramic Single-Coil Tele',
      'Корпус': 'Тополь',
      'Гриф': 'Клен, C-shape',
      'Лады': '21 Narrow Tall'
    },
    description: 'Легендарное "тванговое" телекастеровское звучание от дочернего бренда Fender по максимально доступным ценам. Настоящий минималистичный рок-н-рольный инструмент.',
    image_class: 'bg-gradient-to-br from-zinc-50 to-stone-200'
  },
  {
    id: 15,
    category: 'bass',
    title: 'Бас-гитара Yamaha TRBX174',
    price: 25900,
    old_price: null,
    rating: 4.3,
    reviews: 76,
    badge: null,
    emoji: '🎸',
    brand: 'Yamaha',
    specs: {
      'Конфигурация датчиков': 'P/J (Split Single-Coil + Single-Coil)',
      'Корпус': 'Ольха или Красное дерево',
      'Гриф': 'Клен, крепление на болтах',
      'Мензура': '863 мм, гриф 24 лада'
    },
    description: 'Отличный пассивный универсальный бас от Yamaha. Позволяет получить как классический глубокий плотный звук датчика Precision, так и яркий кусачий джазовый тон датчика Jazz Bass.',
    image_class: 'bg-gradient-to-br from-blue-50 to-indigo-50'
  },
  {
    id: 16,
    category: 'accessory',
    title: 'Каподастр Planet Waves PW-CP-07',
    price: 1200,
    old_price: 1600,
    rating: 4.7,
    reviews: 430,
    badge: 'sale',
    emoji: '🔧',
    brand: 'Planet Waves',
    specs: {
      'Тип': 'Рычажный с регулировкой силы натяжения',
      'Материал': 'Авиационный алюминий легкого веса',
      'Совместимость': 'Акустические и электрогитары с радиусной накладкой грифа'
    },
    description: 'Запатентованный каподастр с точной регулировкой зажима винтом. Исключает дребезжание струн и фальшивые ноты при транспортировании строя.',
    image_class: 'bg-gradient-to-br from-gray-50 to-neutral-200'
  }
];
