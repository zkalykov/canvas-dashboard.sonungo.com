'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCourses } from '@/hooks/use-canvas';
import { useState, useEffect } from 'react';
import { canvasApi } from '@/lib/canvas-api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DiscussionThread } from '@/components/discussions/discussion-thread';
import {
  MessageSquare,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { DiscussionTopic } from '@/lib/types';

export default function DiscussionDetailPage() {
  const params = useParams();
  const router = useRouter();

  const courseId = parseInt(params.courseId as string, 10);
  const discussionId = parseInt(params.discussionId as string, 10);

  const { data: courses } = useCourses();
  const [topic, setTopic] = useState<DiscussionTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCourseName = (id: number) => {
    return courses?.find(c => c.id === id)?.course_code || 'Unknown Course';
  };

  const getCourseColor = (id: number) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500',
    ];
    return colors[id % colors.length];
  };

  useEffect(() => {
    async function fetchTopic() {
      try {
        setLoading(true);
        // Canvas API: GET /courses/:course_id/discussion_topics/:topic_id
        const data = await fetch(`/api/canvas/courses/${courseId}/discussion_topics/${discussionId}`).then(r => {
          if (!r.ok) throw new Error('Failed to fetch discussion');
          return r.json();
        });
        data.course_id = courseId;
        setTopic(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load discussion');
      } finally {
        setLoading(false);
      }
    }
    fetchTopic();
  }, [courseId, discussionId]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
          <div className="pt-8 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="space-y-6 mx-auto max-w-5xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="text-center py-20">
          <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Discussion Not Found</h2>
          <p className="text-muted-foreground mt-2">We couldn&apos;t load this discussion.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <Button variant="ghost" onClick={() => router.back()} className="-ml-4 mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`h-2.5 w-2.5 rounded-full ${getCourseColor(topic.course_id)}`} />
          <span className="text-sm font-medium text-muted-foreground">
            {getCourseName(topic.course_id)}
          </span>
        </div>

        <h1 className="text-3xl font-bold">{topic.title}</h1>

        <div className="flex items-center gap-3 pt-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={topic.author?.avatar_image_url} />
            <AvatarFallback>{topic.author?.display_name?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{topic.author?.display_name}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(topic.posted_at), { addSuffix: true })}</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {topic.unread_count > 0 && (
              <Badge variant="secondary">{topic.unread_count} unread</Badge>
            )}
            <Badge variant="outline" className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {topic.discussion_subentry_count} replies
            </Badge>
          </div>
        </div>
      </div>

      <DiscussionThread topic={topic} />

      <div className="pt-6 border-t">
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <a
            href={topic.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Original on Canvas
          </a>
        </Button>
      </div>
    </div>
  );
}
