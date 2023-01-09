exports.userValidation = (userId, creator) => {
  const stringCreator = creator.toString()
  if (userId !== stringCreator) {
    const error = new Error("You cannot edit or delete this post.");
    error.statuscode = 401;
    throw error;
  }
};

exports.prepareSearch = (search, searchFields) => {
  let searchMatch = {};
  let fieldQuery = {};
  if (search && searchFields && searchFields.length > 0) {
      searchMatch.$or = [];
      search = search.trim();
      search = search.replace('%', '');
      search = decodeURIComponent(search).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      for (let searchField of searchFields) {
          fieldQuery = {};
          fieldQuery[searchField] = {
              $regex: search,
              $options: 'i'
          };
          searchMatch.$or.push(fieldQuery);
      }
  }
  return searchMatch;
};
