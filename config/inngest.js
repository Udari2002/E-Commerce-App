// config/inngest.js
import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";

// Initialize the Inngest client
export const inngest = new Inngest({ id: "quickcart-next" });

/**
 * 1. Inngest function to save a new user to MongoDB when created via Clerk
 * Uses upsert to allow safe retries in the Inngest dashboard!
 */
export const syncUserCreation = inngest.createFunction(
  { 
    id: 'sync-user-from-clerk',
    triggers: [{ event: 'clerk/user.created' }]
  },
  async ({ event }) => {
    const { id, email_addresses, first_name, last_name, image_url } = event.data;

    const email = email_addresses?.[0]?.email_address || "";
    
    // Safety check: log it to your Vercel logs so you can monitor it live
    console.log(`Processing creation for user: ${id}, Email extracted: "${email}"`);

    const userData = {
      name: `${first_name || ''} ${last_name || ''}`.trim() || "QuickCart User",
      email: email,
      imageUrl: image_url,
    };

    await connectDB();
    
    // Using findOneAndUpdate with upsert: true makes your function safe to RERUN!
    await User.findOneAndUpdate(
      { _id: id },
      { $set: userData },
      { upsert: true, new: true, runValidators: true }
    );

    console.log(`🚀 User ${id} successfully synced and created/updated in MongoDB.`);
  }
);

/**
 * 2. Inngest function to update user profile information in MongoDB
 */
export const syncUserUpdate = inngest.createFunction(
  { 
    id: 'sync-user-update-from-clerk',
    triggers: [{ event: 'clerk/user.updated' }]
  },
  async ({ event }) => {
    const { id, email_addresses, first_name, last_name, image_url } = event.data;

    const userData = {
      name: `${first_name || ''} ${last_name || ''}`.trim() || "QuickCart User",
      email: email_addresses?.[0]?.email_address || "",
      imageUrl: image_url,
    };

    await connectDB();
    await User.findByIdAndUpdate(id, userData, { runValidators: true });
    console.log(`🔄 User ${id} successfully updated in MongoDB.`);
  }
);

/**
 * 3. Inngest function to delete a user profile from MongoDB when deleted in Clerk
 */
export const syncUserDeletion = inngest.createFunction(
  { 
    id: 'delete-user-with-clerk',
    triggers: [{ event: 'clerk/user.deleted' }]
  },
  async ({ event }) => {
    const { id } = event.data;
    
    await connectDB();
    await User.findByIdAndDelete(id);
    console.log(`🗑️ User ${id} successfully removed from MongoDB.`);
  }
);