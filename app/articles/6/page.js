import ArticleLayout from '@/components/ArticleLayout';

const article = {
  id: '6',
  title: "Digital Art vs Traditional Media",
  description: "Balancing screen-based and hands-on art experiences",
  category: "Development",
  readTime: "7 min",
  image: "/images/article6.jpg",
  createdAt: "2023-11-25T13:30:00Z",
  keywords: ["digital art", "traditional media", "technology balance"],
  content: [
    {
      type: "paragraph",
      text: "In our digital age, children need exposure to both traditional and digital art mediums. Each offers unique developmental benefits that contribute to different aspects of cognitive and motor skill development."
    },
    {
      type: "heading",
      text: "Comparative Benefits"
    },
    {
      type: "list",
      items: [
        "Traditional media: Develops fine motor skills and sensory processing",
        "Digital tools: Enhances technological literacy and undo-function reduces frustration",
        "Mixed approach: Combines tactile experience with digital enhancement"
      ]
    },
    {
      type: "paragraph",
      text: "A balanced approach helps children develop a full range of creative and technical skills."
    }
  ],
  tips: [
    "Limit screen time based on age recommendations",
    "Choose apps with open-ended creativity",
    "Always provide traditional art materials as well",
    "Supervise young children's digital art activities"
  ]
};

export default function ArticlePage() {

  return <ArticleLayout article={article} />;
}

