import { useEffect, useState } from 'react';
import EmotionGauges from './EmotionGauges';

export default function HistoryComparison({ userId }) {
  const [history, setHistory] = useState([]);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/analysis-history?userId=${userId}`);
        const data = await res.json();
        setHistory(data.history);
        setTrends(data.emotionalTrends);
      } catch (error) {
        console.error('Failed to load history:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [userId]);

  if (loading) return <div>Loading history...</div>;

  return (
    <div className="history-comparison">
      <h2>Analysis History</h2>
      
      {trends && (
        <div className="trends-section">
          <h3>Emotional Trends</h3>
          <div className="trend-grid">
            {Object.entries(trends).map(([emotion, trend]) => (
              <div key={emotion} className={`trend-card ${trend.direction}`}>
                <span className="emotion-name">{emotion}</span>
                <span className="trend-value">
                  {Math.abs(trend.change)}% {trend.direction === 'up' ? '↑' : '↓'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="analysis-timeline">
        {history.map((analysis, i) => (
          <div key={i} className="analysis-card">
            <h4>{new Date(analysis.date).toLocaleDateString()}</h4>
            <p>Age: {analysis.age} years</p>
            <EmotionGauges scores={analysis.scores} compact />
            <p className="preview">{analysis.preview}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
