import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import TaskItem from "@/components/lists/TaskItem";
import AddTask from "@/components/lists/AddTask";
import type { List, Task } from "@shared/schema";

export default function ListDetails() {
  const { id } = useParams();
  if (!id) return <div>Invalid List ID</div>;

  const { data: list } = useQuery(['list', id], () => getList(id));

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: [`/api/lists/${id}/tasks`],
    enabled: !isNaN(parseInt(id))
  });

  if (isNaN(parseInt(id))) {
    return <div>Invalid list ID</div>;
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading tasks...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-lg">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="lg" className="mb-4 -ml-3">
            <ChevronLeft className="mr-2 h-5 w-5" />
            Back to Lists
          </Button>
        </Link>
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <h1 className="text-2xl font-bold">{list?.name}</h1>
          <AddTask listId={parseInt(id)} />
        </div>
      </div>

      <div className="space-y-4">
        {tasks?.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
        {tasks?.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No tasks yet. Add one to get started!
          </p>
        )}
      </div>
    </div>
  );
}