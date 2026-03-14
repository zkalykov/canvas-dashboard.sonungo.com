'use client';

import { useAuth } from '@/lib/auth-context';
import { UpcomingAssignments } from '@/components/dashboard/upcoming-assignments';
import { GradesOverview } from '@/components/dashboard/grades-overview';
import { WorkloadHeatmap } from '@/components/dashboard/workload-heatmap';
import { DueCountdowns } from '@/components/dashboard/due-countdowns';
import { TodoList } from '@/components/dashboard/todo-list';
import { AnnouncementsFeed } from '@/components/dashboard/announcements-feed';
import { DiscussionsTracker } from '@/components/dashboard/discussions-tracker';
import { CourseCards } from '@/components/dashboard/course-cards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Send, ExternalLink } from 'lucide-react';

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="max-w-md w-full mx-4 shadow-lg">
          <CardHeader className="text-center pb-0">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <MessageCircle className="h-7 w-7 text-blue-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Canvas Portal</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Secure authentication via Telegram
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-6 mt-6">
            <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 text-left border border-blue-100 dark:border-blue-900/50">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 p-1.5 flex-shrink-0">
                  <Send className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-1 text-foreground">How to Login</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We use a passwordless system. Open our Telegram bot and type <code className="bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono text-foreground font-medium">/portal</code> to get a secure, one-time login link.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <a
                href="https://t.me/canvas_sonungo_com_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 w-full text-sm font-medium text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 transition-transform group-hover:translate-x-full -translate-x-full" />
                <Send className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                <span>Open Telegram Bot</span>
              </a>
              
              <div className="relative mt-2 mb-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/60" />
                </div>
                <div className="relative flex justify-center text-xs uppercase font-medium">
                  <span className="bg-card px-3 text-muted-foreground">or</span>
                </div>
              </div>

              <a
                href="https://canvas.sonungo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md py-1"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Learn more on canvas.sonungo.com
              </a>
            </div>
            
            <p className="text-xs text-muted-foreground/80 pt-2">
              Login links are single-use and expire in 1 minute.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-w-0">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Top row - Key metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 min-w-0">
        <div className="min-w-0"><DueCountdowns /></div>
        <div className="min-w-0"><WorkloadHeatmap /></div>
        <div className="min-w-0"><TodoList /></div>
      </div>

      {/* Course cards with assignments/quizzes/tasks */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Courses</h2>
        <CourseCards />
      </div>

      {/* Lists row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <UpcomingAssignments />
        <AnnouncementsFeed />
        <DiscussionsTracker />
      </div>

      {/* Grades overview at the bottom */}
      <GradesOverview />
    </div>
  );
}
