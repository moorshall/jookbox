import { Router } from "express";
import {
    createLike,
    deleteLike,
    getAllPostLikes,
} from "../controllers/like.controller";

const likeRoutes = Router();

likeRoutes.get("/all/:id", getAllPostLikes);
likeRoutes.post("/:id", createLike);
likeRoutes.delete("/:id", deleteLike);

export default likeRoutes;