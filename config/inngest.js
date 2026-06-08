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
  { id: 'sync-user-from-clerk' },
  { event: 'clerk/user.created' },
  async ({ event }) => {
    // Clerk webhook fields live directly inside event.data
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
  { id: 'sync-user-update-from-clerk' },
  { event: 'clerk/user.updated' },
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
  { id: 'delete-user-with-clerk' },
  { event: 'clerk/user.deleted' },
  async ({ event }) => {
    // For account deletions, Clerk passes the target ID straight inside event.data
    const { id } = event.data;
    
    await connectDB();
    await User.findByIdAndDelete(id);
    console.log(`🗑️ User ${id} successfully removed from MongoDB.`);
  }
);