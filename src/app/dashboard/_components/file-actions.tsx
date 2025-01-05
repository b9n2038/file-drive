import { AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { Protect } from '@clerk/nextjs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle
} from '@radix-ui/react-alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@radix-ui/react-dropdown-menu'
import { StarFilledIcon } from '@radix-ui/react-icons'
import { useMutation, useQuery } from 'convex/react'
import { FileIcon, MoreVertical, StarIcon, TrashIcon, UndoIcon } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../../../convex/_generated/api'
import { Doc } from '../../../../convex/_generated/dataModel'

export function FileCardActions({ file, isFavourited }: { file: Doc<'files'>; isFavourited: boolean }) {
  const deleteFile = useMutation(api.files.deleteFile)
  const restoreFile = useMutation(api.files.restoreFile)
  const toggleFavourite = useMutation(api.files.toggleFavourite)
  //  const userProfile = useQuery(api.users.getUserProfile)
  const me = useQuery(api.users.getMe)
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
          <Protect
            condition={(check) => {
              return (
                check({
                  role: 'org:admin'
                }) || file.userId === me?._id
              )
            }}
          >
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
