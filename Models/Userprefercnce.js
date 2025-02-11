const mongoose = require('mongoose');

const preferencesSchema = new mongoose.Schema({
  customer_id: { type: String, default: "" },
  age: { type: Number, default: 0 },
  height: { type: String, default: "" },
  marital_status: { type: String, default: "" },
  religion: { type: String, default: "" },
  community: { type: String, default: "" },
  mother_tongue: { type: String, default: "" },
  chevvai_dosham: { type: String, default: "" },
  country: { type: String, default: "" },
  residency_status: { type: String, default: "" },
  photo_settings: { type: String, default: "" },
  education: {
    qualification: { type: String, default: "" },
    field_of_education: { type: String, default: "" }
  },
  profession: {
    profession_area: { type: String, default: "" },
    working_with: { type: String, default: "" },
    annual_income: { type: String, default: "" }
  },
  lifestyle: {
    diet: { type: String, default: "" }
  },
  other_details: {
    profile_created_by: { type: String, default: "" },
    has_horoscope: { type: String, default: "" }
  }
});

// Exporting the model
module.exports = mongoose.model('Preference', preferencesSchema);
