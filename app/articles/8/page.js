import ArticleLayout from '@/components/ArticleLayout';

const article = {
  id: '8',
  title: "Art as Communication for Non-Verbal Children",
  description: "Using creative expression to understand non-verbal children",
  category: "Psychology",
  readTime: "6 min",
  image: "/images/article8.jpg",
  createdAt: "2023-12-05T11:45:00Z",
  keywords: ["non-verbal", "art communication", "special needs"],
  content: [
    {
      type: "paragraph",
      text: "For children with limited verbal skills, art becomes a vital communication channel. Their drawings and creations can reveal thoughts, feelings, and experiences they cannot yet express through words."
    },
    {
      type: "heading",
      text: "Effective Strategies"
    },
    {
      type: "list",
      items: [
        "Use consistent materials to build comfort",
        "Create a predictable art routine",
        "Focus on the process rather than questioning the product",
        "Document changes over time to identify patterns"
      ]
    },
    {
      type: "paragraph",
      text: "Art can serve as a bridge to communication and emotional expression for children across the autism spectrum and with various communication challenges."
    }
  ],
  tips: [
    "Pair art with simple verbal labeling",
    "Use art to prepare for transitions or new experiences",
    "Respect the child's need to not share certain creations",
    "Work with therapists to interpret artwork appropriately"
  ]
};

export default function ArticlePage() {

  return <ArticleLayout article={article} />;
}

