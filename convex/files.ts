import { mutation, QueryCtx, MutationCtx, query } from './_generated/server'
import { ConvexError, v } from 'convex/values'
import { getUser } from './users'
import { fileTypes } from './schema'
import { Id } from './_generated/dataModel'

async function hasAccessToOrg(ctx: QueryCtx | MutationCtx, tokenIdentifier: string, orgId: string) {
  const user = await getUser(ctx, tokenIdentifier)
  const hasAccess = user.orgIds.some(item => item.orgId === orgId) || user.tokenIdentifier.includes(orgId)

  console.log('hasAccess', hasAccess)
  console.log(user.orgIds)
  console.log(user.tokenIdentifier, tokenIdentifier)
  if (!hasAccess) {
    return null
  }
  return { user }
}

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity()

  console.log('id', identity)
  if (!identity) {
    console.log('you must be logged in')
    return null
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
    const access = await hasAccessToFile(ctx, args.fileId)
    if (!access) {
      throw new ConvexError('You do not have access to delete this file.')
    }

    const isAdmin = access.user.orgIds.find(org => org.orgId === access.file.orgId)?.role === 'admin'
    //ctx.storage.delete(file?.fileId)
    if (!isAdmin) {
      throw new ConvexError('you dont have admin access')
    }

    await ctx.db.delete(args.fileId)
    return
  }

})

export const getFiles = query({
  args: { orgId: v.string(), query: v.optional(v.string()), favourites: v.optional(v.boolean()) },
  handler: async (ctx, args) => {

    const identity = await ctx.auth.getUserIdentity()
    console.log('identity', identity)
    if (!identity) {
      console.log('you must be logged in')
      return []
    }

    const access = await hasAccessToOrg(ctx, identity.tokenIdentifier, args.orgId)
    if (!access) {
      return []
    }

    let files = await ctx.db
      .query('files')
      .withIndex('by_orgId', (q) => q.eq('orgId', args.orgId))
      .collect()


    if (args.favourites) {
      const favourites = await ctx.db.query("favourites").withIndex("by_user_id_file_id_orgId", (q) => q.eq("userId", access.user._id).eq("orgId", args.orgId)).collect()
      files = files.filter(file => favourites.some(favorite => favorite.fileId === file._id))
      console.log('favourites', favourites.length)
    }

    //string query
    const query = args.query
    console.log('query', query)
    files = !query || query.length === 0 ? files : files.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()))
    console.log('filtered', files.length)

    const filesWithUrl = await Promise.all(
      files.map(async (file) => ({
        ...file,
        url: await ctx.storage.getUrl(file.fileId),
      }))
    );
    return filesWithUrl;
  }
})

async function hasAccessToFile(
  ctx: QueryCtx | MutationCtx,
  fileId: Id<"files">
) {

  const identity = await ctx.auth.getUserIdentity()
  console.log('identity', identity)
  if (!identity) {
    console.log('you must be logged in')
    return null
  }
  const file = await ctx.db.get(fileId)

  if (!file) {
    console.log('file not found')
    return null
  }
  const hasAccess = await hasAccessToOrg(ctx, identity.tokenIdentifier, file.orgId)
  if (!hasAccess) {
    return null
  }
  const user = hasAccess.user

  return { user, file }
}

export const toggleFavourite = mutation({
  args: { fileId: v.id("files") }
  , handler: async (ctx, args) => {
    console.log('toggleFavourites')
    const access = await hasAccessToFile(ctx, args.fileId)
    if (!access) {
      throw new ConvexError('No access to file')
    }
    const { user, file } = access

    const favourite = await ctx.db
      .query('favourites')
      .withIndex('by_user_id_file_id_orgId', (q) => q.eq('userId', user._id).eq('orgId', file.orgId).eq("fileId", file._id))
      .first()

    if (!favourite) {
      await ctx.db.insert("favourites", {
        fileId: file._id,
        orgId: file.orgId,
        userId: user._id
      })
    } else {
      await ctx.db.delete(favourite?._id)
    }
    return
  }
})

export const getAllFavourites = query({
  args: { orgId: v.string() }
  , handler: async (ctx, args) => {
    console.log('getAllFavourites')

    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return []
    }
    const access = await hasAccessToOrg(ctx, identity.tokenIdentifier, args.orgId)
    if (!access) {
      return []
    }

    const files = await ctx.db
      .query('favourites')
      .withIndex('by_user_id_file_id_orgId', (q) => q.eq('userId', access.user._id).eq('orgId', args.orgId))
      .collect()

    return files;
  }
})


