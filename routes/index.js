var express = require('express');
var {findActiveCourses} = require('../includes/courses');
const {checkToken,verificar,storage,upload} = require('../includes/templates');
const {writeBD,findBD} = require('../includes/database');
var router = express.Router();
//const bodyParser = require('body-parser');

module.exports = router;
