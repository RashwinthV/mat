const express = require("express");
const router = express.Router();
const { updateUserDetails } = require("../Controllers/Storeuser");
const {
  loginProvider,
  keycloakCallback,
} = require("../Controllers/authController");
const User = require("../Models/user");
const { Searchuser } = require("../Controllers/Searchuser");
const { AllMatches, NearbyMatches, profession_matches, community_matches, prefered_matches, perfect_matches} = require("../Controllers/matches");

router.post("/Register", updateUserDetails);
router.get("/login/:provider", loginProvider);
router.get("/", (req, res) => {
  res.render("Home");
});
router.get("/dashboard", async (req, res) => {
  const email = req.query.email; // Get email from query
  // console.log(email);

  try {
    const user = await User.findOne({ email }).lean(); // Use .lean() to return a plain object
    // console.log(user); // Log the user object for debugging

    if (user) {
      res.render("dashboard", { user }); // Pass the plain object as `user`
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).send("Error retrieving user data");
  }
});

router.get("/form", keycloakCallback);
router.get("/form/user", (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).send("Email parameter is missing");
  }
  res.render("form", { email });
});

router.get("/search",Searchuser);

//matches route
router.get("/all_matches/:id",AllMatches)
router.get("/nearby_matches/:id",NearbyMatches)
router.get("/professional_matches/:id",profession_matches)
router.get('/community_matches/:id', community_matches)
router.get('/prefered_matches/:id', prefered_matches)
router.get('/perfect_matches/:id', perfect_matches)
module.exports = router;
