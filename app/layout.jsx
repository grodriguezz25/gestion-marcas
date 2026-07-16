import './globals.css'

export const metadata = {
  title: 'Gestión de Marcas',
  description: 'Panel de administración para marcas registradas',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
