import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuery } from 'convex/react'
import { formatRelative, subDays } from 'date-fns'
import { GanttChartIcon, ImageIcon, TextIcon } from 'lucide-react'
import Image from 'next/image'
import { ReactNode } from 'react'
import { api } from '../../../../convex/_generated/api'
import { Doc } from '../../../../convex/_generated/dataModel'
import { FileCardActions } from './file-actions'

export function FileCard({ file, isFavourited }: { file: Doc<'files'> & { url: string }; isFavourited: boolean }) {
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
