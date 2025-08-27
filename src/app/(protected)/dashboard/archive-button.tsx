"use client"

import { Button } from "@/components/ui/button"
import useProject from "@/hooks/use-project"
import useRefetch from "@/hooks/use-refetch"
import { api } from "@/trpc/react" 
import  { toast } from "sonner"

const ArchiveButton = () => {
  const archiveProject = api.project.archiveProject.useMutation()
  const { projectId } = useProject()
  const refetch = useRefetch()

  return (
    <Button 
      disabled={archiveProject.isPending} 
      size='sm' 
      variant='destructive' 
      onClick={() => {
        const confirm = window.confirm("are you sure you want to archive this project?")
        if (confirm && projectId) {
          archiveProject.mutate({ projectId }, {
            onSuccess: () => {
              toast.success("project archived")
              refetch()
            },
            onError: () => {
              toast.error("failed to archive project")
            }
          })
        } else if (confirm && !projectId) {
          toast.error("Project ID is missing")
        }
      }}
    >
      Archive
    </Button>
  )
}


export default ArchiveButton