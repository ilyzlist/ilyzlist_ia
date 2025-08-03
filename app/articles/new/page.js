// app/articles/new/page.js
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addArticle } from '@/data/articles';
import { PsychologyIcon, ChildFriendlyIcon, ArticleIcon } from "@mui/icons-material";

export default function NewArticlePage() {
  const router = useRouter();
  const [article, setArticle] = useState({
    title: '',
    description: '',
    category: 'Psychology',
    readTime: '',
    image: '',
    content: [{ type: 'paragraph', text: '' }],
    tips: ['']
  });

  const handleContentChange = (index, field, value) => {
    const newContent = [...article.content];
    newContent[index][field] = value;
    setArticle({ ...article, content: newContent });
  };

  const handleTipChange = (index, value) => {
    const newTips = [...article.tips];
    newTips[index] = value;
    setArticle({ ...article, tips: newTips });
  };

  const addContentSection = (type) => {
    setArticle({
      ...article,
      content: [...article.content, { type, text: '', ...(type === 'list' ? { items: [''] } : {}) }]
    });
  };

  const addTip = () => {
    setArticle({ ...article, tips: [...article.tips, ''] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newArticle = addArticle(article);
    router.push(`/articles/${newArticle.id}`);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold text-[#3742D1] mb-6">Create New Article</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[#3742D1] mb-2">Title</label>
          <input
            type="text"
            value={article.title}
            onChange={(e) => setArticle({...article, title: e.target.value})}
            className="w-full p-3 border border-[#ECF1FF] rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-[#3742D1] mb-2">Description</label>
          <textarea
            value={article.description}
            onChange={(e) => setArticle({...article, description: e.target.value})}
            className="w-full p-3 border border-[#ECF1FF] rounded-lg"
            rows="3"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[#3742D1] mb-2">Category</label>
            <select
              value={article.category}
              onChange={(e) => setArticle({...article, category: e.target.value})}
              className="w-full p-3 border border-[#ECF1FF] rounded-lg"
            >
              <option value="Psychology">Psychology</option>
              <option value="Development">Development</option>
            </select>
          </div>
          <div>
            <label className="block text-[#3742D1] mb-2">Read Time</label>
            <input
              type="text"
              value={article.readTime}
              onChange={(e) => setArticle({...article, readTime: e.target.value})}
              className="w-full p-3 border border-[#ECF1FF] rounded-lg"
              placeholder="e.g. 5 min"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[#3742D1] mb-2">Image URL</label>
          <input
            type="text"
            value={article.image}
            onChange={(e) => setArticle({...article, image: e.target.value})}
            className="w-full p-3 border border-[#ECF1FF] rounded-lg"
            placeholder="/images/example.jpg"
          />
        </div>

        <div>
          <label className="block text-[#3742D1] mb-2">Content</label>
          <div className="space-y-4">
            {article.content.map((section, index) => (
              <div key={index} className="border border-[#ECF1FF] p-3 rounded-lg">
                <select
                  value={section.type}
                  onChange={(e) => handleContentChange(index, 'type', e.target.value)}
                  className="mb-2 p-2 border border-[#ECF1FF] rounded"
                >
                  <option value="paragraph">Paragraph</option>
                  <option value="heading">Heading</option>
                  <option value="list">List</option>
                </select>

                {section.type === 'list' ? (
                  <div className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <input
                        key={itemIndex}
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const newItems = [...section.items];
                          newItems[itemIndex] = e.target.value;
                          handleContentChange(index, 'items', newItems);
                        }}
                        className="w-full p-2 border border-[#ECF1FF] rounded"
                        placeholder={`List item ${itemIndex + 1}`}
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newItems = [...section.items, ''];
                        handleContentChange(index, 'items', newItems);
                      }}
                      className="text-sm text-[#3742D1] mt-2"
                    >
                      + Add List Item
                    </button>
                  </div>
                ) : (
                  <textarea
                    value={section.text}
                    onChange={(e) => handleContentChange(index, 'text', e.target.value)}
                    className="w-full p-2 border border-[#ECF1FF] rounded"
                    rows={section.type === 'paragraph' ? 3 : 1}
                    required
                  />
                )}
              </div>
            ))}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => addContentSection('paragraph')}
                className="px-3 py-1 bg-[#ECF1FF] text-[#3742D1] rounded"
              >
                Add Paragraph
              </button>
              <button
                type="button"
                onClick={() => addContentSection('heading')}
                className="px-3 py-1 bg-[#ECF1FF] text-[#3742D1] rounded"
              >
                Add Heading
              </button>
              <button
                type="button"
                onClick={() => addContentSection('list')}
                className="px-3 py-1 bg-[#ECF1FF] text-[#3742D1] rounded"
              >
                Add List
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[#3742D1] mb-2">Key Takeaways</label>
          <div className="space-y-2">
            {article.tips.map((tip, index) => (
              <input
                key={index}
                type="text"
                value={tip}
                onChange={(e) => handleTipChange(index, e.target.value)}
                className="w-full p-2 border border-[#ECF1FF] rounded"
                placeholder={`Tip ${index + 1}`}
              />
            ))}
            <button
              type="button"
              onClick={addTip}
              className="text-sm text-[#3742D1] mt-2"
            >
              + Add Tip
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push('/practical-guide')}
            className="px-4 py-2 border border-[#3742D1] text-[#3742D1] rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#3742D1] text-white rounded-lg hover:bg-[#2a36c7]"
          >
            Publish Article
          </button>
        </div>
      </form>
    </div>
  );
}
