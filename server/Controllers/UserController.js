const getListUser = (req, res) => {
  res.send("get list user");
};

const userDetail = (req, res) => {
  res.send("list user");
};

module.exports = {
  getListUser,
  userDetail,
};
