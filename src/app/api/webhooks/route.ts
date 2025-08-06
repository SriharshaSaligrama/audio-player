import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest, NextResponse } from "next/server";
import {
    createMongoUser,
    deleteMongoUser,
    updateMongoUser,
} from "@/actions/users";

export async function POST(req: NextRequest) {
    try {
        const evt = await verifyWebhook(req);
        if (!evt) {
            return NextResponse.json("Invalid webhook event", { status: 400 });
        }

        switch (evt.type) {
            case "user.created":
                try {
                    await createMongoUser(evt.data);
                    console.log("User created successfully in MongoDB");
                } catch (error) {
                    console.log("Error creating user:", error);
                    return NextResponse.json("Error creating user", { status: 500 });
                }
                break;
            case "user.updated":
                try {
                    await updateMongoUser(evt.data);
                    console.log("User updated successfully in MongoDB");
                } catch (error) {
                    console.log("Error updating user:", error);
                    return NextResponse.json("Error updating user", { status: 500 });
                }
                break;
            case "user.deleted":
                try {
                    await deleteMongoUser(evt.data);
                    console.log("User deleted successfully from MongoDB");
                } catch (error) {
                    console.log("Error deleting user:", error);
                    return NextResponse.json("Error deleting user", { status: 500 });
                }
                break;
            default:
                break;
        }

        return NextResponse.json({ received: true });
    } catch (err) {
        console.log("Error verifying webhook:", err);
        return NextResponse.json("Error verifying webhook", { status: 400 });
    }
}