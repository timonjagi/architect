'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

function readableAuthError(message: string): string {
  const m = message.toLowerCase();

  if (m.includes('invalid login credentials') || m.includes('invalid email or password')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  if (m.includes('email not confirmed') || m.includes('email address not confirmed')) {
    return 'Please confirm your email address before signing in. Check your inbox for the confirmation link.';
  }
  if (m.includes('already registered') || m.includes('user already registered')) {
    return 'An account with this email already exists. Try logging in instead.';
  }
  if (m.includes('password') && m.includes('short')) {
    return 'Password must be at least 6 characters long.';
  }
  if (m.includes('password') && m.includes('weak')) {
    return 'Password is too weak. Use a mix of letters, numbers, and symbols.';
  }
  if (m.includes('valid email') || m.includes('invalid email')) {
    return 'Please enter a valid email address.';
  }
  if (m.includes('rate limit') || m.includes('too many')) {
    return 'Too many attempts. Please wait a few minutes before trying again.';
  }
  if (m.includes('token has expired') || m.includes('expired')) {
    return 'This link has expired. Please request a new one.';
  }
  if (m.includes('signup is disabled')) {
    return 'New signups are currently disabled. Please contact support.';
  }
  if (m.includes('unable to')) {
    return 'Unable to process your request. Please try again later.';
  }

  return message || 'Something went wrong. Please try again.';
}

export async function login(formData: FormData, next?: string) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  if (!data.email || !data.password) {
    throw new Error('Please enter both email and password.');
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    throw new Error(readableAuthError(error.message))
  }

  revalidatePath('/', 'layout')
  redirect(next || '/dashboard')
}

export async function signup(formData: FormData, next?: string) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  if (!data.email) {
    throw new Error('Please enter your email address.');
  }
  if (!data.password) {
    throw new Error('Please enter a password.');
  }
  if (data.password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    throw new Error(readableAuthError(error.message))
  }

  revalidatePath('/', 'layout')
  redirect(next || '/dashboard')
}

export async function signInWithOtp(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  if (!email) {
    throw new Error('Please enter your email address.');
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    throw new Error(readableAuthError(error.message))
  }

  return { success: true }
}
