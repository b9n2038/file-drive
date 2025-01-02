import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export const fileTypes = v.union(
  v.literal('image/png'),
  v.literal('image/jpg'),
  v.literal('image/webp'),
  v.literal('image/jpeg'),
  v.literal('text/csv'),
  v.literal('application/pdf')
)
export const userRoles = v.union(v.literal('admin'), v.literal('member'))

export default defineSchema({
  files: defineTable({
    name: v.string(),
    type: fileTypes,
    orgId: v.string(),
    fileId: v.id('_storage'),
    shouldDelete: v.optional(v.boolean()),
    userId: v.id('users')
  })
    .index('by_orgId', ['orgId'])
    .index('by_should_delete', ['shouldDelete']),
  favourites: defineTable({
    fileId: v.id('files'),
    orgId: v.string(),
    userId: v.id('users')
  }).index('by_user_id_file_id_orgId', ['userId', 'orgId', 'fileId']),
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.string(),
    image: v.optional(v.string()),
    orgIds: v.array(
      v.object({
        orgId: v.string(),
        role: userRoles
      })
    )
  }).index('by_tokenIdentifier', ['tokenIdentifier'])
})
