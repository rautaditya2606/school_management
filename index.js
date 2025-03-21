require('dotenv').config();
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const School = require('./models/school');
const calculateDistance = require('./utils/distance');
const { schoolSchema, locationSchema } = require('./middleware/validation');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// EJS configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);
app.set('layout', 'layout');  // Changed from './layout' to 'layout'

// Render home page
app.get('/', (req, res) => {
    res.render('home', {
        title: 'School Management System'
    });
});

// Render add school form
app.get('/add', (req, res) => {
    res.render('addSchool', {
        title: 'Add New School'
    });
});

// Handle form submission
app.post('/addSchool', async (req, res) => {
    try {
        const { error } = schoolSchema.validate(req.body);
        if (error) {
            return res.render('addSchool', {
                title: 'Add New School',
                error: error.details[0].message
            });
        }

        const result = await School.create(req.body);
        res.redirect('/list');
    } catch (err) {
        res.render('addSchool', {
            title: 'Add New School',
            error: 'Internal server error'
        });
    }
});

// Render schools list
app.get('/list', async (req, res) => {
    try {
        const { latitude, longitude } = req.query;
        const schools = await School.getAll();

        if (latitude && longitude) {
            const schoolsWithDistance = schools.map(school => ({
                ...school,
                distance: {
                    value: parseFloat(calculateDistance(
                        Number(latitude),
                        Number(longitude),
                        Number(school.latitude),
                        Number(school.longitude)
                    ).toFixed(2)),
                    unit: 'kilometers'
                }
            }));
            schoolsWithDistance.sort((a, b) => a.distance.value - b.distance.value);

            res.render('listSchools', {
                title: 'Schools List',
                schools: schoolsWithDistance,
                userLocation: { latitude, longitude }
            });
        } else {
            res.render('listSchools', {
                title: 'Schools List',
                schools,
                userLocation: null
            });
        }
    } catch (err) {
        res.render('error', {
            title: 'Error',
            error: err.message
        });
    }
});

// Keep API endpoints for backward compatibility
app.post('/addSchool', async (req, res) => {
    try {
        const { error } = schoolSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const result = await School.create(req.body);
        res.status(201).json({ message: 'School added successfully', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/', (req, res) => {
    res.json({
        name: "School Management API",
        version: "1.0.0",
        endpoints: {
            listSchools: {
                url: "/listSchools",
                method: "GET",
                params: {
                    latitude: "number (-90 to 90)",
                    longitude: "number (-180 to 180)"
                },
                example: "/listSchools?latitude=51.5074&longitude=-0.1278"
            },
            addSchool: {
                url: "/addSchool",
                method: "POST",
                body: {
                    name: "string",
                    address: "string",
                    latitude: "number",
                    longitude: "number"
                }
            }
        }
    });
});

app.get('/listSchools', async (req, res) => {
    try {
        const userLat = Number(req.query.latitude);
        const userLng = Number(req.query.longitude);

        // Input validation
        if (!userLat || !userLng || isNaN(userLat) || isNaN(userLng)) {
            return res.status(400).json({
                error: "Invalid or missing parameters",
                usage: {
                    endpoint: "/listSchools",
                    method: "GET",
                    parameters: {
                        latitude: "number (-90 to 90)",
                        longitude: "number (-180 to 180)"
                    },
                    example: "/listSchools?latitude=51.5074&longitude=-0.1278"
                }
            });
        }

        const schools = await School.getAll();
        console.log('Retrieved schools:', schools); // Debug log

        if (!Array.isArray(schools)) {
            throw new Error('Failed to retrieve schools data');
        }

        const schoolsWithDistance = schools.map(school => ({
            id: school.id,
            name: school.name,
            address: school.address,
            coordinates: {
                latitude: Number(school.latitude),
                longitude: Number(school.longitude)
            },
            distance: {
                value: parseFloat(calculateDistance(
                    userLat,
                    userLng,
                    Number(school.latitude),
                    Number(school.longitude)
                ).toFixed(2)),
                unit: "kilometers"
            }
        }));

        schoolsWithDistance.sort((a, b) => a.distance.value - b.distance.value);

        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            userLocation: {
                latitude: userLat,
                longitude: userLng
            },
            results: {
                count: schoolsWithDistance.length,
                schools: schoolsWithDistance
            }
        });
    } catch (err) {
        console.error('List schools error:', err);
        res.status(500).json({ 
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
