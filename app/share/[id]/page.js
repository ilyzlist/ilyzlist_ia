import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { notFound, redirect } from 'next/navigation';
import AnalysisResult from '@/components/AnalysisResult';
import { calculateAge } from '@/utils/ageCalculator';

export default async function SharedAnalysisPage({ params }) {
  // First validate params exists
  if (!params?.id) return notFound();
  
  const supabase = createClientComponentClient();
  const { id } = params;

  try {
    // Fetch shared analysis
    const { data: sharedRecord, error } = await supabase
      .from('shared_analyses')
      .select(`
        id,
        expires_at,
        drawings(
          id,
          file_name,
          analysis_result,
          children(
            name,
            birth_date
          )
        )
      `)
      .eq('id', id)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !sharedRecord?.drawings) {
      return notFound();
    }

    // Check session after data fetch
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      redirect(`/drawings/analysis/${sharedRecord.drawings.id}`);
    }

    return (
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-xl font-bold mb-4">
          {sharedRecord.drawings.file_name || 'Shared Drawing Analysis'}
        </h1>
        
        <AnalysisResult
          initialData={sharedRecord.drawings.analysis_result || {}}
          childName={sharedRecord.drawings.children?.name}
          childAge={calculateAge(sharedRecord.drawings.children?.birth_date)}
        />

        <p className="mt-4 text-sm text-gray-500">
          {sharedRecord.expires_at && `Expires ${new Date(sharedRecord.expires_at).toLocaleDateString()}`}
        </p>
      </div>
    );
    
  } catch (error) {
    console.error('Shared analysis error:', error);
    return notFound();
  }
}