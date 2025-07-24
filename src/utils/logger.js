
const info = (message) => {
  console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
};
// This function logs informational messages with a timestamp.
// It can be used to track the flow of the application and debug issues.
const error = (message) => {
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
};

module.exports = { info, error };