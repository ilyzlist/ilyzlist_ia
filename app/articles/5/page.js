import ArticleLayout from '@/components/ArticleLayout';

const article = {
  id: '5',
  title: "Art Therapy Techniques for Children",
  description: "How therapeutic art activities can help children process emotions",
  category: "Psychology",
  readTime: "9 min",
  image: "/images/article5.jpg",
  createdAt: "2023-11-20T10:10:00Z",
  keywords: ["art therapy", "emotional healing", "child counseling"],
  content: [
    {
      type: "paragraph",
      text: "Art therapy provides children with a non-verbal way to express complex feelings and experiences. These techniques are particularly valuable for children who struggle to articulate their emotions verbally."
    },
    {
      type: "heading",
      text: "Effective Methods"
    },
    {
      type: "list",
      items: [
        "Feelings collage: Creating visual representations of emotions",
        "Clay work: For sensory processing and emotional release",
        "Mandala drawing: Promoting relaxation and focus",
        "Family drawings: Revealing family dynamics and relationships"
      ]
    },
    {
      type: "paragraph",
      text: "Art therapy should be conducted by trained professionals, but parents can adapt some principles for home use."
    }
  ],
  tips: [
    "Never interpret a child's art without their input",
    "Focus on the child's experience, not artistic quality",
    "Use open-ended prompts like 'Draw a safe place'",
    "Maintain a non-judgmental attitude throughout"
  ]
};

export default function ArticlePage() {

  return <ArticleLayout article={article} />;
}

