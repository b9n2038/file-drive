import { ConvexError, v } from "convex/values";
import {
  MutationCtx,
  QueryCtx,
  internalMutation,
  query,
} from "./_generated/server";
import { userRoles } from "./schema";
//import { roles } from "./schema";
//import { hasAccessToOrg } from "./files";

export async function getUser(
  ctx: QueryCtx | MutationCtx,
  tokenIdentifier: string
) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", tokenIdentifier)
    )
    .first();

  if (!user) {
    throw new ConvexError("expected user to be defined");
  }

  return user;
}

export const createUser = internalMutation({
  args: { tokenIdentifier: v.string(), name: v.string(), image: v.optional(v.string()) },
  async handler(ctx, args) {
    await ctx.db.insert("users", {
      tokenIdentifier: args.tokenIdentifier,
      orgIds: [],
      name: args.name,
      image: args.image
    });
  },
});

export const updateUser = internalMutation({
  args: { tokenIdentifier: v.string(), name: v.string(), image: v.optional(v.string()) },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", args.tokenIdentifier)
      )
      .first();

    if (!user) {
      throw new ConvexError("no user with this token found");
    }

    await ctx.db.patch(user._id, {
      name: args.name,
      image: args.image,

    });
  },
});

export const addOrgIdToUser = internalMutation({
  args: { tokenIdentifier: v.string(), orgId: v.string(), role: userRoles },
  async handler(ctx, args) {
    const user = await getUser(ctx, args.tokenIdentifier);

    await ctx.db.patch(user._id, {
      orgIds: [...user.orgIds, { orgId: args.orgId, role: args.role }],
    });
  },
});

export const updateRoleInOrgForUser = internalMutation({
  args: { tokenIdentifier: v.string(), orgId: v.string(), role: userRoles },
  async handler(ctx, args) {
    const user = await getUser(ctx, args.tokenIdentifier);

    let org = user.orgIds.find((org) => org.orgId === args.orgId)

    if (!org) {
      org = { orgId: args.orgId, role: args.role }
      console.log(
        "expected an org on the user but was not found when updating, add it now"
      );
    } else {
      org.role = args.role;
    }


    await ctx.db.patch(user._id, {
      orgIds: [...user.orgIds.filter(org => org.orgId !== args.orgId), org]
    });
  },
});

//export const getUserProfile = query({
//  args: { userId: v.id("users") },
//  async handler(ctx, args) {
//    const user = await ctx.db.get(args.userId);

//    return {
//      name: user?.name,
//      image: user?.image,
//    };
//  },
//});

export const getMe = query({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const user = await getUser(ctx, identity.tokenIdentifier);

    if (!user) {
      return null;
    }

    return user;
  },
});
