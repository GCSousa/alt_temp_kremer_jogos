import type { Metadata } from 'next';
import { Inter, Cinzel } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-cinzel',
});

export const metadata: Metadata = {
  title: '21 Jogos Lógicos no Mesmo Tabuleiro',
  description: 'Desafie-se em 21 jogos lógicos de alinhamento, bloqueio e desafios individuais no mesmo tabuleiro.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${cinzel.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
