import './globals.css'

export const metadata = {
  title: '1CoFounder - Find Your Healthcare Co-Founder',
  description: 'A nonprofit platform where healthcare innovators find cofounders and collaborate to solve healthcare problems. A Manavta Foundation Initiative.',
  icons: {
    icon: '/logo-icon.jpeg',
    apple: '/logo-icon.jpeg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  )
}
