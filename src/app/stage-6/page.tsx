import { redirect } from 'next/navigation'

export default function Stage6() {
  // Redirect to session setup for stage 6 PAHM practice
  redirect('/pahm-session-setup?stage=6')
}