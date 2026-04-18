const userModel = require("../Models/UserModel");
const listingModel = require("../Models/ListingModel");

const getActiveListing = async (req, res) => {
  const { documentId } = req.params;

  // DEBUG
  const allListings = await listingModel.find({ document: documentId });
  console.log("All listings for doc:", documentId, JSON.stringify(allListings));

  const listing = await listingModel
    .findOne({ document: documentId, status: "active" })
    .select("orderId price amount");

  if (!listing)
    return res.status(404).json({ message: "Không có listing active" });
  return res.json(listing);
};

module.exports = {
  getActiveListing,
};
