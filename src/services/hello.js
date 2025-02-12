exports.main = async function (event, context) {
  console.log(event);
  console.log(context);
  return {
    statusCode: 200,
    body: JSON.stringify(`Hello World ${process.env.TABLE_NAME}`),
  };
};
