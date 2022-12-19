exports.userValidation = (userId, creator) => {
  console.log(userId, creator)
  if (userId !== creator) {
    const error = new Error("You cannot edit or delete this post.");
    error.statuscode = 401;
    throw error;
  }
};
