import express from 'express';
import indiaLocations from '../data/indiaLocations.js';

const router = express.Router();

// Get all states
router.get('/states', (req, res) => {
    res.json({ states: indiaLocations.states });
});

// Get districts by state
router.get('/districts/:state', (req, res) => {
    const { state } = req.params;
    const districts = indiaLocations.districts[state] || [];
    res.json({ districts });
});

// Get cities by district
router.get('/cities/:district', (req, res) => {
    const { district } = req.params;
    const cities = indiaLocations.cities[district] || [];

    if (cities.length === 0) {
        res.json({
            cities: [`${district} City`, `${district} Town`, 'Other'],
            allowCustom: true
        });
    } else {
        res.json({ cities, allowCustom: true });
    }
});

// Get all location data
router.get('/all', (req, res) => {
    res.json(indiaLocations);
});

export default router;
