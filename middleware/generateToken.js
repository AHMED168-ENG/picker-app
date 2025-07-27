require("dotenv").config();
const jwt = require("jsonwebtoken");
const Common = require("../utility/common");
const e = require("express");
const GenerateToken = (
  data,
  expireHour = Common.base64DecodeString(process.env.EXPIRE_TIME)
) => {
  //(json = {}, expireHour = '24h')
  var json = {
    id: data.id,
    full_name: data.full_name,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    country_code: data.country_code,
    contact_number: data.contact_number,
    role: data.role,
    status: data.status,
    last_login: data.last_login,
    brand_name: data.brand_name,
    brand_id: data?.brand_id,
    store_id: data.store_id,
    store: data?.store,
    workingHour: data.workingHour,
    registration_step1: data.registration_step1,
    registration_step2: data.registration_step2,
    registration_step3: data.registration_step3,
    gateway_customer_id: data.gateway_customer_id,
    permissions: data.permissions ? data.permissions.permissions : "",
    device_id: data.device_id ? data.device_id : "",
    gender: data.gender ? data.gender : "",
    dob: data.dob ? data.dob : "",
    receive_offers: data.receive_offers ? data.receive_offers : false,
    newsletter: data.newsletter ? data.newsletter : false,
    email_verified_at: data.email_verified_at ? data.email_verified_at : null,
  };

  // if (data.role == "provider") {
  //   json = {

  //   };
  // }

  return jwt.sign(json, Common.base64DecodeString(process.env.TOKEN), {
    expiresIn: expireHour,
  });
};

module.exports = GenerateToken;
