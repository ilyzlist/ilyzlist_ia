// app/auth/callback/route.js

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${requestUrl.origin}/login?error=no_code`)
  }

  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  try {
    console.log('[Auth] Tentative d\'échange du code contre une session...')
    await new Promise(resolve => setTimeout(resolve, 1000))

    const {
      data: { session },
      error: authError,
    } = await supabase.auth.exchangeCodeForSession(code)

    if (authError) {
      console.error('[Auth] Échec échange de session:', authError.message)
      throw authError
    }

    // 🔍 Reconfirme l'utilisateur après échange de session
    const {
      data: { user },
      error: getUserError
    } = await supabase.auth.getUser()

    if (getUserError) {
      console.error('[Auth] Erreur getUser():', getUserError.message)
      throw getUserError
    }

    if (!user?.id) {
      throw new Error('Utilisateur introuvable après getUser()')
    }

    const userId = user.id
    console.log('[Auth] Utilisateur confirmé :', userId)

    // 🔍 Vérifie existence du profil
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.warn('[Supabase] Erreur récupération du profil :', fetchError.message)
    }

    if (!existingProfile) {
      console.log('[Supabase] Aucun profil trouvé — création...')

      let stripeCustomerId = null

      if (user.app_metadata?.provider === 'google') {
        const res = await fetch(`${requestUrl.origin}/api/create-stripe-customer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, email: user.email }),
        })

        if (!res.ok) throw new Error('Création client Stripe échouée')
        const { customerId } = await res.json()
        stripeCustomerId = customerId
      }

      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: user.email,
          stripe_customer_id: stripeCustomerId,
          analysis_quota: 1,
          subscription_plan: 'free',
          current_plan: 'Free Tier',
          analysis_limit: 1,
          created_at: new Date().toISOString(),
        })

      if (upsertError) {
        console.error('[Supabase] Échec création profil :', upsertError.message)
        throw upsertError
      }

      console.log('[Supabase] Profil créé avec succès')
    } else {
      console.log('[Supabase] Profil déjà existant')
    }

    return NextResponse.redirect(`${requestUrl.origin}/`)
  } catch (err) {
    console.error('[Callback] Erreur :', err.message)
    if (err.message.toLowerCase().includes('rate limit')) {
      await new Promise(resolve => setTimeout(resolve, 5000))
      return NextResponse.redirect(`${requestUrl.origin}/login?error=rate_limit`)
    }

    return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(err.message)}`)
  }
}
