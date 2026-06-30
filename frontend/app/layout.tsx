import './globals.css';
import Providers from '../components/providers';

export const metadata = {
  title: 'IPMS',
  description: 'Intelligent Project Monitoring System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
