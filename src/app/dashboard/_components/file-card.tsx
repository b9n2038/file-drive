import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Doc, Id } from "../../../../convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { api } from '../../../../convex/_generated/api'
import Image from 'next/image'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GanttChartIcon, ImageIcon, MoreVertical, StarIcon, TextIcon, TrashIcon } from "lucide-react"
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
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu"
import { StarFilledIcon } from "@radix-ui/react-icons"
import { Protect } from "@clerk/nextjs"


export function FileCardActions({ file, isFavourited }: { file: Doc<"files">, isFavourited: boolean }) {
  const deleteFile = useMutation(api.files.deleteFile)
  const toggleFavourite = useMutation(api.files.toggleFavourite)

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
          <DropdownMenuItem onClick={() => toggleFavourite({ fileId: file._id })} className="flex gap-1  items-center cursor:pointer">
            {isFavourited ? (<><StarFilledIcon className="w-4 h-4" /> Unfavourite</>) :
              (<><StarIcon className="w-4 h-4" /> Favourite</>)}</DropdownMenuItem>
          <Protect permission="org:role:admin">
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setOpen(true)} className="flex gap-1 text-red-600 items-center cursor:pointer"><TrashIcon className="w-4 h-4" />Delete</DropdownMenuItem>
          </Protect>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}


export function FileCard({ file, favourites }: { file: Doc<"files"> & { url: string }, favourites: Doc<"favourites">[] }) {
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

  const isFavourited = favourites.some((favourite) => favourite.fileId === file._id)

  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle className="flex gap-2">{typeIcons[file.type]} {file.name}</CardTitle>
        <div className="absolute top-4 right-2">
          <FileCardActions file={file} isFavourited={isFavourited} />
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
