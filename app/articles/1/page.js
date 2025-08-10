import ArticleLayout from '@/components/ArticleLayout';

const article = {
  id: '1',
  title: "Understanding Children's Drawings",
  description: "Learn to interpret psychological meaning in children's drawings",
  category: "Psychology",
  readTime: "5 min",
  image: "/images/article1.jpg",
  createdAt: "2023-10-15T09:30:00Z",
  keywords: ["child psychology", "drawing interpretation", "emotional development"],
  content: [
    {
      type: "paragraph",
      text: "Children's drawings are powerful tools for understanding their emotional world and cognitive development. These visual expressions often reveal more than words can convey, offering insights into their thoughts, fears, and joys."
    },
    {
      type: "heading",
      text: "Decoding Common Symbols"
    },
    {
      type: "list",
      items: [
        "Family members: Size and placement indicate perceived importance",
        "Animals: Often represent friends or aspects of themselves",
        "Weather: Can reflect emotional states (sunny vs stormy)",
        "Colors: Bright colors typically indicate positivity, while darker shades may signal distress"
      ]
    }
  ],
  tips: [
    "Look for patterns over time rather than interpreting single drawings",
    "Ask open-ended questions like 'Tell me about your picture'",
    "Note the pressure of pencil strokes - heavy pressure may indicate strong emotions"
  ]
};

export default function ArticlePage() {
  return <ArticleLayout article={article} />;
}


