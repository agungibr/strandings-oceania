import './globals.css'
import { Inter } from 'next/font/google'
import dynamic from 'next/dynamic'

const inter = Inter({ subsets: ['latin'] })

// Dynamically import ParticlesBackground to avoid SSR issues
const ParticlesBackground = dynamic(() => import('../components/ParticlesBackground'), {
  ssr: false,
});

export const metadata = {
  title: 'Strandings of Oceania Dashboard',
  description: 'Visualization dashboard for marine mammal strandings in Oceania',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ParticlesBackground />
        <nav className="bg-white/90 backdrop-blur-sm shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold text-gray-800">Strandings of Oceania</h1>
                </div>
              </div>
              <div className="flex items-center">
                <a 
                  href="https://www.sprep.org" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-800"
                >
                  About SPREP
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen relative z-0">
          {children}
        </main>
        <footer className="bg-white/90 backdrop-blur-sm shadow-lg mt-8 relative z-10">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-600">
              © {new Date().getFullYear()} Strandings of Oceania Project.
              Pacific Data Challenge. 
            </p>
            <p className="text-center text-gray-600">
              Created by Fito Satrio, Agung Malik, and Brian Nugraha.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
