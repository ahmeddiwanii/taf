'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import MemberLayout from '@/components/layout/member-layout';
import { PostsComponent } from '@/components/posts-component';
import { motion } from 'framer-motion';
import { MessageSquare, Zap } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  status: string;
  author: { id: string; name: string; email: string };
  createdAt: string;
  taggedUserIds?: string;
  comments?: { id: string; content: string; author: { id: string; name: string } }[];
  likes?: { userId: string }[];
}

export default function MemberPostsPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/posts?approved=true&limit=20`);
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <MemberLayout>
      <div className="space-y-6 relative z-10 pb-12 w-full max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
            <div>
                <h1 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    COMM-LINK <span className="text-blue-500">POSTS</span>
                </h1>
                <p className="text-white/40 font-medium tracking-widest uppercase text-xs flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Global Organization Broadcasts
                </p>
            </div>
        </motion.div>

        {loading ? (
          <div className="bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl p-16 rounded-3xl text-center">
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Decrypting feed...</p>
          </div>
        ) : (
          <div className="bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl rounded-2xl shadow-2xl p-6">
            <PostsComponent
              posts={posts as any}
              onRefreshAction={fetchPosts}
              canApprove={false}
            />
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
