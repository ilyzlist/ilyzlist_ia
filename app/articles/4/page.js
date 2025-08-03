import ArticleLayout from '@/components/ArticleLayout';

const article = {
  id: '4',
  title: "Encouraging Creative Expression",
  description: "Practical strategies to nurture your child's artistic development",
  category: "Development",
  readTime: "8 min",
  image: "/images/creative-expression-kids.jpg",
  createdAt: "2023-11-12T16:45:00Z",
  keywords: ["creativity", "art education", "child development"],
  content: [
    {
      type: "paragraph",
      text: "Fostering creativity in children requires a delicate balance between providing guidance and allowing freedom. The healthiest artistic development occurs when children feel safe to explore without judgment."
    },
    {
      type: "heading",
      text: "Effective Approaches"
    },
    {
      type: "list",
      items: [
        "Process over product: Focus on the experience, not the result",
        "Open-ended materials: Provide diverse art supplies",
        "Display without judgment: Ask 'Tell me about your picture' rather than 'What is it?'",
        "Creative environment: Dedicate a space for artistic exploration"
      ]
    },
    {
      type: "paragraph",
      text: "Children who feel free to experiment creatively often develop better problem-solving skills and greater confidence in their abilities."
    }
  ],
  tips: [
    "Rotate art materials to maintain interest",
    "Join in occasionally to model creative thinking",
    "Avoid coloring books which limit creativity",
    "Praise effort and originality rather than technical skill"
  ]
};

export default function ArticlePage() {

  return <ArticleLayout article={article} />;
}

