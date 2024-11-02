import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Doc } from "../../convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { api } from '../../convex/_generated/api'
import Image from 'next/image'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GanttChartIcon, ImageIcon, MoreVertical, TextIcon, TrashIcon } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ReactNode, useState } from "react"
import { useMutation } from "convex/react"
import { useToast } from "@/hooks/use-toast"


export function FileCardActions({ file }: { file: Doc<"files"> }) {
  const deleteFile = useMutation(api.files.deleteFile)
  const { toast } = useToast()
  const [isOpen, setOpen] = useState(false)
  return (
    <>
      <AlertDialog open={isOpen} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { await deleteFile({ fileId: file._id }); toast({ variant: "default", title: "File deleted", description: "Your file is now gone from the system. " }) }}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger><MoreVertical className="size-4" /></DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setOpen(true)} className="flex gap-1 text-red-600 items-center cursor:pointer"><TrashIcon className="w-4 h-4" />Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}


export function FileCard({ file }: { file: Doc<"files"> & { url: string } }) {
  const isImage = (file: Doc<"files">) => {
    switch (file.type) {
      case "image/webp":
      case "image/png":
      case "image/jpeg":
      case "image/jpg":
        return true
      default:
        return false
    }
  }

  const typeIcons = {
    "image/webp": <ImageIcon />,
    "image/png": <ImageIcon />,
    "image/jpg": <ImageIcon />,
    "image/jpeg": <ImageIcon />,
    "application/pdf": <TextIcon />,
    "text/csv": <GanttChartIcon />
  } as Record<File['type'], ReactNode>
  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle className="flex gap-2">{typeIcons[file.type]} {file.name}</CardTitle>
        <div className="absolute top-4 right-2">
          <FileCardActions file={file} />
        </div>
      </CardHeader>
      <CardContent className="h-[200px] flex justify-center items-center">
        {isImage(file) && (
          <Image
            alt="preview"
            width="200"
            height="100"
            src={file.url} />
        )}
        {file.type == 'text/csv' && <GanttChartIcon className="w-20 h-20" />}
        {file.type == 'application/pdf' && <TextIcon className="w-20 h-20" />}
      </CardContent>
      <CardFooter className="flex justify-center items-center">
        <Button onClick={() => window.open(file.url, '_blank')}>Download</Button>
      </CardFooter>
    </Card>

  )
}
