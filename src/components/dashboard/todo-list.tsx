'use client';

import { useState } from 'react';
import { useTodoItems } from '@/hooks/use-canvas';
import { useTasks } from '@/hooks/use-tasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Plus, ExternalLink, Trash2, X } from 'lucide-react';

export function TodoList() {
  const { data: canvasTodos, loading: canvasLoading, error: canvasError } = useTodoItems();
  const { tasks: personalTasks, loading: tasksLoading, addTask, toggleTask, deleteTask } = useTasks();
  const [newTask, setNewTask] = useState('');

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    await addTask(newTask.trim());
    setNewTask('');
  };

  const loading = canvasLoading || tasksLoading;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            To-Do
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show incomplete tasks first, then completed
  const incompleteTasks = personalTasks.filter(t => !t.completed);
  const completedTasks = personalTasks.filter(t => t.completed);

  return (
    <div className="w-full max-w-full overflow-hidden">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            To-Do
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add task input */}
          <div className="flex gap-2 mb-4 w-full">
            <Input
              placeholder="Add a personal task..."
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddTask()}
              className="flex-1 min-w-0"
            />
            <Button size="icon" onClick={handleAddTask} className="flex-shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-full overflow-hidden">
            <ScrollArea className="h-[300px]">
          {/* Incomplete personal tasks */}
          {incompleteTasks.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">Personal Tasks</p>
              <div className="space-y-2">
                {incompleteTasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 rounded-lg border p-2"
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="flex-shrink-0"
                    />
                    <span className="flex-1 text-sm truncate min-w-0">
                      {task.title}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Canvas to-do items */}
          {canvasError ? (
            <p className="text-sm text-muted-foreground">Failed to load Canvas tasks</p>
          ) : canvasTodos && canvasTodos.length > 0 ? (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">From Canvas</p>
              <div className="space-y-2">
                {canvasTodos.map((item, index) => (
                  <a
                    key={index}
                    href={item.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border p-2 transition-colors hover:bg-muted"
                  >
                    <div className="h-4 w-4 rounded border flex items-center justify-center">
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm truncate block">
                        {item.assignment?.name || 'Canvas Task'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.context_name}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Canvas
                    </Badge>
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          {/* Completed personal tasks */}
          {completedTasks.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Completed</p>
              <div className="space-y-2">
                {completedTasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 rounded-lg border p-2 bg-green-500/10 border-green-500/30"
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="flex-shrink-0"
                    />
                    <span className="flex-1 text-sm line-through text-muted-foreground truncate min-w-0">
                      {task.title}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={() => deleteTask(task.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {incompleteTasks.length === 0 && completedTasks.length === 0 && (!canvasTodos || canvasTodos.length === 0) && (
            <p className="text-sm text-muted-foreground">No tasks yet</p>
          )}
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
