const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const recipesController = require("../controllers/recipes");
const { ensureAuth } = require("../middleware/auth");

//Recipe Routes
//Since linked from server js treat each path as:
//recipe/:id, recipe/createRecipe, recipe/likeRecipe/:id

router.get("/:id", ensureAuth, recipesController.getRecipe);

// Enables user to create recipe w/ cloudinary for media uploads
router.post("/favoriteRecipe/:id", recipesController.favoriteRecipe);

router.post("/createRecipe", upload.single("file"), recipesController.createRecipe);

//Enables user to like recipe. In controller, uses RECIPE model to update likes by 1
router.put("/likeRecipe/:id", recipesController.likeRecipe);

//Enables user to delete recipe. In controller, uses RECIPE model to delete recipe from MongoDB collection
router.delete("/deleteRecipe/:id", recipesController.deleteRecipe);

module.exports = router;
