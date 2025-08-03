import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  try {
    const user = await User.findById(userId)
      .select('analysisHistory emotionalScores')
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      history: user.analysisHistory.reverse(), // Newest first
      emotionalTrends: calculateTrends(user.emotionalScores)
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

function calculateTrends(scoresArray) {
  const trends = {};
  const dimensions = ['happiness', 'anxiety', 'confidence', 'social'];
  
  dimensions.forEach(dim => {
    if (scoresArray.length > 1) {
      const first = scoresArray[0][dim];
      const last = scoresArray[scoresArray.length - 1][dim];
      trends[dim] = {
        change: ((last - first) / first * 100).toFixed(1),
        direction: last > first ? 'up' : last < first ? 'down' : 'stable'
      };
    }
  });
  
  return trends;
}
