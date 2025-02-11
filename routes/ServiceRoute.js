const express = require('express');
const { MakeupArtists, MakeupArtist, Photographers,photographer, mehendiArtists, Decorators, Decorator,Mandapams, MandapDetail, planners, planner } = require('../Controllers/WeddingServices');
const router = express.Router();


router.get('/makeup_artists',MakeupArtists)
router.get('/makeup_artists/:id',MakeupArtist)


router.get('/photographers',Photographers)
router.get('/photographers/:id',photographer)


router.get('/mehandi_artists',mehendiArtists)
router.get('/mehandi_artists/:id',MakeupArtist)

router.get('/Decorators',Decorators)
router.get('/Decorators/:id',Decorator)

router.get('/mandapam', Mandapams);
router.get('/mandapam/:id', MandapDetail); 

router.get('/planners',planners)
router.get('/planners/:id',planner)

module.exports = router;