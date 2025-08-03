import ArticleLayout from '@/components/ArticleLayout';

const article = {
  id: '3',
  title: "The Psychology of Color in Children's Art",
  description: "What color choices reveal about a child's emotions and personality",
  category: "Psychology",
  readTime: "6 min",
  image: "/images/color-psychology-children.jpg",
  createdAt: "2023-11-05T11:20:00Z",
  keywords: ["color meaning", "emotional expression", "art therapy"],
  content: [
    {
      type: "paragraph",
      text: "Children's color preferences in artwork can provide important clues about their emotional state and personality traits. While individual differences exist, some general patterns emerge across developmental stages."
    },
    {
      type: "heading",
      text: "Common Color Associations"
    },
    {
      type: "list",
      items: [
        "Red: Energy, strong emotions, or excitement (can also indicate anger)",
        "Blue: Calmness, contentment, and security",
        "Yellow: Happiness, creativity, and optimism",
        "Black: Power or control (in excess may indicate emotional distress)"
      ]
    },
    {
      type: "paragraph",
      text: "Remember that cultural influences and personal preferences also play significant roles in color choice."
    }
  ],
  tips: [
    "Observe color choices over time rather than in isolation",
    "Provide a variety of colors to allow full expression",
    "Note changes in color preferences that might reflect mood changes",
    "Avoid jumping to conclusions based on single color choices"
  ]
};

export default function ArticlePage() {

  return <ArticleLayout article={article} />;
}

