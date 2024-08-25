export const validate_required = (data) => {
    var update = {};
    var error = false;
    Object.entries(data).forEach(([key, value]) => {
        if (value == null || value.length === 0 || typeof value === 'undefined') {
          error = true;
          update[[key]] = {error: true, message: "Required"}
        }
    })
    return {err_status: error, update: update};
}

export const validate_int = (data) => {
  var update = {};
  var error = false;
  Object.entries(data).forEach(([key, value]) => {
      if (parseInt(value) < 0) {
        error = true;
        update[[key]] = {error: true, message: "Invalid Entry"}
      }
  })
  return {err_status: error, update: update};
}

export const validate_multiple = (data) => {
  var update = {};
  var error = false;
  Object.entries(data).forEach(([key, value]) => {
      if (value.length <= 0) {
        error = true;
        update[[key]] = {error: true, message: "Please select atleast one option"}
      }
  })
  return {err_status: error, update: update};
}