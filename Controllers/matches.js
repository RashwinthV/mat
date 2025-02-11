const User = require("../Models/user");
const Preference = require("../Models/Userprefercnce");
const locationData = require("./matchauth.js"); 
const distance = require("./matchauth.js"); 


// Function to calculate match percentage
const calculateMatchPercentage = async (user/*matchedpreference */, preferences, id) => {
  let totalCriteria = 12;
  let matchCount = 0;
  const user1 = await User.findOne({ customer_id: id }).lean();
  const matchuser= await User.findOne({ customer_id: user.customer_id}).lean();
  if (!user1 || !preferences) return 0; // Prevent crashing if no user found

  if (user.age >= preferences.age - 2 && user.age <= preferences.age + 2) matchCount++;

  if (user.gender !== user1.gender) matchCount++; // Ensuring opposite genders

  if (user.religion === preferences.religion) matchCount++;

  if (user.community === preferences.community) matchCount++;

  if (user.chevvai_dosham === preferences.chevvai_dosham) matchCount++;  

  if (user.lifestyle.diet === preferences.lifestyle.diet) matchCount++;

  if (user.education?.qualification === preferences.education?.qualification) matchCount++;

  if (user.profession?.profession_area === preferences.profession?.profession_area) matchCount++;

  if (user.country === preferences.country) matchCount++;

  if (user.marital_status && preferences.marital_status && user.marital_status === preferences.marital_status) matchCount++;

  if (user.mother_tongue === preferences.mother_tongue) matchCount++;  

  // Interest Matching - Fixed
  var count=0;
  if (user1.interests && matchuser.interests) {
    for (let i = 0; i <user1.interests.length; i++) {
      for(let j=0;j<=matchuser.interests.length;j++){
      if (user1.interests[i]===matchuser.interests[j]) {         
        count++;
      }
    }
    }
  }
  if(user1.interests.length===count ){
    matchCount++;
  }
  
  return (matchCount / totalCriteria) * 100;
};

// Function to find all matches
exports.AllMatches = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findOne({ customer_id: id });
    const preferences = await Preference.findOne({ customer_id: id });

    if (!user || !preferences) {
      return res.status(404).json({ message: "User or preferences not found" });
    }
    const matches = await Preference.find().lean();
    const filteredMatches = [];
        for (let match of matches) {
          if (match.customer_id === id) continue;
          const matchPreferences = await Preference.findOne({ customer_id: match.customer_id }).lean();

          if (matchPreferences){    
    
        filteredMatches.push({
          ...match,
          matchPercentage:await calculateMatchPercentage(matchPreferences, preferences,id), // Calculate match % based on user's preferences
        });
      }
    }
      
    

    return res
      .status(200)
      .json({ message: `${filteredMatches.length} Matches found`, users: filteredMatches });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

exports.NearbyMatches = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findOne({ customer_id: id }).lean();
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        
        if (!user.location || !user.location.city || !user.location.zip || !user.location.country) {
            return res.status(400).json({ message: "User location details are missing" });
        }
        
        const preferences = await Preference.findOne({ customer_id: id }).lean();
        if (!preferences) {
            return res.status(404).json({ message: "User preferences not found" });
        }

        // Get user's coordinates
        const userLocation = await locationData.getCoordinates(user.location.city, user.location.zip, user.location.country);
        console.log("User Location:", userLocation); // Debugging
        
        if (!userLocation) {
            return res.status(400).json({ message: "Could not determine user location" });
        }

        // Query users in the same country
        const query = { "location.country": user.location.country, _id: { $ne: user._id } };
        if (user.lifestyle?.diet) {
            query["lifestyle.diet"] = user.lifestyle.diet;
        }

        let nearbyUsers = await User.find(query).lean();
        if (nearbyUsers.length === 0) {
            return res.status(200).json({ message: "No nearby matches found", users: [] });
        }

        let filteredMatches = [];

        for (let match of nearbyUsers) {
            // Get match's coordinates
            const matchLocation = await locationData.getCoordinates(match.location.city, match.location.zip, match.location.country);
            console.log("Match Location:", matchLocation);
             if (!matchLocation) continue;
                    
            // Calculate distance
            const calculatedDistance = distance.haversineDistance(
                userLocation.latitude, userLocation.longitude,
                matchLocation.latitude, matchLocation.longitude
            );

            if (calculatedDistance ) {
                const matchPreferences = await Preference.findOne({ customer_id: match.customer_id }).lean();
                if (matchPreferences) {
                    const matchPercentage = await calculateMatchPercentage(matchPreferences, preferences,id);
                    if (matchPercentage >= 25) { // Keep only matches above 25%
                        filteredMatches.push({
                            ...match,
                            matchPercentage,
                            distance: `${calculatedDistance.toFixed(2)} km`
                        });
                    }
                }
            }
        }

        return res.status(200).json({
            message: `${filteredMatches.length} nearby matches found`,
            users: filteredMatches,
        });

    } catch (error) {
        console.error("Error in NearbyMatches:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.profession_matches = async (req, res) => {
  try {
      const id = req.params.id;
      const user = await User.findOne({ customer_id: id }).lean();
      const preferences = await Preference.findOne({ customer_id: id }).lean();

      if (!user || !preferences) {
          return res.status(404).json({ message: "User or preferences not found" });
      }

      const profession = preferences.profession.profession_area;
      const matches = await Preference.find({ "profession.profession_area": profession }).lean();

      if (!matches || matches.length === 0) {
          return res.status(404).json({ message: "No matches found" });
      }

      const matchedUsers = [];
      for (let match of matches) {
        if (match.customer_id === id) continue; // Skip current user
          const matchUser = await User.findOne({ customer_id: match.customer_id }).lean();
          const matchPreferences = await Preference.findOne({ customer_id: match.customer_id }).lean();
          if (matchUser) {
              matchedUsers.push({
                  ...matchUser,  // Convert Mongoose document to plain object
                  matchPercentage: await calculateMatchPercentage(matchPreferences, preferences,id),
              });
          }
      }

      return res.status(200).json({
          message: `${matchedUsers.length} Matches found`,
          users: matchedUsers,
      });

  } catch (error) {
      return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.community_matches = async (req, res) => {
  try {
      const id = req.params.id;
      const user = await User.findOne({ customer_id: id }).lean();
      const preferences = await Preference.findOne({ customer_id: id }).lean();

      if (!user || !preferences) {
          return res.status(404).json({ message: "User or preferences not found" });
      }

      const community = preferences.community;
      const religion = preferences.religion;
      const matches = await Preference.find({ community: community, religion: religion }).lean();

      if (!matches || matches.length === 0) {
          return res.status(404).json({ message: "No matches found" });
      }

      const matchedUsers = [];
      for (let match of matches) {
        if (match.customer_id === id) continue; // Skip current user
          const matchUser = await User.findOne({ customer_id: match.customer_id }).lean();
          const matchPreferences = await Preference.findOne({ customer_id: match.customer_id }).lean();

          if (matchUser) {
            matchedUsers.push({
                ...matchUser,  // Convert Mongoose document to plain object
                matchPercentage:await calculateMatchPercentage(matchPreferences, preferences,id),
            });
        }
      }

      return res.status(200).json({
          message: `${matchedUsers.length} Matches found`,
          users: matchedUsers,
      });

  }
  catch (error) {
      return res.status(500).json({ message: "Server error", error: error.message });
  }

};

exports.prefered_matches = async (req, res) => {
  try {
      const id = req.params.id;
      const user = await User.findOne({ customer_id: id }).lean();
      const preferences = await Preference.findOne({ customer_id: id }).lean();

      if (!user || !preferences) {
          return res.status(404).json({ message: "User or preferences not found" });
      }

      const { interests } = user;
      const { lifestyle } = preferences;
      const userDiet = lifestyle?.diet;

      if ((!interests || interests.length === 0) && !userDiet) {
          return res.status(400).json({ message: "At least one field is required" });
      }
      
      const preferenceQuery = {};
      if (userDiet) preferenceQuery["lifestyle.diet"] = userDiet;
      const preferenceMatches = await Preference.find(preferenceQuery);
      
      const userQuery = {};
      if (interests && interests.length > 0) userQuery.interests = { $in: interests };
      const userMatches = await User.find(userQuery);
      
      const matchedUsers = [];
      for (let match of preferenceMatches) {
          if (match.customer_id === id) continue; // Skip current user
          const matchUser = await User.findOne({ customer_id: match.customer_id }).lean();
          if (matchUser && userMatches.some(u => u.customer_id === match.customer_id)) {
              const matchPreferences = await Preference.findOne({ customer_id: match.customer_id }).lean();
              matchedUsers.push({
                  ...matchUser,
                  matchPercentage: await calculateMatchPercentage(matchPreferences, preferences, id),
              });
          }
      }

      if (matchedUsers.length === 0) {
          return res.status(404).json({ message: "No matches found" });
      }

      return res.status(200).json({
          message: `${matchedUsers.length} Matches found`,
          users: matchedUsers,
      });

  } catch (error) {
      return res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.perfect_matches = async (req, res) => {
  try {
      const id = req.params.id;
      const user = await User.findOne({ customer_id: id }).lean();  
      const preferences = await Preference.findOne({ customer_id: id }).lean();

      if (!user || !preferences) {
          return res.status(404).json({ message: "User or preferences not found" });
      }

       // Query conditions for users (User collection)
 const userQuery = {
  age: { $gte: user.age - 2, $lte: user.age + 2 }, // Age range
  gender: user.gender === "male" ? "female" : "male", // Opposite gender
  interests: { $in: user.interests || [] }, // At least one common interest
};

// Query conditions for preferences (Preference collection)
const preferenceQuery = {
  religion: preferences.religion,
  community: preferences.community,
  "lifestyle.diet": preferences.lifestyle?.diet,
  "education.qualification": preferences.education?.qualification,
  "profession.profession_area": preferences.profession?.profession_area,
  country: preferences.country,
  marital_status: preferences.marital_status,
  mother_tongue: preferences.mother_tongue,
};

const matches = await User.find(userQuery).lean();

if (!matches || matches.length === 0) {
  return res.status(404).json({ message: "No matches found" });
}

const matchedUsers = [];

for (let match of matches) {
  if (match.customer_id === id) continue; // Skip current user
  const matchPreferences = await Preference.findOne({ customer_id: match.customer_id }).lean();
  
  if (matchPreferences) {
    const matchPercentage = await calculateMatchPercentage(matchPreferences, preferences,id);
    if (matchPercentage>=90) { // Keep only matches above 75%
      matchedUsers.push({
        ...match,
        matchPercentage,
      });
    }
  }
}

return res.status(200).json({
  message: `${matchedUsers.length} Matches found`,
  users: matchedUsers,
});

  }
  catch (error) {
      return res.status(500).json({ message: "Server error", error: error.message });
  }


};