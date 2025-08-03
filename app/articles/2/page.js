import ArticleLayout from '@/components/ArticleLayout';

const article = {
  id: '2',
  title: "Developmental Stages of Drawing",
  description: "Learn about the natural progression of children's artistic skills",
  category: "Development",
  readTime: "7 min",
  image: "/images/drawing-stages-development.jpg",
  createdAt: "2023-10-18T14:15:00Z",
  keywords: ["art development", "child milestones", "drawing stages"],
  content: [
    {
      type: "paragraph",
      text: "Children's drawing abilities evolve through predictable stages that mirror their cognitive and motor development. Understanding these phases helps parents support their child's growth without unrealistic expectations."
    },
    {
      type: "heading",
      text: "Key Developmental Milestones"
    },
    {
      type: "list",
      items: [
        "Scribbling Stage (1-2 years): Random marks, exploring cause and effect",
        "Pre-schematic Stage (3-4 years): First attempts at human figures ('tadpole people')",
        "Schematic Stage (5-6 years): More detailed figures, baseline drawings",
        "Realistic Stage (9+ years): Perspective, details, and realism emerge"
      ]
    },
    {
      type: "paragraph",
      text: "Each child progresses at their own pace, and these stages should be used as general guidelines rather than strict expectations."
    }
  ],
  tips: [
    "Provide appropriate materials for each stage (large crayons for toddlers)",
    "Avoid correcting their drawings - there's no 'wrong' way to create art",
    "Display artwork at the child's eye level to show you value their creations",
    "Celebrate progress rather than focusing on technical accuracy"
  ]
};

export default function ArticlePage() {
  return <ArticleLayout article={article} />;
}

