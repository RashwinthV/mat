const prefrence = require("../Models/Userprefercnce");
const user = require("../Models/user");
const User = require("../Models/user");

exports.Searchuser = async (req, res) => {
  try {
    const search = req.body;
    // console.log(search);
    

    if (!search || Object.keys(search).length === 0) {
      return res
        .status(400)
        .json({ message: "Search parameters are missing." });
    }

    const {
      age,
      height,
      marital_status,
      religion,
      community,
      mother_tongue,
      chevvai_dosham,
      country,
      residency_status,
      photo_settings,
      education = {},
      profession = {},
      lifestyle = {},
      other_details = {},
    } = search;

    const { qualification, field_of_education } = education;
    const { profession_area, working_with, annual_income } = profession;
    const { diet } = lifestyle;
    const { profile_created_by, has_horoscope } = other_details;

    // Fetch user preferences
    const data = await prefrence.find();

    const matchingUsers = data.filter(
      (user) =>
        (!age || user.age === age) &&
        (!height || user.height === height ) &&
        (!religion || user.religion === religion ) &&
        (!marital_status ||
          user.marital_status === marital_status) &&
        (!community || user.community === community ) &&
        (!mother_tongue ||
          user.mother_tongue === mother_tongue) &&
        (!chevvai_dosham ||
          user.chevvai_dosham === chevvai_dosham ) &&
        (!country || user.country === country ) &&
        (!residency_status ||
          user.residency_status === residency_status) &&
        (!photo_settings ||
          user.photo_settings === photo_settings)
    );

    if (
      matchingUsers &&
      matchingUsers.some(
        (user) =>
          (!qualification ||
            user.education.qualification === qualification ||
            qualification === "Doesn't matter" ) &&
          (!field_of_education ||
            user.education.field_of_education === field_of_education ||
            field_of_education === "Doesn't matter")
      )
    ) {
      if (
        matchingUsers.some(
          (user) =>
            (!profession_area ||
              profession_area === "Doesn't matter" ||
              user.profession.profession_area === profession_area ) &&
            (!working_with ||
              working_with === "Doesn't matter" ||
              user.profession.working_with === working_with ) &&
            (!annual_income ||
              annual_income === "Doesn't matter" ||
              user.profession.annual_income === annual_income)
        )
      ) {
        if (
          matchingUsers.some(
            (user) =>
              (!diet ||
                diet === "Doesn't matter" ||
                user.lifestyle.diet === diet) &&
              (!profile_created_by ||
                profile_created_by === "Doesn't matter" ||
                user.other_details.profile_created_by === profile_created_by ) &&
              (!has_horoscope ||
                has_horoscope === "Doesn't matter" ||
                user.other_details.has_horoscope === has_horoscope)
          )
        ) {
          const profiles = await User.find({
            customer_id: { $in: matchingUsers.map((u) => u.customer_id) },
          });

          if (profiles.length > 0) {
            return res
              .status(200)
              .json({ message: `${profiles.length} Users found.`, users: profiles });
          } else {
            return res.status(404).json({
              message: "No users found matching the search criteria.",
            });
          }
        }
      }
    }

    return res
      .status(404)
      .json({ message: "No users found matching the search criteria." });
  } catch (error) {
    console.error("Error occurred while searching users:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
