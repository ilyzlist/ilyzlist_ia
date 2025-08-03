// app/api/admin/reset-quotas/route.js
import { NextResponse } from 'next/server';
import { resetMonthlyQuotas } from '@/utils/resetQuotas';

export async function GET() {
  try {
    const result = await resetMonthlyQuotas();
    return NextResponse.json({ success: result });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to reset quotas' },
      { status: 500 }
    );
  }
}
