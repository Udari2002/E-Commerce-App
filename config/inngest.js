// config/inngest.js
import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";

// Initialize the Inngest client
export const inngest = new Inngest({ id: "quickcart-next" });

/**
 * 1. Inngest function to save a new user to MongoDB when created via Clerk
 */
export const syncUserCreation = inngest.createFunction(
  { 
    id: 'sync-user-from-clerk',
    triggers: [{ event: 'clerk/user.created' }] // ✅ Modern Syntax
  },
  async ({ event }) => {
    const { id, email_addresses, first_name, last_name, image_url } = event.data;

    const userData = {
      _id: id,
      name: `${first_name || ''} ${last_name || ''}`.trim() || "QuickCart User",
      email: email_addresses?.[0]?.email_address || "",
      imageUrl: image_url,
    };

    await connectDB();
    await User.create(userData);
    console.log(`🚀 User ${id} successfully synced and created in MongoDB.`);
  }
);

/**
 * 2. Inngest function to update user profile information in MongoDB
 */
export const syncUserUpdate = inngest.createFunction(
  { 
    id: 'sync-user-update-from-clerk',
    triggers: [{ event: 'clerk/user.updated' }] // ✅ Modern Syntax
  },
  async ({ event }) => {
    const { id, email_addresses, first_name, last_name, image_url } = event.data;

    const userData = {
      name: `${first_name || ''} ${last_name || ''}`.trim() || "QuickCart User",
      email: email_addresses?.[0]?.email_address || "",
      imageUrl: image_url,
    };

    await connectDB();
    await User.findByIdAndUpdate(id, userData);
    console.log(`🔄 User ${id} successfully updated in MongoDB.`);
  }
);

/**
 * 3. Inngest function to delete a user profile from MongoDB when deleted in Clerk
 */
export const syncUserDeletion = inngest.createFunction(
  { 
    id: 'delete-user-with-clerk',
    triggers: [{ event: 'clerk/user.deleted' }] // ✅ Modern Syntax
  },
  async ({ event }) => {
    const { id } = event.data;
    
    await connectDB();
    await User.findByIdAndDelete(id);
    console.log(`🗑️ User ${id} successfully removed from MongoDB.`);
  }
);