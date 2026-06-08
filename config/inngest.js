import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";

// Initialize the Inngest client
export const inngest = new Inngest({ id: "quickcart-next" });

/**
 * 1. Real-Time User Creation Webhook
 * Uses an upsert option to bypass stuck validation rules and write users directly.
 */
export const syncUserCreation = inngest.createFunction(
  { 
    id: 'sync-user-from-clerk',
    triggers: [{ event: 'clerk/user.created' }] 
  },
  async ({ event }) => {
    const { id, email_addresses, first_name, last_name, image_url } = event.data;

    // Safely extract the clean email string from Clerk's nested array layout
    const email = email_addresses?.[0]?.email_address || "";

    const userData = {
      name: `${first_name || ''} ${last_name || ''}`.trim() || "QuickCart User",
      email: email,
      imageUrl: image_url,
    };

    await connectDB();

    // findOneAndUpdate handles any pre-existing broken schemas or empty entries cleanly
    await User.findOneAndUpdate(
      { _id: id },
      { $set: userData },
      { upsert: true, new: true, runValidators: false }
    );

    console.log(`🚀 Real-time User ${id} successfully synced to MongoDB.`);
  }
);

/**
 * 2. Real-Time User Profile Update Webhook
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
 * 3. Real-Time User Deletion Webhook
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