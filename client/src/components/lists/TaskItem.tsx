import { useMutation } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import type { Task } from "@shared/schema";

interface TaskItemProps {
  task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignee, setAssignee] = useState(task.assignedTo || "");

  const updateTask = useMutation({
    mutationFn: async (data: Partial<Task>) => {
      await apiRequest('PATCH', `/api/tasks/${task.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/lists/${task.listId}/tasks`] });
    }
  });

  const deleteTask = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/tasks/${task.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/lists/${task.listId}/tasks`] });
    }
  });

  const handleAssign = () => {
    if (isAssigning) {
      updateTask.mutate({ assignedTo: assignee || null });
    }
    setIsAssigning(!isAssigning);
  };

  return (
    <Card>
      <CardContent className="flex items-center p-4">
        <Checkbox
          checked={task.completed}
          onCheckedChange={(checked) => 
            updateTask.mutate({ completed: checked as boolean })
          }
          className="mr-4"
        />
        <span className={`flex-grow ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
          {task.description}
        </span>
        <div className="flex items-center gap-2 ml-4">
          {isAssigning ? (
            <Input
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-32"
              placeholder="Assignee name"
            />
          ) : task.assignedTo ? (
            <span className="text-sm text-muted-foreground flex items-center">
              <User className="h-4 w-4 mr-1" />
              {task.assignedTo}
            </span>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAssign}
          >
            <User className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteTask.mutate()}
            disabled={deleteTask.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
