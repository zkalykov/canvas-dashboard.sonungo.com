'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAssignment, useCourses } from '@/hooks/use-canvas';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AssignmentSubmission } from '@/components/assignments/assignment-submission';
import { QuizEngine } from '@/components/quizzes/quiz-engine';
import {
  FileText,
  ExternalLink,
  Calendar,
  ArrowLeft,
} from 'lucide-react';
import { format } from 'date-fns';

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const courseId = parseInt(params.courseId as string, 10);
  const assignmentId = parseInt(params.assignmentId as string, 10);

  const { data: assignment, loading, error } = useAssignment(courseId, assignmentId);
  const { data: courses } = useCourses();

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

  if (error || !assignment) {
    return (
      <div className="space-y-6 mx-auto max-w-5xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="text-center py-20">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Assignment Not Found</h2>
          <p className="text-muted-foreground mt-2">We couldn't load this assignment.</p>
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
          <span className={`h-2.5 w-2.5 rounded-full ${getCourseColor(assignment.course_id)}`} />
          <span className="text-sm font-medium text-muted-foreground">
            {getCourseName(assignment.course_id)}
          </span>
        </div>
        
        <h1 className="text-3xl font-bold">{assignment.name}</h1>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm pt-2">
          {assignment.due_at && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                <span className="text-muted-foreground mr-1">Due:</span>
                {format(new Date(assignment.due_at), 'EEEE, MMMM d, yyyy h:mm a')}
              </span>
            </div>
          )}

          {assignment.points_possible !== undefined && assignment.points_possible !== null && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {assignment.points_possible} pts possible
              </Badge>
              {assignment.submission?.score !== null &&
               assignment.submission?.score !== undefined && (
                <Badge variant="default" className="bg-green-600">
                  Score: {assignment.submission.score} / {assignment.points_possible}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {assignment.description && (
        <div className="border-t pt-8 mt-8">
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          <div
            className="prose prose-sm md:prose-base dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: assignment.description }}
          />
        </div>
      )}

      {assignment.rubric && assignment.rubric.length > 0 && (
        <div className="border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">Rubric</h2>
          <div className="space-y-3">
            {assignment.rubric.map(criterion => (
              <div key={criterion.id} className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <span className="font-semibold">{criterion.description}</span>
                  <Badge variant="outline" className="shrink-0">{criterion.points} pts</Badge>
                </div>
                {criterion.long_description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {criterion.long_description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t pt-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-xl font-semibold">Submission</h2>
          
          {assignment.submission_types && (
            <div className="flex gap-2 flex-wrap">
              {assignment.submission_types.map(type => (
                <Badge key={type} variant="secondary" className="font-normal text-xs">
                  {type.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {assignment.submission_types?.includes('online_quiz') && assignment.quiz_id ? (
          <QuizEngine 
            courseId={assignment.course_id} 
            quiz={assignment as any}
          />
        ) : assignment.submission_types?.some(t => 
          ['online_text_entry', 'online_url', 'online_upload'].includes(t)
        ) ? (
          <AssignmentSubmission 
            assignment={assignment}
            onSuccess={() => {
              // Usually we'd invalidate or refetch here, but reloading data works too
              window.location.reload();
            }}
          />
        ) : (
          <div className="p-6 bg-muted/50 rounded-xl text-center text-muted-foreground text-sm border">
            This assignment does not require an online submission.
          </div>
        )}

        <div className="pt-6">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <a
              href={assignment.html_url}
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
    </div>
  );
}
