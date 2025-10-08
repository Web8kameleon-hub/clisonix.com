/**
 * ASI Demo Layout
 * ===============
 * 
 * Layout configuration for ASI demo page
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NeuroSonix ASI Demo',
  description: 'Interactive demonstration of NeuroSonix Artificial Superintelligence system with Trinity architecture',
  keywords: ['ASI', 'AI', 'NeuroSonix', 'Alba', 'Albi', 'Jona', 'Trinity'],
};

export default function ASIDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}