module.exports.validateDate = (date) => {
  if (date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)) {
    date = date.split("/");
    if (date[0] >= 1 && date[0] <= 31 && date[1] >= 1 && date[1] <= 12) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};
