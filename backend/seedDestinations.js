const mongoose = require('mongoose');
const Destination = require('./models/Destination');
require('dotenv').config();

const destinations = [
    {
        slug: 'rara-lake',
        name: 'Rara Lake',
        tagline: 'Nepal\'s largest lake, a pristine alpine gem',
        description: 'Experience the crystal-clear waters surrounded by pine forests and snow-capped peaks in the remote Karnali region.',
        long_description: 'Rara Lake is the biggest and deepest fresh water lake in the Nepal Himalayas. It is the main feature of Rara National Park, located in Jumla and Mugu Districts.',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96',
        location: 'Karnali Province',
        approved: true
    },
    {
        slug: 'tsum-valley',
        name: 'Tsum Valley',
        tagline: 'Sacred valley of ancient Buddhist culture',
        description: 'Discover hidden monasteries, traditional villages, and untouched natural beauty in this remote Himalayan valley.',
        long_description: 'The Tsum Valley is a sacred Himalayan pilgrimage valley situated in northern Gorkha, Nepal. It is known as the "Hidden Valley".',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa',
        location: 'Gorkha District',
        approved: true
    },
    {
        slug: 'ilam',
        name: 'Ilam',
        tagline: 'Tea gardens and rolling hills',
        description: 'Explore lush tea plantations, scenic viewpoints, and the charming hill station atmosphere of eastern Nepal.',
        long_description: 'Ilam is famous for its tea. It is a beautiful hill station in eastern Nepal.',
        image: 'https://images.unsplash.com/photo-1500534310686-2a0f4e58d1f3',
        location: 'Ilam District',
        approved: true
    },
    {
        slug: 'upper-mustang',
        name: 'Upper Mustang',
        tagline: 'Forbidden kingdom of the Himalayas',
        description: 'Journey through ancient Tibetan culture, dramatic desert landscapes, and centuries-old cave dwellings.',
        long_description: 'Upper Mustang is an arid river valley that runs north from Annapurna. It retains a traditional Tibetan culture.',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa',
        location: 'Mustang District',
        approved: true
    },
    {
        slug: 'bandipur',
        name: 'Bandipur',
        tagline: 'Preserved Newari heritage town',
        description: 'Step back in time in this beautifully preserved hilltop town with traditional architecture and stunning mountain views.',
        long_description: 'Bandipur is a hilltop settlement in Tanahun District. It is known for its Newari culture and architecture.',
        image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429',
        location: 'Tanahun District',
        approved: true
    },
    {
        slug: 'khaptad-national-park',
        name: 'Khaptad National Park',
        tagline: 'Alpine meadows and diverse wildlife',
        description: 'Trek through pristine forests, encounter rare wildlife, and experience the tranquility of Nepal\'s far-western region.',
        long_description: 'Khaptad National Park is a protected area in the Far-Western Region, Nepal. It stretches over four districts.',
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
        location: 'Far-Western Province',
        approved: true
    }
];

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        for (const dest of destinations) {
            await Destination.findOneAndUpdate({ slug: dest.slug }, dest, { upsert: true, new: true });
            console.log(`Upserted: ${dest.name}`);
        }
        console.log('Seeding complete');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
