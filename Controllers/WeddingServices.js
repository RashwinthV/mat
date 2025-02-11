const {Service, MandapDetails} = require("../Models/services.model");

exports.MakeupArtists = async (req, res) => {
  try {
    const data = await Service.find(
      { profession: "Makeup Artist" },
      { name: 1, experience: 1, business_name: 1, whatsapp_no: 1, _id: 1 }
    );

    if (data.length>0) {
      return res.status(200).json({
        message: `${data.length} Makeup Artists found.`,
        artists: data,
      });
    } else {
      return res.status(404).json({ message: "No Makeup Artists found." });
    }
  } catch (err) {
    console.error("Error fetching makeup artists:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

exports.MakeupArtist = async (req, res) => {
  try {
    const data = await Service.findById(req.params.id);

    if (data) {
      return res
        .status(200)
        .json({ message: "Makeup Artist found.", artist: data });
    } else {
      return res.status(404).json({ message: "Makeup Artist not found." });
    }
  } catch (err) {
    console.error("Error fetching makeup artist:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

exports.Photographers = async (req, res) => {
  try {
    const data = await Service.find(
      { profession: "Photographer" },
      { name: 1, experience: 1, business_name: 1, whatsapp_no: 1, _id: 1 }
    );

    if (data.length>0) {
      return res.status(200).json({
        message: `${data.length} Photographers found.`,
        photographers: data,
      });
    } else {
      return res.status(404).json({ message: "No Photographers found." });
    }
  } catch (err) {
    console.error("Error fetching photographers:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

exports.photographer = async (req, res) => {
  try {
    const data = await Service.findById(req.params.id);

    if (data) {
      return res
        .status(200)
        .json({ message: "Photographer found.", photographer: data });
    } else {
      return res.status(404).json({ message: "Photographer not found." });
    }
  } catch (err) {
    console.error("Error fetching photographer:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

exports.mehendiArtists = async (req, res) => {
    try {
        const data = await Service.find(
        { profession: "Meheendi Artist" },
        { name: 1, experience: 1, business_name: 1, whatsapp_no: 1, _id: 1 }
        );
    
        if (data.length>0) {
        return res.status(200).json({
            message: `${data.length} Meheendi Artists found.`,
            artists: data,
        });
        } else {
        return res.status(404).json({ message: "No Meheendi Artists found." });
        }
    } catch (err) {
        console.error("Error fetching meheendi artists:", err);
        return res
        .status(500)
        .json({ message: "Server error", error: err.message });
    }
};

exports.mehendiArtist = async (req, res) => {
    try {
        const data = await Service.findById(req.params.id);
    
        if (data.length>0) {
        return res
            .status(200)
            .json({ message: "Meheendi Artist found.", artist: data });
        } else {
        return res.status(404).json({ message: "Meheendi Artist not found." });
        }
    } catch (err) {
        console.error("Error fetching meheendi artist:", err);
        return res
        .status(500)
        .json({ message: "Server error", error: err.message });
    }
};

exports.Decorators = async (req, res) => {  
    try {
        const data = await Service.find(
        { profession: "Decorator" },
        { name: 1, experience: 1, business_name: 1, whatsapp_no: 1, _id: 1 }
        );
    
        if (data.length>0) {
        return res.status(200).json({
            message: `${data.length} Decorators found.`,
            decorators: data,
        });
        } else {
        return res.status(404).json({ message: "No Decorators found." });
        }
    } catch (err) {
        console.error("Error fetching decorators:", err);
        return res
        .status(500)
        .json({ message: "Server error", error: err.message });
    }
};

exports.Decorator = async (req, res) => {
    try {
        const data = await Service.findById(req.params.id);
    
        if (data) {
        return res
            .status(200)
            .json({ message: "Decorator found.", decorator: data });
        } else {
        return res.status(404).json({ message: "Decorator not found." });
        }
    } catch (err) {
        console.error("Error fetching decorator:", err);
        return res
        .status(500)
        .json({ message: "Server error", error: err.message });
    }
};

exports.Mandapams = async (req, res) => {
    try {
        const mandaps = await MandapDetails.aggregate([
            {
              $project: {
                name: 1,
                location: 1,
                price: 1,
                _id: 1,
                gallery: { $arrayElemAt: ["$gallery", 0] }
              }
            }
          ]);
                if (mandaps.length > 0) {
        return res.status(200).json({ message: `${mandaps.length} Mandaps found.`, mandaps });
      } else {
        return res.status(404).json({ message: "No Mandaps found." });
      }
    } catch (err) {
      console.error("Error fetching mandaps:", err);
      return res.status(500).json({ message: "Server error", error: err.message });
    }
  };

exports.MandapDetail = async (req, res) => {
    const { id } = req.params;
    try {
      const mandap = await MandapDetails.findById(id);
      if (mandap) {
        return res.status(200).json({ message: "Mandap details found.", mandap });
      } else {
        return res.status(404).json({ message: "Mandap details not found." });
      }
    } catch (err) {
      console.error("Error fetching mandap details:", err);
      return res.status(500).json({ message: "Server error", error: err.message });
    }
  };
  
exports.planners = async (req, res) => {
    try {
        const data = await Service.find(
        { profession: "Wedding Planner" },
        { name: 1, experience: 1, business_name: 1, whatsapp_no: 1, _id: 1 }
        );
    
        if (data.length>0) {
        return res.status(200).json({
            message: `${data.length} Wedding Planners found.`,
            planners: data,
        });
        } else {
        return res.status(404).json({ message: "No Wedding Planners found." });
        }
    } catch (err) {
        console.error("Error fetching wedding planners:", err);
        return res
        .status(500)
        .json({ message: "Server error", error: err.message });
    }
};

exports.planner = async (req, res) => {
    try {
        const data = await Service.findById(req.params.id);
    
        if (data) {
        return res
            .status(200)
            .json({ message: "Wedding Planner found.", planner: data });
        } else {
        return res.status(404).json({ message: "Wedding Planner not found." });
        }
    } catch (err) {
        console.error("Error fetching wedding planner:", err);
        return res
        .status(500)
        .json({ message: "Server error", error: err.message });
    }
}