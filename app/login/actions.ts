'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    const message = error.message.includes('Invalid login credentials')
      ? 'Invalid email or password. Please try again.'
      : error.message;
    throw new Error(message)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    let message = error.message;
    if (message.includes('already registered')) {
      message = 'An account with this email already exists. Try logging in instead.';
    } else if (message.includes('Password should')) {
      message = 'Password must be at least 6 characters long.';
    } else if (message.includes('valid email')) {
      message = 'Please enter a valid email address.';
    }
    throw new Error(message)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signInWithOtp(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    const message = error.message.includes('rate limit')
      ? 'Too many attempts. Please wait a few minutes before trying again.'
      : error.message;
    throw new Error(message)
  }

  return { success: true }
}
