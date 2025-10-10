import { redirect } from 'next/navigation'

export default function Stage4() {
  // Redirect to session setup for stage 4 PAHM practice
  redirect('/pahm-session-setup?stage=4')
}