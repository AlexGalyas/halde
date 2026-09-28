// All site copy in one place. Hero, form, mechanism and atmosphere texts come from the brief;
// part captions, material captions, detail chips, specs and price are drafts to confirm.

// Sections in page order — drives the header nav and the side progress rail.
export const sections = [
  { id: 'hero', label: 'Nord 01' },
  { id: 'form', label: 'Форма' },
  { id: 'mechanism', label: 'Механізм' },
  { id: 'parts', label: 'Деталі' },
  { id: 'materials', label: 'Матеріали' },
  { id: 'atmosphere', label: 'Майстерня' },
  { id: 'order', label: 'Замовлення' },
] as const;

export const hero = {
  title: 'Час, зібраний руками',
  lead: 'Nord 01. Одна модель. Сорок дві операції, кожна з яких виконана вручну в майстерні на схилі гори.',
  cta: 'Дізнатися більше',
  scrollHint: 'Гортайте',
};

export const form = {
  eyebrow: 'Форма',
  dims: [
    { value: '39', unit: 'мм', label: 'діаметр' },
    { value: '9,8', unit: 'мм', label: 'товщина' },
    { value: '47,5', unit: 'мм', label: 'від вушка до вушка' },
  ],
  title: '9,8 мм.',
  text: 'Ми прибирали товщину доти, доки годинник не перестав відчуватися на руці. Корпус із шліфованої сталі, безель полірований, аби ловити світло лише на грані.',
};

export const mechanism = {
  eyebrow: 'Механізм',
  stats: [
    { value: '168', label: 'деталей' },
    { value: '21', label: 'камінь' },
    { value: '60', label: 'годин запасу ходу' },
    { value: '3', label: 'Гц, 21 600 пів./год' },
  ],
  title: 'Калібр H-01.',
  text: '168 деталей, 21 камінь, запас ходу 60 годин. Женевські смуги нанесені вручну, тому двох однакових механізмів не існує.',
};

export const parts = [
  { name: 'Скло', text: 'Сапфір з антиблиском: подряпину на ньому лишить хіба що алмаз.' },
  { name: 'Безель', text: 'Полірований вручну, щоб ловити світло тільки на грані.' },
  { name: 'Стрілки', text: 'Латунь, вирізана й відшліфована вручну; на цій сторінці вони показують ваш час.' },
  { name: 'Циферблат', text: 'Графіт із піскоструминною фактурою і накладні латунні мітки.' },
  { name: 'Механізм', text: 'Мости з женевськими смугами, баланс із вороненим волоском і двадцять один рубін.' },
  { name: 'Корпус із ремінцем', text: 'Шліфована сталь і шкіра рослинного дублення, що темнішає разом із вами.' },
];

export const materials = [
  {
    key: 'leather',
    image: '/images/macro-leather.webp',
    name: 'Шкіра',
    text: 'Рослинного дублення, з ручною прострочкою: з роками темнішає й бере форму зап’ястя.',
    chips: ['Ручна прострочка', '20 → 18 мм', 'Фарбований край'],
  },
  {
    key: 'steel',
    image: '/images/macro-steel.webp',
    name: 'Сталь',
    text: 'Шліфуємо вздовж вушок, а грані полірує рука, не верстат.',
    chips: ['Шліфовані площини', 'Поліровані фаски', 'Сталь 316L'],
  },
  {
    key: 'sapphire',
    image: '/images/macro-sapphire.webp',
    name: 'Сапфір',
    text: 'Антиблискове покриття: циферблат читається під будь-яким кутом.',
    chips: ['Антиблиск', 'Спереду й ззаду', '9 за Моосом'],
  },
];

export const atmosphere = {
  eyebrow: 'Майстерня',
  text: 'Ми збираємо його там, де час іде повільніше.',
};

export const specs = [
  { label: 'Діаметр', value: '39 мм' },
  { label: 'Товщина', value: '9,8 мм' },
  { label: 'Калібр', value: 'H-01, ручний завод' },
  { label: 'Запас ходу', value: '60 годин' },
  { label: 'Частота', value: '21 600 пів./год' },
  { label: 'Деталі', value: '168 · 21 камінь' },
  { label: 'Скло', value: 'Сапфір з обох боків' },
  { label: 'Ремінець', value: 'Шкіра, 20 мм, латунна пряжка' },
];

export const order = {
  eyebrow: 'Специфікації',
  title: 'Nord 01',
  price: '96 000 ₴',
  note: 'Кожен примірник збирається під замовлення.',
  cta: 'Замовити примірку',
};
