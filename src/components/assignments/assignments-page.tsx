'use client';

import { useState } from 'react';
import { useAssignments, useCourses } from '@/hooks/use-canvas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import {
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import type { Assignment } from '@/lib/types';

export function AssignmentsPage() {
  const { data: assignments, loading, error } = useAssignments();
  const { data: courses } = useCourses();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'submitted'>('upcoming');

  const getCourseName = (courseId: number) => {
    return courses?.find(c => c.id === courseId)?.course_code || 'Unknown';
  };

  const getCourseColor = (courseId: number) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500',
    ];
    return colors[courseId % colors.length];
  };

  const getSubmissionStatus = (assignment: Assignment) => {
    if (assignment.submission?.workflow_state === 'submitted' ||
        assignment.submission?.workflow_state === 'graded') {
      return 'submitted';
    }
    if (assignment.due_at && isPast(new Date(assignment.due_at))) {
      return 'past';
    }
    return 'upcoming';
  };

  const filteredAssignments = assignments?.filter(a => {
    if (filter === 'all') return true;
    const status = getSubmissionStatus(a);
    if (filter === 'submitted') return status === 'submitted';
    if (filter === 'past') return status === 'past';
    if (filter === 'upcoming') return status === 'upcoming';
    return true;
  }).sort((a, b) => {
    if (!a.due_at) return 1;
    if (!b.due_at) return -1;
    return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
  }) || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Assignments</h1>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Assignments</h1>
        <p className="text-muted-foreground">Failed to load assignments</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Assignments
        </h1>
        <div className="flex gap-2">
          {(['upcoming', 'past', 'submitted', 'all'] as const).map(f => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ScrollArea className="h-[calc(100vh-220px)]">
            {filteredAssignments.length === 0 ? (
              <p className="text-muted-foreground">No assignments found</p>
            ) : (
              <div className="space-y-3">
                {filteredAssignments.map(assignment => {
                  const status = getSubmissionStatus(assignment);

                  return (
                    <Link
                      href={`/courses/${assignment.course_id}/assignments/${assignment.id}`}
                      key={assignment.id}
                      className="w-full text-left rounded-lg block border p-4 transition-colors hover:bg-muted"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`h-2 w-2 rounded-full ${getCourseColor(assignment.course_id)}`} />
                            <span className="text-xs text-muted-foreground">
                              {getCourseName(assignment.course_id)}
                            </span>
                          </div>
                          <p className="font-medium">{assignment.name}</p>
                          {assignment.due_at && (
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>
                                Due {format(new Date(assignment.due_at), 'MMM d, h:mm a')}
                              </span>
                              <span className="text-orange-500">
                                ({formatDistanceToNow(new Date(assignment.due_at), { addSuffix: true })})
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {assignment.points_possible && (
                            <Badge variant="secondary">
                              {assignment.points_possible} pts
                            </Badge>
                          )}
                          {status === 'submitted' && (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Submitted
                            </Badge>
                          )}
                          {status === 'past' && (
                            <Badge variant="destructive">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Past Due
                            </Badge>
                          )}
                          {status === 'upcoming' && (
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              Upcoming
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
