const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  customer_id: { type: String, default: "" ,unique:true},
  name: { type: String,  default: "" },
  social_login:{type:String, default:""},
  mobile_no: { type: String, unique: true, default: "" }, 
  email: { type: String, unique: true, default: "" },
  astro_details: {
    dob: { type: Date, default: null },
    time_of_birth: { type: String,  default: "" }, 
    place_of_birth: { type: String,  default: "" },
    cheva_thosam: { type: Boolean, }
  },
  location: {
    country: { type: String,  default: "" },
    state: { type: String,  default: "" },
    city: { type: String,  default: "" },
    zip: { type: String,  default: "" },
  },
  age: { type: Number, default: 0 },
  gender: { type: String, enum: ['male', 'female',''],  default: "" },
  relationship_preference: { type: String, default: "" },
  interests: { type: [String], default: [] },
  photos: { type: [String], default: [] },
  id_verification: {
    pan_card: { type: String, default: "",unique:true },
    aadhaar_card: { type: String, default: "",unique:true },
    voter_id: { type: String, default: "",unique:true },
  }
});

module.exports = mongoose.model('User', userSchema);
