import { redirect } from 'next/navigation'

export default function Stage2() {
  // Redirect to PAHM session setup for stage 2 PAHM practice
  redirect('/pahm-session-setup?stage=2')
}