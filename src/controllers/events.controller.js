const getEvents = (req, res) => {
  res.status(200).json({
    status: "success",
    payload: [],
  });
};

export default {
  getEvents,
};