"use client"

import { useState } from "react"
import Link from "next/link"
import { deleteUser } from "@/app/actions/user"
import { Button, buttonVariants } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

interface UserActionsProps {
  userId: string
}

export function UserActions({ userId }: UserActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteUser(userId)
    
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Pengguna berhasil dihapus")
    }
    
    setIsDeleting(false)
  }

  return (
    <div className="flex items-center gap-2">
      <Link href={`/admin/users/${userId}/edit`}>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Edit className="h-4 w-4" />
        </Button>
      </Link>
      
      <AlertDialog>
        <AlertDialogTrigger 
          className={cn(buttonVariants({ variant: "destructive", size: "icon" }), "h-8 w-8")}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data pengguna akan dihapus secara permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}