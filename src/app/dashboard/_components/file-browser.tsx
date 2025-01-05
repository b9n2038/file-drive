'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useOrganization, useSession, useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { GridIcon, Loader2, TableIcon } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { api } from '../../../../convex/_generated/api'
import { columns } from './columns'
import { FileCard } from './file-card'
import { DataTable } from './file-table'
import SearchBar from './search-bar'
import UploadButton from './upload-button'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Label } from '@radix-ui/react-label'

function Placeholder() {
  return (
    <div className="flex flex-col mt-24 gap-8 mx-auto w-full items-center">
      <Image alt="an image of a picture and directory icon" width="300" height="300" src="/empty.svg" />
      <div className="text-2xl">You have no files, upload one now</div>
      <UploadButton />
    </div>
  )
}

export default function FileBrowser({
  title,
  favouritesOnly,
  deletedOnly
}: {
  title: string
  favouritesOnly?: boolean
  deletedOnly?: boolean
}) {
  const { session } = useSession()
  console.log(session)
  const organization = useOrganization()
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const user = useUser()

  let orgId: string | undefined = undefined
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization?.organization?.id ?? user.user?.id
  }

  const favourites = useQuery(api.files.getAllFavourites, orgId ? { orgId } : 'skip')

  const files = useQuery(
    api.files.getFiles,
    orgId ? { orgId, query, favourites: favouritesOnly, deleted: deletedOnly, type } : 'skip'
  )

  const isLoading = files === undefined
  const modifiedFiles =
    files?.map((file) => ({
      ...file,
      isFavourited: (favourites ?? []).some((favourite) => favourite.fileId === file._id)
    })) ?? []
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">{title}</h1>
        <SearchBar query={query} setQuery={setQuery} />

        <UploadButton />
      </div>

      <Tabs defaultValue="grid" className="">
        <div className="flex justify-between items-center">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="grid">
              <GridIcon />
              Grid
            </TabsTrigger>
            <TabsTrigger value="table">
              <TableIcon />
              Table
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-2 items-center">
            <Label htmlFor="type-select">Type filter</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type-select" className="w-[180px]" defaultValue={'all'}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Type</SelectLabel>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <TabsContent value="grid">
          <div>
            {isLoading && (
              <div className="flex flex-col gap-8 w-full items-center mt-24">
                <Loader2 className="h-32 w-32 animate-spin text-gray-500" />
                <div className="text-2xl">Loading your images...</div>
              </div>
            )}

            {!isLoading && query.length === 0 && files?.length === 0 && <Placeholder />}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {modifiedFiles?.map((file) => {
              return (
                <FileCard key={file._id} file={file} isFavourited={file.isFavourited} favourites={favourites ?? []} />
              )
            })}
          </div>
        </TabsContent>
        <TabsContent value="table">
          <DataTable columns={columns} data={modifiedFiles} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
