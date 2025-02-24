import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import CreateList from "@/components/lists/CreateList";
import type { List } from "@shared/schema";

export default function Lists() {
  const { toast } = useToast();
  const { data: lists, isLoading } = useQuery<List[]>({ 
    queryKey: ['/api/lists']
  });

  const deleteList = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/lists/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lists'] });
      toast({ description: "List deleted successfully" });
    }
  });

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading lists...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Family Lists</h1>
        <CreateList />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {lists?.map((list) => (
          <Card 
            key={list.id} 
            className="cursor-pointer transition-colors hover:bg-accent"
          >
            <Link href={`/lists/${list.id}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold">
                  {list.name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault(); // Prevent navigation
                    deleteList.mutate(list.id);
                  }}
                  disabled={deleteList.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Click to view and manage tasks
                </p>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}