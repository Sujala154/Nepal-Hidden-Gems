const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const Destination = require('../models/Destination');

const destinations = [
  {
    name: 'Rara Lake',
    slug: 'rara-lake',
    location: 'Karnali Province',
    tagline: 'Nepal\'s largest lake, a pristine alpine gem',
    description: 'Experience the crystal-clear waters surrounded by pine forests and snow-capped peaks in the remote Karnali region.',
    long_description: `Rara Lake, nestled at an altitude of 2,990 meters in the remote Karnali Province, is Nepal's largest and deepest lake. This pristine alpine gem spans approximately 10.8 square kilometers and reaches depths of up to 167 meters. Surrounded by dense pine forests, snow-capped peaks, and untouched wilderness, Rara Lake offers an unparalleled experience of natural beauty and tranquility.

The journey to Rara Lake itself is an adventure, taking you through remote mountain trails, traditional villages, and diverse ecosystems. The lake's crystal-clear waters reflect the surrounding mountains, creating breathtaking mirror-like views that change with the seasons. In spring, the area bursts with colorful rhododendron blooms, while autumn brings golden hues to the forests.

The region is home to diverse wildlife including musk deer, red pandas, Himalayan black bears, and over 200 species of birds. The Rara National Park, established to protect this unique ecosystem, offers excellent opportunities for wildlife spotting and bird watching.

For those seeking adventure, the area offers trekking routes of varying difficulty, fishing opportunities, and the chance to experience authentic local culture. The nearby villages provide insights into the traditional lifestyle of the Karnali region, with opportunities to interact with local communities and learn about their customs and traditions.

Whether you're a nature enthusiast, adventure seeker, or simply looking for a peaceful retreat away from the crowds, Rara Lake promises an unforgettable experience that showcases the raw, untouched beauty of Nepal's far-western region.`,
    // Rara Lake - Nepal's largest alpine lake in Karnali Province
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&q=80',
    multiple_images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80'
    ],
    guides: [
      {
        name: 'Rajesh Thapa',
        rating: 4.8,
        email: 'rajesh.thapa@example.com',
        phone: '+977-9851234567',
        experience: '15 years of experience guiding treks in Karnali region',
        specialties: ['Trekking', 'Wildlife Photography', 'Bird Watching']
      },
      {
        name: 'Sita Gurung',
        rating: 4.9,
        email: 'sita.gurung@example.com',
        phone: '+977-9841234567',
        experience: 'Expert in Rara Lake region with deep knowledge of local culture',
        specialties: ['Cultural Tours', 'Nature Photography', 'Adventure Trekking']
      }
    ],
    difficulty: 'moderate',
    bestSeason: 'Spring and Autumn',
    rating: 4.7,
    approved: true
  },
  {
    name: 'Tsum Valley',
    slug: 'tsum-valley',
    location: 'Gorkha District',
    tagline: 'Sacred valley of ancient Buddhist culture',
    description: 'Discover hidden monasteries, traditional villages, and untouched natural beauty in this remote Himalayan valley.',
    long_description: `Tsum Valley, often referred to as the "Hidden Valley," is a sacred and remote region in northern Gorkha District that remained closed to foreigners until 2008. This mystical valley, located at altitudes ranging from 1,900 to 5,093 meters, is a treasure trove of ancient Buddhist culture, pristine natural beauty, and spiritual significance.

The valley is home to numerous ancient monasteries, chortens (Buddhist stupas), and mani walls (stone walls inscribed with Buddhist prayers) that date back centuries. The local Tsum people follow a unique culture that blends Tibetan Buddhism with ancient Bon traditions, creating a spiritual atmosphere that permeates every aspect of life here.

Tsum Valley is renowned for its "non-violence" tradition, where the local people have maintained a centuries-old practice of not killing any living beings. This has resulted in an extraordinary abundance of wildlife, including Himalayan blue sheep, musk deer, and various bird species that are remarkably tame and approachable.

The trek to Tsum Valley takes you through diverse landscapes - from subtropical forests to alpine meadows, past cascading waterfalls and alongside pristine rivers. The valley is dotted with traditional stone houses, ancient gompas (monasteries), and prayer flags that flutter in the mountain breeze.

Key highlights include the Mu Gompa, one of the oldest monasteries in the region, the Rachen Gompa with its impressive collection of Buddhist scriptures, and the opportunity to witness traditional festivals and ceremonies. The valley also offers stunning views of Ganesh Himal, Sringi Himal, and other majestic peaks.

For trekkers and spiritual seekers alike, Tsum Valley offers a rare opportunity to experience authentic Tibetan Buddhist culture in a setting of unparalleled natural beauty, making it one of Nepal's most unique and rewarding destinations.`,
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
    multiple_images: [
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80'
    ],
    guides: [
      {
        name: 'Lama Tenzin',
        rating: 5.0,
        email: 'tenzin.lama@example.com',
        phone: '+977-9861234567',
        experience: 'Local guide with deep knowledge of Tsum Valley culture and spirituality',
        specialties: ['Cultural Tours', 'Spiritual Journeys', 'Buddhist Heritage']
      },
      {
        name: 'Mingma Sherpa',
        rating: 4.7,
        email: 'mingma.sherpa@example.com',
        phone: '+977-9851234568',
        experience: 'Experienced trekking guide specializing in remote Himalayan valleys',
        specialties: ['Trekking', 'Photography Tours', 'Adventure Travel']
      }
    ],
    difficulty: 'hard',
    bestSeason: 'Spring and Autumn',
    rating: 4.9,
    approved: true
  },
  {
    name: 'Ilam',
    slug: 'ilam',
    location: 'Ilam District',
    tagline: 'Tea gardens and rolling hills',
    description: 'Explore lush tea plantations, scenic viewpoints, and the charming hill station atmosphere of eastern Nepal.',
    long_description: `Ilam, often called the "Queen of Hills" in eastern Nepal, is a picturesque hill station renowned for its sprawling tea gardens, rolling green hills, and pleasant climate. Located at an altitude of 1,600 meters, Ilam offers a refreshing escape with its cool weather, stunning mountain views, and vibrant tea culture.

The region is home to some of Nepal's finest tea estates, producing high-quality orthodox tea that is exported worldwide. Visitors can tour the tea gardens, learn about the tea-making process, and enjoy fresh, locally-grown tea while taking in panoramic views of the surrounding hills and distant mountains.

Ilam's landscape is characterized by terraced tea gardens that cascade down the hillsides, creating a mesmerizing patchwork of green. The area is also known for its diverse flora, including rare orchids, rhododendrons, and medicinal plants. The Mai Pokhari, a beautiful lake surrounded by forests, is a popular destination for nature lovers and bird watchers.

The region offers numerous viewpoints that provide spectacular sunrise and sunset views over the mountains, including Kanyam, Fikkal, and Antu Danda. These spots are perfect for photography and peaceful contemplation.

Ilam is also rich in cultural heritage, with a mix of ethnic communities including Limbu, Rai, and other indigenous groups. Visitors can experience traditional festivals, local cuisine, and handicrafts. The area is known for its production of cardamom, ginger, and other spices, adding to its agricultural charm.

Whether you're interested in tea culture, nature photography, hiking, or simply relaxing in a serene hill station atmosphere, Ilam offers a delightful experience that showcases a different side of Nepal - one of tranquility, natural beauty, and agricultural abundance.`,
    image: 'https://images.unsplash.com/photo-1500534310686-2a0f4e58d1f3?auto=format&fit=crop&w=800&q=80',
    multiple_images: [
      'https://images.unsplash.com/photo-1500534310686-2a0f4e58d1f3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80'
    ],
    guides: [
      {
        name: 'Bikash Rai',
        rating: 4.6,
        email: 'bikash.rai@example.com',
        phone: '+977-9841234569',
        experience: 'Local guide specializing in tea garden tours and cultural experiences',
        specialties: ['Tea Tours', 'Cultural Heritage', 'Nature Walks']
      },
      {
        name: 'Sangita Limbu',
        rating: 4.8,
        email: 'sangita.limbu@example.com',
        phone: '+977-9851234569',
        experience: 'Expert in Ilam region with knowledge of local traditions and cuisine',
        specialties: ['Cultural Tours', 'Photography', 'Local Cuisine']
      }
    ],
    difficulty: 'easy',
    bestSeason: 'Year-round',
    rating: 4.5,
    approved: true
  },
  {
    name: 'Upper Mustang',
    slug: 'upper-mustang',
    location: 'Mustang District',
    tagline: 'Forbidden kingdom of the Himalayas',
    description: 'Journey through ancient Tibetan culture, dramatic desert landscapes, and centuries-old cave dwellings.',
    long_description: `Upper Mustang, often called the "Last Forbidden Kingdom," is a remote and mystical region in northern Nepal that was closed to foreigners until 1992. This ancient kingdom, located in the rain shadow of the Himalayas, features dramatic desert landscapes, ancient Tibetan Buddhist culture, and a unique way of life that has remained largely unchanged for centuries.

The region's landscape is strikingly different from the rest of Nepal - think arid desert terrain, wind-sculpted cliffs, and vast expanses of barren beauty that resemble the Tibetan plateau. The Kali Gandaki River cuts through deep canyons, creating one of the world's deepest gorges, while ancient cave dwellings carved into cliff faces tell stories of civilizations long past.

Lo Manthang, the walled capital of Upper Mustang, is a living museum of Tibetan culture. The city is surrounded by a 6-meter-high wall and contains ancient palaces, monasteries, and traditional mud-brick houses. The region is home to over 100 caves, some of which contain ancient Buddhist murals and artifacts dating back over 2,000 years.

The people of Upper Mustang, known as Loba, maintain their traditional way of life, practicing Tibetan Buddhism and preserving ancient customs. The region is dotted with chortens, gompas (monasteries), and mani walls, creating a deeply spiritual atmosphere. The Tiji Festival, held annually in Lo Manthang, is one of the most important cultural events, featuring masked dances and religious ceremonies.

Upper Mustang offers some of the most unique trekking experiences in Nepal, with routes that take you through ancient trade routes, past cave complexes, and into remote villages. The region also provides stunning views of Nilgiri, Annapurna, Dhaulagiri, and other Himalayan giants.

Due to its restricted access (special permits are required), Upper Mustang remains one of Nepal's most exclusive and pristine destinations, offering visitors a rare glimpse into a world that time has largely forgotten.`,
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
    multiple_images: [
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80'
    ],
    guides: [
      {
        name: 'Pemba Gurung',
        rating: 4.9,
        email: 'pemba.gurung@example.com',
        phone: '+977-9851234570',
        experience: 'Native Mustangi guide with extensive knowledge of local culture and history',
        specialties: ['Cultural Heritage', 'Cave Exploration', 'Photography Tours']
      },
      {
        name: 'Tashi Wangyal',
        rating: 4.8,
        email: 'tashi.wangyal@example.com',
        phone: '+977-9841234570',
        experience: 'Expert trekking guide specializing in Upper Mustang region',
        specialties: ['Trekking', 'Adventure Travel', 'Buddhist Heritage']
      }
    ],
    difficulty: 'moderate',
    bestSeason: 'Spring and Autumn',
    rating: 4.8,
    approved: true
  },
  {
    name: 'Bandipur',
    slug: 'bandipur',
    location: 'Tanahun District',
    tagline: 'Preserved Newari heritage town',
    description: 'Step back in time in this beautifully preserved hilltop town with traditional architecture and stunning mountain views.',
    long_description: `Bandipur, perched on a hilltop at 1,030 meters in Tanahun District, is a beautifully preserved Newari town that offers a glimpse into Nepal's rich cultural heritage. This charming hill station, with its cobblestone streets, traditional Newari architecture, and stunning mountain views, feels like a step back in time.

The town's architecture is a testament to Newari craftsmanship, featuring intricately carved wooden windows, traditional brick buildings, and ornate temples. The main street, lined with traditional houses, shops, and temples, creates an authentic atmosphere that has remained largely unchanged for centuries.

Bandipur offers some of the most spectacular mountain views in Nepal, with panoramic vistas of the Annapurna range, Dhaulagiri, Manaslu, and Langtang peaks. The sunrise and sunset views from various viewpoints in and around the town are simply breathtaking, making it a photographer's paradise.

The town is home to several important cultural sites, including the Bindhyabasini Temple, the Mahalaxmi Temple, and the Khadga Devi Temple. The Siddha Cave, located nearby, is one of the largest caves in Nepal and offers an interesting side trip for visitors.

Bandipur's location along the ancient trade route between India and Tibet has given it a rich cultural heritage. The town hosts various festivals throughout the year, including the Dashain and Tihar celebrations, where visitors can experience traditional Newari culture, music, and dance.

The area surrounding Bandipur offers excellent opportunities for hiking, with trails leading to nearby villages, viewpoints, and natural attractions. The region is also known for its production of oranges and other fruits, adding to its agricultural charm.

For those seeking a peaceful retreat with rich cultural experiences, stunning natural beauty, and authentic Newari hospitality, Bandipur offers an ideal destination that showcases the best of Nepal's hill station culture.`,
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80',
    multiple_images: [
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80'
    ],
    guides: [
      {
        name: 'Shyam Shrestha',
        rating: 4.7,
        email: 'shyam.shrestha@example.com',
        phone: '+977-9851234571',
        experience: 'Local Newari guide with deep knowledge of Bandipur\'s history and culture',
        specialties: ['Cultural Tours', 'Heritage Walks', 'Photography']
      },
      {
        name: 'Rita Maharjan',
        rating: 4.6,
        email: 'rita.maharjan@example.com',
        phone: '+977-9841234571',
        experience: 'Expert in Newari culture and traditional architecture',
        specialties: ['Cultural Heritage', 'Architecture Tours', 'Local Cuisine']
      }
    ],
    difficulty: 'easy',
    bestSeason: 'Year-round',
    rating: 4.6,
    approved: true
  },
  {
    name: 'Khaptad National Park',
    slug: 'khaptad-national-park',
    location: 'Far-Western Province',
    tagline: 'Alpine meadows and diverse wildlife',
    description: 'Trek through pristine forests, encounter rare wildlife, and experience the tranquility of Nepal\'s far-western region.',
    long_description: `Khaptad National Park, established in 1984, is a unique and relatively unexplored protected area in Nepal's far-western region. Spanning an area of 225 square kilometers at altitudes ranging from 1,400 to 3,300 meters, the park is characterized by its rolling alpine meadows, dense forests, and rich biodiversity.

The park is named after Khaptad Baba, a renowned Hindu saint who meditated in the area for 50 years. The Khaptad Baba Ashram, located within the park, is a significant pilgrimage site that attracts devotees from across Nepal and India. The area maintains a spiritual atmosphere, with several temples and meditation spots scattered throughout.

Khaptad's landscape is unique in Nepal, featuring 22 open grasslands (patans) that create a park-like setting reminiscent of European alpine meadows. These meadows are surrounded by dense forests of rhododendron, oak, pine, and fir, creating a diverse and beautiful ecosystem. The park is particularly stunning during spring when the rhododendrons bloom in vibrant colors.

The park is home to diverse wildlife including Himalayan black bears, leopards, barking deer, wild boars, and over 270 species of birds. The area is also rich in medicinal plants and herbs, many of which are used in traditional Ayurvedic medicine.

Trekking in Khaptad offers a peaceful and relatively crowd-free experience, with well-maintained trails that take you through forests, meadows, and past traditional villages. The park provides excellent opportunities for bird watching, wildlife spotting, and nature photography.

The region experiences distinct seasons, with spring and autumn being the best times to visit. The monsoon season brings lush greenery and blooming flowers, while winter can bring snow, creating a different but equally beautiful landscape.

For nature enthusiasts, spiritual seekers, and those looking to explore a less-traveled part of Nepal, Khaptad National Park offers a unique and rewarding experience that combines natural beauty, biodiversity, and spiritual significance.`,
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80',
    multiple_images: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'
    ],
    guides: [
      {
        name: 'Hari Thakuri',
        rating: 4.5,
        email: 'hari.thakuri@example.com',
        phone: '+977-9851234572',
        experience: 'Local guide with extensive knowledge of Khaptad\'s flora and fauna',
        specialties: ['Wildlife Tours', 'Bird Watching', 'Nature Photography']
      },
      {
        name: 'Gita Joshi',
        rating: 4.7,
        email: 'gita.joshi@example.com',
        phone: '+977-9841234572',
        experience: 'Expert in Khaptad region specializing in spiritual and nature tours',
        specialties: ['Spiritual Tours', 'Trekking', 'Medicinal Plants']
      }
    ],
    difficulty: 'moderate',
    bestSeason: 'Spring and Autumn',
    rating: 4.6,
    approved: true
  }
];

async function seedDestinations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing destinations (optional - comment out if you want to keep existing data)
    // await Destination.deleteMany({});
    // console.log('✅ Cleared existing destinations');

    // Insert destinations
    for (const dest of destinations) {
      try {
        const existing = await Destination.findOne({ slug: dest.slug });
        if (existing) {
          console.log(`⏭️  Skipping ${dest.name} (already exists)`);
          continue;
        }
        
        const destination = new Destination(dest);
        await destination.save();
        console.log(`✅ Created destination: ${dest.name}`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⏭️  Skipping ${dest.name} (duplicate slug)`);
        } else {
          console.error(`❌ Error creating ${dest.name}:`, error.message);
        }
      }
    }

    console.log('\n✅ Destination seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDestinations();

