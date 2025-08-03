import ArticleLayout from '@/components/ArticleLayout';

const article = {
  id: '7',
  title: "Recognizing Giftedness in Children's Art",
  description: "How to identify and nurture exceptional artistic ability",
  category: "Psychology",
  readTime: "8 min",
  image: "/images/gifted-child-art.jpg",
  createdAt: "2023-12-01T15:00:00Z",
  keywords: ["artistic giftedness", "talent development", "creative children"],
  content: [
    {
      type: "paragraph",
      text: "Artistically gifted children often display characteristics that set them apart from their peers. Recognizing these traits early allows parents and educators to provide appropriate support and challenges."
    },
    {
      type: "heading",
      text: "Signs of Artistic Giftedness"
    },
    {
      type: "list",
      items: [
        "Advanced visual realism at early ages",
        "Exceptional attention to detail",
        "Unique perspectives or compositions",
        "Intense focus during artistic activities"
      ]
    },
    {
      type: "paragraph",
      text: "While natural talent exists, nurturing and practice are equally important for developing artistic skills."
    }
  ],
  tips: [
    "Provide high-quality materials that challenge their skills",
    "Find mentors or classes to develop their abilities",
    "Balance art with other developmental needs",
    "Avoid excessive praise that might create performance pressure"
  ]
};

export default function ArticlePage() {

  return <ArticleLayout article={article} />;
}

