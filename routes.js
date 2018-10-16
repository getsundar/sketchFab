'use strict';

var router = require('express').Router();


/**
 * Renders the customize page.
 * 
 */
router.get('/', function(req, res) {
    
        res.render('webapp/customize', {});
    
});






module.exports = router;
