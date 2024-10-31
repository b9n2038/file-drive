import { mutation, QueryCtx, MutationCtx, query } from './_generated/server'
import { ConvexError, v } from 'convex/values'
import { getUser } from './users'
import { fileTypes } from './schema'

async function hasAccessToOrg(ctx: QueryCtx | MutationCtx, tokenIdentifier: string, orgId: string) {
  const user = await getUser(ctx, tokenIdentifier)
  const hasAccess = user.orgIds.includes(orgId) || user.tokenIdentifier.includes(orgId)
  console.log('hasAccess', hasAccess)
  console.log(user.orgIds)
  console.log(user.tokenIdentifier, tokenIdentifier)
  return hasAccess
}

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity()

  console.log('id', identity)
  if (!identity) {
    console.log('you must be logged in')
    return
  }

  return await ctx.storage.generateUploadUrl();
})

export const createFile = mutation({
  args: {
    name: v.string(),
    type: fileTypes,
    orgId: v.string(),
    fileId: v.id("_storage")
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity()

    console.log('id', identity)
    if (!identity) {
      console.log('you must be logged in')
      return
    }

    // throw new Error('no access')
    const user = await getUser(ctx, identity.tokenIdentifier)
    const hasAccess = await hasAccessToOrg(ctx, identity.tokenIdentifier, args.orgId)
    if (!hasAccess) {
      throw new ConvexError("you do not have access to this org")
    }
    await ctx.db.insert('files', {
      name: args.name,
      type: args.type,
      orgId: args.orgId,
      fileId: args.fileId
    })
  }
})

export const deleteFile = mutation({
  args: { fileId: v.id("files") }
  , handler: async (ctx, args) => {
    console.log('deleteFile')
    const identity = await ctx.auth.getUserIdentity()
    console.log('identity', identity)
    if (!identity) {
      console.log('you must be logged in')
      return []
    }
    const file = await ctx.db.get(args.fileId)

    if (!file) {
      throw new ConvexError('File does not exist')
    }
    const hasAccess = await hasAccessToOrg(ctx, identity.tokenIdentifier, file.orgId)
    if (!hasAccess) {
      throw new ConvexError('You do not have access to delete this file.')
    }
    //    ctx.storage.delete(file?.fileId)

    await ctx.db.delete(args.fileId)
    return
  }

})

export const getFiles = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {

    const identity = await ctx.auth.getUserIdentity()
    console.log('identity', identity)
    if (!identity) {
      console.log('you must be logged in')
      return []
    }

    const hasAccess = await hasAccessToOrg(ctx, identity.tokenIdentifier, args.orgId)
    if (!hasAccess) {
      return []
    }

    return ctx.db
      .query('files')
      .withIndex('by_orgId', (q) => q.eq('orgId', args.orgId))
      .collect()
  }
})

