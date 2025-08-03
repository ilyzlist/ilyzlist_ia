export default function EmotionGauges({ scores }) {
  if (!scores) return null;

  const emotions = [
    { name: 'happiness', color: 'bg-green-400', label: 'Happiness' },
    { name: 'confidence', color: 'bg-blue-400', label: 'Confidence' },
    { name: 'social', color: 'bg-yellow-400', label: 'Social' },
    { name: 'anxiety', color: 'bg-red-400', label: 'Anxiety' }
  ];

  return (
    <div className="space-y-3">
      {emotions.map((emotion) => (
        <div key={emotion.name}>
          <div className="flex justify-between text-sm mb-1">
            <span>{emotion.label}</span>
            <span>{scores[emotion.name] || 5}/10</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`${emotion.color} h-2.5 rounded-full`}
              style={{ width: `${(scores[emotion.name] || 5) * 10}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
