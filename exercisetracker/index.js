const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI);

const { Schema } = mongoose;

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
});

const exerciseSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: Date, required: true },
});

const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

app.post('/api/users', async (req, res) => {
    try {
        const { username } = req.body;
        const newUser = new User({ username });
        await newUser.save();
        res.json({ username: newUser.username, _id: newUser._id });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/api/users/:_id/exercises', async (req, res) => {
    try {
        const { _id } = req.params;
        const { description, duration, date } = req.body;

        const user = await User.findById(_id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const exercise = new Exercise({
            userId: _id,
            description,
            duration,
            date: date ? new Date(date) : new Date(),
        });

        await exercise.save();

        res.json({
            username: user.username,
            description: exercise.description,
            duration: exercise.duration,
            date: exercise.date.toDateString(),
            _id: user._id,
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/api/users/:_id/logs', async (req, res) => {
    try {
        const { _id } = req.params;
        const { from, to, limit } = req.query;

        const user = await User.findById(_id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        let query = { userId: _id };
        if (from) query.date = { ...query.date, $gte: new Date(from) };
        if (to) query.date = { ...query.date, $lte: new Date(to) };

        const exercises = await Exercise.find(query)
            .limit(parseInt(limit))
            .exec();

        res.json({
            username: user.username,
            count: exercises.length,
            _id: user._id,
            log: exercises.map((e) => ({
                description: e.description,
                duration: e.duration,
                date: e.date.toDateString(),
            })),
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port);
});
