import { mutation, QueryCtx, MutationCtx, query } from './_generated/server'
import { ConvexError, v } from 'convex/values'
import { getUser } from './users'
import { throws } from 'assert'

async function hasAccessToOrg(ctx: QueryCtx | MutationCtx, tokenIdentifier: string, orgId: string) {
  const user = await getUser(ctx, tokenIdentifier)
  const hasAccess = user.orgIds.includes(orgId) || user.tokenIdentifier.includes(orgId)
  console.log('hasAccess', hasAccess)
  console.log(user.orgIds)
  console.log(user.tokenIdentifier, tokenIdentifier)
  return hasAccess
}

export const createFile = mutation({
  args: {
    name: v.string(),
    orgId: v.string()
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity()

    console.log('id', identity)
    if (!identity) {
      console.log('you must be logged in')
      return
    }


    const user = await getUser(ctx, identity.tokenIdentifier)
    const hasAccess = await hasAccessToOrg(ctx, identity.tokenIdentifier, args.orgId)
    if (!hasAccess) {
      throw new ConvexError("you do not have access to this org")
    }
    await ctx.db.insert('files', {
      name: args.name,
      orgId: args.orgId
    })
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

