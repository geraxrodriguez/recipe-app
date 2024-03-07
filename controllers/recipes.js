const cloudinary = require("../middleware/cloudinary");
const Recipe = require("../models/Recipe");
const Favorite = require("../models/Favorite");

module.exports = {
  getProfile: async (req, res) => {
    try {
      //Since we have a session each request (req) contains the logged-in users info: req.user
      //Grabbing just the recipes of the logged-in user
      //Console.log (req.user) to see everything
      const recipes = await Recipe.find({ user: req.user.id });
      //Sending recipe data from mongodb and user data to ejs template
      res.render("profile.ejs", { recipes: recipes, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getFavorites: async (req, res) => {
    try {
      //Since we have a session each request (req) contains the logged-in users info: req.user
      //Grabbing just the recipes of the logged-in user
      //Console.log (req.user) to see everything
      const recipes = await Favorite.find({ user: req.user.id }).populate('recipe');
      console.log(recipes)
      //Sending recipe data from mongodb and user data to ejs template
      res.render("favorites.ejs", { recipes: recipes, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getFeed: async (req, res) => {
    try {
      const recipes = await Recipe.find().sort({ createdAt: "desc" }).lean();
      res.render("feed.ejs", { recipes: recipes });
    } catch (err) {
      console.log(err);
    }
  },
  getRecipe: async (req, res) => {
    try {
      //id param comes from Recipe routes
      //router.get("/:id", ensureAuth, recipesController.getrecipe);
      //example url: http://localhost:2121/recipe/01293847a;osidjf
      //id === 01293847a;osidjf
      const recipe = await Recipe.findById(req.params.id);
      res.render("recipe.ejs", { recipe: recipe, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  createRecipe: async (req, res) => {
    try {
      console.log('beta')
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);

      //media stored on cloudinary - above request responds with url and the media id that you will need when deleting content
      await Recipe.create({
        name: req.body.name,
        image: result.secure_url,
        cloudinaryId: result.public_id,
        ingredients: req.body.ingredients,
        directions: req.body.directions,
        likes: 0,
        user: req.user.id,
      });
      console.log("Recipe has been added!");
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
    }
  },
  favoriteRecipe: async (req, res) => {
    try {

      //media stored on cloudinary - above request responds with url and the media id that you will need when deleting content
      await Favorite.create({
        user: req.user.id,
        recipe: req.params.id,
      });
      console.log("Recipe has been added!");
      res.redirect(`/recipe/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  likeRecipe: async (req, res) => {
    try {
      await Recipe.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
        }
      );
      console.log("Likes +1");
      res.redirect(`/recipe/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  deleteRecipe: async (req, res) => {
    try {
      // Find recipe by id
      let recipe = await Recipe.findById({ _id: req.params.id });
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(recipe.cloudinaryId);
      // Delete recipe from db
      await Recipe.remove({ _id: req.params.id });
      console.log("Deleted Recipe");
      res.redirect("/profile");
    } catch (err) {
      res.redirect("/profile");
    }
  },
};
