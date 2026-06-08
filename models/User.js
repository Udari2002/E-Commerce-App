import mongoose from "mongoose";

// Define the User Schema matching your Clerk sync data structure
const UserSchema = new mongoose.Schema(
  {
    _id: { 
      type: String, 
      required: true 
    },
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true 
    },
    imageUrl: { 
      type: String 
    }
  },
  { 
    timestamps: true // Automatically adds createdAt and updatedAt fields
  }
);

// ✅ THE NEXT.JS FIXED EXPORT:
// Compiles the model only if it hasn't been registered in Mongoose memory yet.
const User = mongoose.models.user || mongoose.model("user", UserSchema);

export default User;