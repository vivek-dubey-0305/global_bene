import mongoose, { Schema } from "mongoose";

const voteSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    post_upvotes: {
        target_ids: [{
            type: Schema.Types.ObjectId,
            ref: "Post"
        }],
        value: {
            type: Number,
            default: 0
        }
    },
    post_downvotes: {
        target_ids: [{
            type: Schema.Types.ObjectId,
            ref: "Post"
        }],
        value: {
            type: Number,
            default: 0
        }
    },
    comment_upvotes: {
        target_ids: [{
            type: Schema.Types.ObjectId,
            ref: "Comment"
        }],
        value: {
            type: Number,
            default: 0
        }
    },
    comment_downvotes: {
        target_ids: [{
            type: Schema.Types.ObjectId,
            ref: "Comment"
        }],
        value: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

export const Vote = mongoose.model("Vote", voteSchema);
