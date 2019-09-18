function deepCopy(obj) {

  if (Array.isArray(obj)) {
    return obj.slice();
  }

  const clone = {};

  for (let i in obj) {
    if (obj[i] != null &&  typeof(obj[i]) == "object")
      clone[i] = deepCopy(obj[i]);
    else
      clone[i] = obj[i];
  }
  return clone;
}

module.exports = deepCopy;
