import { GraphDisplay } from '@/components/graph/graph-display';
import { getClientGraphConfig } from '@/lib/client-graphs';

export const metadata = {
  title: 'Venture Graph',
  description: 'Interactive venture relationship graph.',
};

export default function GraphPage() {
  return <GraphDisplay config={getClientGraphConfig('demo')} />;
}
