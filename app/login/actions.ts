'use server'

import { createClient } from '@supabase/supabase-js'

export async function signUpWithAutoConfirm(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const isAutoVerifEnabled = process.env.EMAIL_AUTO_VERIF === 'true'

    if (!email || !password) {
        return { error: 'Email et mot de passe requis' }
    }

    // 1. Si EMAIL_AUTO_VERIF n'est pas activé, on retourne un flag spécial
    // pour que le client utilise la méthode standard
    if (!isAutoVerifEnabled) {
        return { useStandardSignup: true }
    }

    // 2. Sinon, on utilise la clé service_role pour bypasser la vérification
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    try {
        const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true // Force la confirmation de l'email
        })

        if (error) throw error

        return { success: true }
    } catch (error: any) {
        console.error('Signup error:', error)
        return { error: error.message }
    }
}
