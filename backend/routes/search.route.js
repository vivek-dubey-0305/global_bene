import { Router } from "express";
import {
    searchCommunities,
    searchPosts,
    searchUsers,
    searchAll
} from "../controllers/search.controller.js";

const router = Router();

// Search routes
router.get("/communities", searchCommunities);
router.get("/posts", searchPosts);
router.get("/users", searchUsers);
router.get("/all", searchAll);

export default router;