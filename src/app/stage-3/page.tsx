import { redirect } from 'next/navigation'

export default function Stage3() {
  // Redirect to session setup for stage 3 PAHM practice
  redirect('/pahm-session-setup?stage=3')
}