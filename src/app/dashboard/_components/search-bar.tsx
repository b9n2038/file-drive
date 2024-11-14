'use client'
import { useOrganization, useSession, useUser } from '@clerk/nextjs'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Dispatch, SetStateAction } from 'react'
import { Button } from '@/components/ui/button'
import { SearchIcon } from 'lucide-react'

const formSchema = z.object({
  query: z.string().min(0).max(200),
})

export default function SearchBar({ query, setQuery }: { query: string, setQuery: Dispatch<SetStateAction<string>> }) {
  const { session } = useSession()
  console.log(session)
  const organization = useOrganization()
  const user = useUser()

  let orgId: string | undefined = undefined
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization?.organization?.id ?? user.user?.id
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setQuery(values.query)
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}
          className="flex gap-2">
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type='text' {...field} placeholder='your file names' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            size='sm'
            type='submit'
          >
            <SearchIcon>Search</SearchIcon>
            Search
          </Button>
        </form>
      </Form>
    </div>)
}

