const User = require('../Models/user');

exports.updateUserDetails = async (req, res) => {
  try {

    const { email } = req.body;
    const data = { ...req.body }; 
    delete data.email; 

    if (!email) {
      return res.status(400).json({ error: "Email is required to update details." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found. Please log in first." });
    }
    //to check if the unique details already exixts in collection
    for (const [key, value] of Object.entries(data)) {
      if (key === 'mobile_no' && value) {
        const mobileExists = await User.findOne({ mobile_no: value });
        if (mobileExists && mobileExists.email !== user.email) {
          return res.status(400).json({ error: "Mobile number is already in use." });
        }
      }
      if (key === 'id_verification' && value) {
        const { pan_card, aadhaar_card, voter_id } = value;

        if (pan_card) {
          const panExists = await User.findOne({ 'id_verification.pan_card': pan_card });
          if (panExists && panExists.email !== user.email) {
            return res.status(400).json({ error: "PAN card number is already in use." });
          }
        }

        if (aadhaar_card) {
          const aadhaarExists = await User.findOne({ 'id_verification.aadhaar_card': aadhaar_card });
          if (aadhaarExists && aadhaarExists.email !== user.email) {
            return res.status(400).json({ error: "Aadhaar card number is already in use." });
          }
        }

        if (voter_id) {
          const voterExists = await User.findOne({ 'id_verification.voter_id': voter_id });
          if (voterExists && voterExists.email !== user.email) {
            return res.status(400).json({ error: "Voter ID is already in use." });
          }
        }
      }
    }

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: data },
      { new: true } 
    );

    res.status(200).json({
      message: "User details updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user details:", error.message);
    res.status(500).json({ error: error.message });
  }
};
