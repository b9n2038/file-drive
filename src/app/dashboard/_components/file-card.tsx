import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { Protect } from '@clerk/nextjs'
import { DropdownMenuSeparator } from '@radix-ui/react-dropdown-menu'
import { StarFilledIcon } from '@radix-ui/react-icons'
import { useMutation, useQuery } from 'convex/react'
import { formatRelative, subDays } from 'date-fns'
import {
  FileIcon,
  GanttChartIcon,
  ImageIcon,
  MoreVertical,
  StarIcon,
  TextIcon,
  TrashIcon,
  UndoIcon
} from 'lucide-react'
import Image from 'next/image'
import { ReactNode, useState } from 'react'
import { api } from '../../../../convex/_generated/api'
import { Doc } from '../../../../convex/_generated/dataModel'

export function FileCardActions({ file, isFavourited }: { file: Doc<'files'>; isFavourited: boolean }) {
  const deleteFile = useMutation(api.files.deleteFile)
  const restoreFile = useMutation(api.files.restoreFile)
  const toggleFavourite = useMutation(api.files.toggleFavourite)
  //  const userProfile = useQuery(api.users.getUserProfile)
  const { toast } = useToast()
  const [isOpen, setOpen] = useState(false)
  return (
    <>
      <AlertDialog open={isOpen} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>Files are deleted periodically.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await deleteFile({ fileId: file._id })
                toast({
                  variant: 'default',
                  title: 'File deleted',
                  description: 'Your file is now marked for deletion. '
                })
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <MoreVertical className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => window.open(file.url, '_blank')}>
            <>
              <FileIcon />
              Download
            </>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => toggleFavourite({ fileId: file._id })}
            className="flex gap-1  items-center cursor:pointer"
          >
            {isFavourited ? (
              <>
                <StarFilledIcon className="w-4 h-4" /> Unfavourite
              </>
            ) : (
              <>
                <StarIcon className="w-4 h-4" /> Favourite
              </>
            )}
          </DropdownMenuItem>
          <Protect role="org:admin">
            <DropdownMenuSeparator />
            {!file.shouldDelete ? (
              <DropdownMenuItem
                onClick={() => setOpen(true)}
                className="flex gap-1 text-red-600 items-center cursor:pointer"
              >
                <TrashIcon className="w-4 h-4" />
                Delete
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={async () => {
                  await restoreFile({ fileId: file._id })
                  toast({
                    variant: 'default',
                    title: 'File restored',
                    description: 'Your file has been restored. '
                  })
                }}
                className="flex gap-1 text-green-600 items-center cursor:pointer"
              >
                <UndoIcon className="w-4 h-4" />
                Restore
              </DropdownMenuItem>
            )}
          </Protect>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export function FileCard({
  file,
  favourites
}: {
  file: Doc<'files'> & { url: string }
  favourites: Doc<'favourites'>[]
}) {
  console.log(file.name, file.userId)
  const userProfile = useQuery(api.users.getUserProfile, {
    userId: file.userId
  })
  const isImage = (file: Doc<'files'>) => {
    switch (file.type) {
      case 'image/webp':
      case 'image/png':
      case 'image/jpeg':
      case 'image/jpg':
        return true
      default:
        return false
    }
  }

  const typeIcons = {
    'image/webp': <ImageIcon />,
    'image/png': <ImageIcon />,
    'image/jpg': <ImageIcon />,
    'image/jpeg': <ImageIcon />,
    'application/pdf': <TextIcon />,
    'text/csv': <GanttChartIcon />
  } as Record<File['type'], ReactNode>

  const isFavourited = favourites.some((favourite) => favourite.fileId === file._id)

  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle className="flex gap-2 text-base font-normal">
          {typeIcons[file.type]} {file.name}
        </CardTitle>
        <div className="absolute top-4 right-2">
          <FileCardActions file={file} isFavourited={isFavourited} />
        </div>
      </CardHeader>
      <CardContent className="h-[200px] flex justify-center items-center">
        {isImage(file) && <Image alt="preview" width="200" height="100" src={file.url} />}
        {file.type == 'text/csv' && <GanttChartIcon className="w-20 h-20" />}
        {file.type == 'application/pdf' && <TextIcon className="w-20 h-20" />}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-xs text-gray-700 w-40 items-center">
          <Avatar className="w-6 h-6">
            <AvatarImage src={userProfile?.image} />
            <AvatarFallback>{userProfile?.name}</AvatarFallback>
          </Avatar>
          {userProfile?.name}
        </div>
        <div className="flex gap-2 text-xs text-gray-700">
          Uploaded on {formatRelative(subDays(new Date(file._creationTime), 3), new Date())}
        </div>
      </CardFooter>
    </Card>
  )
}
