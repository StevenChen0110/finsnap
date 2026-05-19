'use client'
import { AppProvider } from '../lib/context'
import AppShell from './layout/AppShell'

export default function WebApp() {
  return (
    <AppProvider>
      <AppShell/>
    </AppProvider>
  )
}
