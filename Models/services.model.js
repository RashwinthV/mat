const mongoose = require('mongoose');


// Service Schema
const serviceSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        business_name: { type: String, required: true },
        whatsapp_no: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        profile_image: { type: String },
        profession: { type: String },
        experience: { type: Number, min: 0 }, // Ensures no negative experience values
        gender: { type: String, enum: ["Male", "Female", "Other"] },
        services: [{ type: String }],
        packages: [
            {
                name: { type: String, required: true },
                price: { type: Number, required: true },
                currency: { type: String, default: "INR" },
                description: { type: String },
                features: [{ type: String }]
            }
        ],
        created_at: { type: Date, default: Date.now },
        updated_at: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

// Mandap Details Schema
const mandapDetailsSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        location: { type: String },
        price: { type: Number, required: true },
        currency: { type: String, default: "INR" },
        features: [{ type: String }],
        gallery: [
            {
                image_url: { type: String, required: true },
                description: { type: String },
                created_at: { type: Date, default: Date.now }
            }
        ],
        available_dates: [{ type: Date }],
        capacity: { type: Number, min: 0 },
        created_at: { type: Date, default: Date.now },
        updated_at: { type: Date, default: Date.now }
    },
    { timestamps: true }
);


module.exports = {
    MandapDetails: mongoose.model("MandapDetails", mandapDetailsSchema),
    Service: mongoose.model("Service", serviceSchema)
};
