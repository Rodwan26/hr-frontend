import './globals.css'
import { Providers } from '@/components/Providers'
import { SidebarProvider } from '@/components/ui/sidebar-context'
import { DashboardLayout } from '@/components/ui/DashboardLayout'
import ErrorBoundary from '@/components/ErrorBoundary'

export const metadata = {
  title: 'HR AI Platform',
  description: 'AI-powered HR management platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className="scroll-smooth">
      <body className="antialiased overflow-x-hidden">
        <ErrorBoundary>
          <Providers>
            <SidebarProvider>
              <DashboardLayout>
                {children}
              </DashboardLayout>
            </SidebarProvider>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}

