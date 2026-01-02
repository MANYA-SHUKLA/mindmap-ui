import Mindmap from '@/components/Mindmap';
import Footer from '@/components/Footer';
import mindmapData from '@/data/mindmap.json';
import { MindmapData } from '@/types/mindmap';

export default function Home() {
  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* Animated background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30 animate-pulse-slow pointer-events-none"></div>
      <Mindmap data={mindmapData as MindmapData} />
      <Footer />
    </div>
  );
}
