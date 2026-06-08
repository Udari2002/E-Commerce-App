// src/inngest/client.ts
import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";

export const inngest = new Inngest({ id: "quickcart-next" });

//Inngest function to save user data to database 
export const syncUserCreation = inngest.createFunction(
    { id:'sync-user-from-clerk' },
    {event:'clerk/user.created'},
    async({ event}) => {
        const{ id, email_addresses, first_name, last_name,image_url} = event.data.user;

        const userData = {
            _id: id,
            name: first_name + " " + last_name,
            email: email_addresses[0].email_address,
            imageUrl: image_url,
        }
        await connectDB();
        await User.create(userData);
    }
)

//Inngest function to update user data in database
export const syncUserUpdate = inngest.createFunction(
    { 
        id:'sync-user-update-from-clerk' 
    },
    {event:'clerk/user.updated'},
    async({ event}) => {
        const{ id, email_addresses, first_name, last_name,image_url} = event.data.user;
        const userData = {
            _id: id,
            name: first_name + " " + last_name,
            email: email_addresses[0].email_address,
            imageUrl: image_url,
        }
        await connectDB();
        await User.findByIdAndUpdate(id, userData);
    }
)

//Inngest function to delete user data from database
export const syncUserDeletion = inngest.createFunction(
    {
        id:'delete-user-with-clerk'
    },
    {event:'clerk/user.deleted'},
    async({ event}) => {
        const{ id } = event.data.user;
        await connectDB();
        await User.findByIdAndDelete(id);
    }
)
