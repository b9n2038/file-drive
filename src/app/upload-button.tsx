'use client'
import { Button } from '@/components/ui/button'
import { useOrganization, useSession, useUser } from '@clerk/nextjs'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from "@/hooks/use-toast"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Loader2 } from "lucide-react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState } from 'react'

const formSchema = z.object({
  title: z.string().min(2).max(200),
  file: z
    .custom<FileList>((val) => val instanceof FileList, "Required")
    .refine((files) => files.length > 0, `Required`)
})

export default function UploadButton() {
  const { session } = useSession()
  console.log(session)
  const organization = useOrganization()
  const user = useUser()
  const createFile = useMutation(api.files.createFile)
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const { toast } = useToast()

  let orgId: string | undefined = undefined
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization?.organization?.id ?? user.user?.id
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      file: undefined
    }
  })
  const fileRef = form.register("file")
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
    const selectedImage = values.file[0]
    if (!orgId) return

    const postUrl = await generateUploadUrl()
    if (!postUrl) {
      console.error('no upload url')
      return
    }
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": selectedImage!.type },
      body: selectedImage,
    })
    const { storageId } = await result.json();

    // Step 3: Save the newly allocated storage id to the database
    // await sendImage({ storageId, author: user.user?.username });
    //
    try {

      await createFile({ name: values.title, orgId, fileId: storageId })
      form.reset()
      setIsDialogOpen(false)
      toast({ title: 'File Uploaded', description: 'Now every one can see your file.', variant: 'success' })
    } catch (err) {
      toast({ title: 'Something went wrong', description: 'Error.', variant: 'destructive' })

      form.reset()
      setIsDialogOpen(false)
    }
  }

  return (
    // <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
    <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
      setIsDialogOpen(isOpen)
      form.reset()
    }
    }>
      <DialogTrigger asChild><Button
        onClick={() => {
          setIsDialogOpen(true)
        }}
      >
        Upload file
      </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='mb-8'>Upload your file?</DialogTitle>
          <DialogDescription>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input type='text' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="file"
                  render={() => (
                    <FormItem>
                      <FormLabel>File</FormLabel>
                      <FormControl>
                        <Input type='file' {...fileRef} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={!form.formState.isValid || (form.formState.isLoading || form.formState.isSubmitting)} className='flex gap-1'
                >{form.formState.isSubmitting && (<Loader2 className="h-4 w-4 animate-spin" />)}Submit</Button>
              </form>
            </Form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

