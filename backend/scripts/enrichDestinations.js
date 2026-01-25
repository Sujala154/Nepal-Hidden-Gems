const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const Destination = require('../models/Destination');

const enrichmentData = {
  'rara-lake': {
    specialty: 'The scenery at Rara Lake is unmatched. The crystal-clear blue water reflects the surrounding snow-capped peaks of the Himalayas like a giant mirror. The lake is surrounded by the Rara National Park, home to dense forests of blue pine, spruce, and cedar. Walking around the lake shore offers varying vistas of deep turquoise waters and emerald green forests.',
    hospitality: 'The people of the Karnali region are known for their resilience and warm, authentic hospitality. Visitors often enjoy local "Marsi" rice, a unique red rice variety grown at high altitudes, served with local beans (Simmi) and organic vegetables. The culture is deeply rooted in Khas traditions, and you might hear local folk songs during evening gatherings around a fire.',
    accommodation: 'Accommodation consists mainly of community-run lodges and camping sites near the lake. The "Village Heritage Resort" and "Danfe Guest House" are popular choices. Prices range from NPR 1,500 to 3,500 per night for basic but comfortable rooms. For a more luxury experience, some specialized tented camps offer better amenities at around NPR 5,000 to 8,000.'
  },
  'tsum-valley': {
    specialty: 'Tsum Valley is a "Hidden Valley" where time stands still. The scenery features dramatic canyons, ancient Buddhist monasteries carved into cliffs, and the majestic Ganesh Himal range. The valley is famous for being a "Non-Violence Zone" where hunting and slaughtering animals have been forbidden for centuries, leading to a peaceful atmosphere where wildlife thrive alongside humans.',
    hospitality: 'The Tsum people (Tsumbas) are remarkably friendly and spiritual. You will be welcomed with butter tea and "Tsampa" (roasted barley flour). A must-try is the local salt tea and traditional Tibetan bread. The culture is deeply Buddhist, with many local festivals involving masked dances and prayer ceremonies at Mu Gompa.',
    accommodation: 'Lodging is provided in simple teahouses and monastery guesthouses. Places like the "Mu Gompa Guest House" offer a unique spiritual stay. Prices are generally low, around NPR 1,000 to 2,500, including basic meals. It is common to stay in home-stays where you live with a local family for a truly immersive experience.'
  },
  'ilam': {
    specialty: 'Ilam is famous for its rolling hills covered in emerald green tea plantations. The scenery at Kanyam and Fikkal is particularly beautiful during sunrise, with views extending to Mount Kanchenjunga. The "Antu Danda" viewpoint offers one of the best sunrises in eastern Nepal. The mist rolling over the tea gardens creates a fairy-tale-like atmosphere.',
    hospitality: 'The local people, including the Limbu and Rai communities, are incredibly welcoming. Food here is a highlight - try the "Akabare Khursani" (hot cherry pepper) and "Chhurpi" (hard cheese). Local tea is, of course, a daily ritual. You can participate in tea-plucking activities and learn about the orthodox tea-making process from the locals.',
    accommodation: 'Ilam offers a wide range of accommodation from luxury tea garden resorts to cozy home-stays. "Ilam Tea Garden Resort" is a high-end option (NPR 5,000 - 10,000), while numerous home-stays in Antu and Kanyam offer a warm local stay for NPR 1,200 - 2,500 per night.'
  },
  'upper-mustang': {
    specialty: 'The scenery of Upper Mustang is often compared to a lunar landscape. It features wind-eroded red sandstone cliffs, deep gorges, and arid plateau terrain. The ancient walled city of Lo Manthang is a architectural marvel. You can find "Sky Caves" - thousands of ancient man-made caves dug into the cliff sides that were used for burial and habitation.',
    hospitality: 'The "Lobas" (people of Mustang) follow ancient Tibetan traditions. They are known for their hospitality and strong sense of community. Traditional food includes "Thukpa" (noodle soup), "Momos", and local yak meat specialties. Salt-butter tea is a staple here, often served with roasted barley.',
    accommodation: 'Accommodation in Lo Manthang and surrounding villages has improved greatly, with several comfortable hotels like "Royal Mustang Resort" (NPR 15,000+) and more affordable teahouses like "Mystic Manthang" (NPR 3,000 - 5,000). Due to the remote nature, prices are slightly higher than in central Nepal.'
  },
  'bandipur': {
    specialty: 'Bandipur is a living museum of Newari culture. The scenery from the hilltop offers a 180-degree view of the central Himalayas, including Dhaulagiri, Annapurna, and Manaslu. The cobblestone streets and traditional brick houses with carved wooden windows give it a European-village-like charm, but with distinctly Nepalese aesthetics.',
    hospitality: 'The Newari community in Bandipur is world-renowned for their hospitality and elaborate cuisine. Try the "Samay Baji" platter, "Yomari", and "Choila". Life here moved at a slower pace, and locals are happy to share stories of the town\'s history as a major trade hub between India and Tibet.',
    accommodation: 'Bandipur has some of the most charming boutique hotels in Nepal. "The Old Inn" is a beautifully restored heritage home (NPR 8,000 - 12,000). There are also many budget-friendly guest houses like "Bandipur Guest House" and "Hotel Gaaun Ghar" ranging from NPR 2,000 to 4,500.'
  },
  'khaptad-national-park': {
    specialty: 'The landscape of Khaptad is unique for its 22 rolling alpine meadows (Patans). During spring, these meadows are covered in a carpet of wildflowers. The scenery includes dense forests of rhododendron and oak, and the sacred Khaptad Lake. The area is incredibly peaceful, as it is one of the least visited national parks in Nepal.',
    hospitality: 'Khaptad is a sacred place, formerly the home of the Khaptad Baba. The few locals and army personnel are extremely helpful. Food is basic and organic, mostly consisting of "Dal Bhat" with local herbs. It\'s a place for spiritual reflection, and you might meet pilgrims traveling to the Sahasra Linga.',
    accommodation: 'Accommodation is very limited and basic. There is a "Khaptad Home-stay" and a few guest houses run by the national park. Prices are very low (NPR 1,000 - 2,000) as it is not a commercialized area. Most serious trekkers prefer camping in the beautiful meadows.'
  }
};

async function enrichDestinations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    for (const [slug, data] of Object.entries(enrichmentData)) {
      const result = await Destination.findOneAndUpdate(
        { slug: slug },
        { 
          $set: { 
            specialty: data.specialty,
            hospitality: data.hospitality,
            accommodation: data.accommodation
          } 
        },
        { new: true }
      );

      if (result) {
        console.log(`✅ Enriched ${result.name}`);
      } else {
        console.log(`❌ Could not find destination with slug: ${slug}`);
      }
    }

    console.log('\n✅ Enrichment completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Enrichment error:', error);
    process.exit(1);
  }
}

enrichDestinations();
