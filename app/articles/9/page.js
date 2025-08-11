import ArticleLayout from '@/components/ArticleLayout';

const article = {
  id: '2',
  title: 'Developmental Stages of Drawing',
  description: 'What typical drawing milestones look like from scribbles to scenes.',
  category: 'Development',
  readTime: '7 min',
  image: "/images/article9.jpg",
  createdAt: '2024-09-12T10:00:00Z',
  keywords: ['milestones', 'fine motor skills', 'ages and stages'],
  content: [
    { type: 'paragraph', text: 'Children’s drawing skills progress through predictable phases that mirror brain and motor development. Knowing what’s typical helps set healthy expectations and celebrate growth.' },
    { type: 'heading', text: 'Common Milestones' },
    { type: 'list', items: [
      'Scribbling (1–2 yrs): Random marks; joy of motion.',
      'Pre-schematic (3–4 yrs): Tadpole people; big heads.',
      'Schematic (5–6 yrs): Baseline/skyline; consistent symbols.',
      'Transitional (7–8 yrs): Overlaps, depth hints, details.',
      'Realistic (9+ yrs): Perspective, proportion, shading.'
    ]},
    { type: 'heading', text: 'What Parents Can Watch For' },
    { type: 'list', items: [
      'Grip and control improving over months, not days.',
      'Increasing symbol consistency (e.g., how a house is drawn).',
      'Willingness to revise or add details.'
    ]}
  ],
  tips: [
    'Offer chunky crayons early; add thinner tools as control improves.',
    'Keep a dated folder—progress over time is the insight.',
    'Praise effort (“You tried a new shape!”) over results.'
  ]
};

export default function ArticlePage() { return <ArticleLayout article={article} />; }
