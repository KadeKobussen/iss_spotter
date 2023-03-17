const request = require('request');

const fetchMyIP = function (callback) {
  let url = 'https://api.ipify.org?format=json';
  request(url, (error, response, body) => {

    if (error) {
      callback(error, null);
      return;
    }
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }

    const data = JSON.parse(body);
    console.log(data.ip);
    callback(null, data.ip);

  });


};


const fetchcoordsByIp = function (ip, callback) {
  let url = `https://ipwhois.app/json/${ip}`;
  request(url, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }

    const parsedBody = JSON.parse(body);
    if (!parsedBody.success) {
      const message = `Success status was ${parsedBody.success}. Server message says: ${parsedBody.message} when fetching for IP ${parsedBody.ip}`;
      callback(Error(message), null);
      return;
    }

    const data2 = JSON.parse(body);
    const coords = {
      latitude: data2.latitude,
      longitude: data2.longitude,
    };
    callback(null, coords);
  });
};


const fetchISSInfo = function (coords, callback) {
  let url = `https://iss-flyover.herokuapp.com/json/?lat=${coords.latitude}&lon= ${coords.longitude}`;
  request(url, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }
    if (response.statusCode !== 200) {
      const message = `Expected status code 200 but received ${response.statusCode}.`;
      callback(Error(message), null);
      return;
    }
    const data3 = JSON.parse(body);
    const timeInfo = data3.response;
    callback(null, timeInfo);
  });
};


const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }

    fetchcoordsByIp(ip, (error, loc) => {
      if (error) {
        return callback(error, null);
      }

      fetchISSInfo(loc, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }

        callback(null, nextPasses);
      });
    });
  });
};


module.exports = { nextISSTimesForMyLocation };



