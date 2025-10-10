import { redirect } from 'next/navigation'

export default function Stage5() {
  // Redirect to session setup for stage 5 PAHM practice
  redirect('/pahm-session-setup?stage=5')
}