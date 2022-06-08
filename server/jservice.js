const request = require('request');

function getTriviaQuestion(callback) {
  const requestOptions = {
    url: 'https://jservice.io/api/random',
    method: 'GET',
    json: {},
    qs: {
      offset: 20
    }
  };
  request(requestOptions, (err, response, body) => {
    if (err) {
      console.log(err);
      callback(false, err);
    } else if (response.statusCode === 200) {
      console.log(body);
      callback(true, body[0]);
    } else {
      console.log(response.statusCode);
      callback(false, null);
    }
  });
}

exports.getTriviaQuestion = getTriviaQuestion;
