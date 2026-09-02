// Comprehensive, high-resolution Unsplash photo database & semantic search engine
export interface UnsplashPhoto {
  id: string;
  title: string;
  url: string;
  photographer: string;
  photographerUrl?: string;
  category?: string;
}

export const TOPIC_COLLECTIONS: Record<string, { tags: string[]; photos: UnsplashPhoto[] }> = {
  space: {
    tags: [
      'space', 'black hole', 'blackhole', 'black', 'hole', 'singularity', 'event horizon',
      'galaxy', 'milky way', 'cosmos', 'universe', 'astronomy', 'astrophysics', 'physics',
      'quantum', 'nebula', 'star', 'stars', 'planet', 'planets', 'moon', 'nasa', 'telescope',
      'orbit', 'solar', 'eclipse', 'interstellar', 'cosmic', 'supernova', 'void', 'deep space',
      'night sky', 'dark matter', 'starlight', 'gravity', 'constellation'
    ],
    photos: [
      { id: '1506703719100-a0f3a48c0f86', title: 'Luminous Milky Way Night Sky', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80', photographer: 'Vincentiu Solomon' },
      { id: '1502134249126-9f3755a50d78', title: 'Black Hole Singularity Space Horizon', url: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=800&q=80', photographer: 'Jeremy Thomas' },
      { id: '1451187580459-43490279c0fa', title: 'Planet Earth & Orbital Glow', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80', photographer: 'NASA' },
      { id: '1446776811953-b23d57bd21aa', title: 'Deep Space Cosmic Nebula & Void', url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80', photographer: 'NASA' },
      { id: '1538370965046-79c0d6907d47', title: 'Constellations Over Mountain Peak', url: 'https://images.unsplash.com/photo-1538370965046-79c0d6907d47?auto=format&fit=crop&w=800&q=80', photographer: 'Bryan Goff' },
      { id: '1464802686167-b939a6910659', title: 'Interstellar Galaxy Star Cluster', url: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?auto=format&fit=crop&w=800&q=80', photographer: 'Alexander Andrews' },
      { id: '1462331940025-496dfbfc7564', title: 'Galactic Deep Space Cloud', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80', photographer: 'Graham Holtshausen' },
      { id: '1447433589675-4aaa569f3e05', title: 'Green Aurora Borealis Wave', url: 'https://images.unsplash.com/photo-1447433589675-4aaa569f3e05?auto=format&fit=crop&w=800&q=80', photographer: 'Thomas Lipke' },
      { id: '1519681393784-d120267933ba', title: 'Starry Starlight Valley Peak', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80', photographer: 'Ales Nesetril' },
      { id: '1543722530-d2c3201371e7', title: 'Solar Corona & Total Eclipse', url: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?auto=format&fit=crop&w=800&q=80', photographer: 'Bryan Goff' },
      { id: '1614728894747-a83421e2b9c9', title: 'Deep Space Planetary Horizon', url: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80', photographer: 'NASA' },
      { id: '1507499739999-097706ad8914', title: 'Milky Way Observatory Panorama', url: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=800&q=80', photographer: 'Denis Degioanni' },
    ],
  },

  boredom: {
    tags: ['bore', 'bored', 'boredom', 'tired', 'sleepy', 'waiting', 'lazy', 'idle', 'monotony', 'dull', 'apathetic', 'restless', 'daydream', 'procrastination', 'exhausted'],
    photos: [
      { id: '1517486808906-6ca8b3f04846', title: 'Resting Head on Table Tired', url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80', photographer: 'Priscilla Du Preez' },
      { id: '1541199249251-f713e6145474', title: 'Bored Student Daydreaming in Classroom', url: 'https://images.unsplash.com/photo-1541199249251-f713e6145474?auto=format&fit=crop&w=800&q=80', photographer: 'Tim Gouw' },
      { id: '1509198397868-475647b2a1e5', title: 'Staring Out Window on Rainy Afternoon', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80', photographer: 'Mitchell Luo' },
      { id: '1508214751196-bcfd4ca60f91', title: 'Sitting Alone on Empty Stairs Waiting', url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80', photographer: 'Vicky Hladynets' },
      { id: '1499209974431-9dac3ada00d7', title: 'Quiet Commute Looking Out Window', url: 'https://images.unsplash.com/photo-1499209974431-9dac3ada00d7?auto=format&fit=crop&w=800&q=80', photographer: 'Marta Wave' },
      { id: '1455390582262-044cdead277a', title: 'Empty Notebook Waiting for Inspiration', url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80', photographer: 'Green Chameleon' },
      { id: '1516589178581-6cd7833ae3b2', title: 'Deep in Thought Resting Chin', url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80', photographer: 'Priscilla Du Preez' },
      { id: '1514533450685-4493e01d1fdc', title: 'Gloomy Rainy Day Reflections', url: 'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?auto=format&fit=crop&w=800&q=80', photographer: 'Ales Krivec' },
      { id: '1509281373149-e957c6296406', title: 'Vintage Clock Ticking Slowly', url: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80', photographer: 'Ksenia Chernaya' },
      { id: '1518709268805-4e9042af9f23', title: 'Moody Shadow Silhouette in Dim Room', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', photographer: 'Junior REIS' },
    ],
  },

  code: {
    tags: [
      'code', 'coding', 'developer', 'dev', 'programmer', 'programming', 'software',
      'frontend', 'backend', 'web', 'javascript', 'typescript', 'react', 'python',
      'html', 'css', 'terminal', 'tech', 'computer', 'syntax', 'algorithm', 'git',
      'hacker', 'engineering', 'debug', 'ide', 'screen', 'monitor'
    ],
    photos: [
      { id: '1555066931-4365d14bab8c', title: 'Dark Syntax Highlighted IDE Editor', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80', photographer: 'Fotis Fotopoulos' },
      { id: '1498050108023-c5249f4df085', title: 'Developer Dual Screen Setup', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80', photographer: 'Christopher Gower' },
      { id: '1526374965328-7f61d4dc18c5', title: 'Binary Matrix Data Stream Screen', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80', photographer: 'Markus Spiske' },
      { id: '1542831371-29b0f74f9713', title: 'HTML Source Code Inspection', url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80', photographer: 'Florian Olivo' },
      { id: '1518770660439-4636190af475', title: 'Microcontroller Circuit Motherboard', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', photographer: 'Alexandre Debiève' },
      { id: '1558494949-ef010cbdcc31', title: 'Cloud Server Infrastructure Racks', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80', photographer: 'Lars Knoop' },
      { id: '1517694712202-14dd9538aa97', title: 'MacBook Coding on Dark Desk', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80', photographer: 'Ilya Pavlov' },
      { id: '1607799279861-4dd421887fb3', title: 'Programming Code Terminal Stream', url: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80', photographer: 'Safwan M' },
    ],
  },

  ai: {
    tags: [
      'ai', 'robot', 'robots', 'artificial', 'intelligence', 'android', 'cyborg',
      'robotics', 'llm', 'machine', 'learning', 'neural', 'future', 'futuristic',
      'deep learning', 'automation', 'asimo', 'bot', 'sensor'
    ],
    photos: [
      { id: '1620712943543-bcc4688e7485', title: 'Deep Neural Network AI Flow', url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80', photographer: 'Google DeepMind' },
      { id: '1485827404703-89b55fcc595e', title: 'Humanoid AI Assistant Robot', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80', photographer: 'Alex Knight' },
      { id: '1546776310-eef45dd6d63c', title: 'Cybernetic Android Head Concept', url: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?auto=format&fit=crop&w=800&q=80', photographer: 'Rock' },
      { id: '1563770660941-20978e870e26', title: 'Autonomous Precision Robot Arm', url: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=800&q=80', photographer: 'Mixkit' },
      { id: '1618005182384-a83a8bd57fbe', title: 'Abstract AI Computational Mesh', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', photographer: 'Milad Fakurian' },
      { id: '1535378917042-10a22c95931a', title: 'Vintage Windup Toy Robot', url: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=800&q=80', photographer: 'Eric' },
      { id: '1677442136019-21780ecad995', title: 'Artificial Brain Neural Architecture', url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80', photographer: 'DeepMind Labs' },
    ],
  },

  nature: {
    tags: ['nature', 'forest', 'tree', 'trees', 'green', 'wood', 'woods', 'jungle', 'mountain', 'mountains', 'landscape', 'outdoor', 'outdoors', 'wilderness', 'earth', 'lake', 'river', 'waterfall', 'flora', 'hiking'],
    photos: [
      { id: '1448375240586-882707db888b', title: 'Misty Pine Forest Canopy', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80', photographer: 'Sebastian Unrau' },
      { id: '1470071459604-3b5ec3a7fe05', title: 'Foggy Mountain Peaks at Sunrise', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80', photographer: 'v2sk' },
      { id: '1506744038136-46273834b3fb', title: 'Yosemite Valley Mountain Stream', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80', photographer: 'Bailey Zindel' },
      { id: '1469474968028-56623f02e42e', title: 'Sunbeams Through Emerald Canopy', url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80', photographer: 'David Marcu' },
      { id: '1426604966848-d7adac402bff', title: 'Dramatic Green Mountain Ridges', url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=800&q=80', photographer: 'Luca Bravo' },
      { id: '1501785888041-af3ef285b470', title: 'Crystal Alpine Lake Reflections', url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80', photographer: 'Pietro De Grandi' },
      { id: '1472214103451-9374bd1c798e', title: 'Rolling Green Highlands', url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=80', photographer: 'Robert Lukeman' },
      { id: '1511497584788-87676104235f', title: 'Dense Autumn Woodland Trail', url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80', photographer: 'Luca Bravo' },
    ],
  },

  ocean: {
    tags: ['ocean', 'sea', 'beach', 'waves', 'coast', 'coastal', 'water', 'surf', 'surfing', 'island', 'tropical', 'sand', 'shore', 'pacific', 'atlantic'],
    photos: [
      { id: '1507525428034-b723cf961d3e', title: 'Turquoise Tropical Beach Paradise', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', photographer: 'Sean Oulashin' },
      { id: '1518837695005-2083093ee35b', title: 'Deep Blue Ocean Waves Aerial', url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80', photographer: 'Matt Hardy' },
      { id: '1505118380757-91f5f5632de0', title: 'Rolling Ocean Wave Barrel', url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=800&q=80', photographer: 'Jeremy Bishop' },
      { id: '1540555700478-4be289fbecef', title: 'Tropical Island Cove from Above', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', photographer: 'Rethink Design' },
      { id: '1500530855697-b586d89ba3ee', title: 'Pacific Coastline Sea Cliffs', url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80', photographer: 'Kalen Emsley' },
      { id: '1544551763-46a013bb70d5', title: 'Coral Reef Crystal Waters', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80', photographer: 'Milos Prelevic' },
    ],
  },

  coffee: {
    tags: ['coffee', 'cafe', 'espresso', 'latte', 'cappuccino', 'tea', 'morning', 'breakfast', 'barista', 'mug', 'cup', 'beans', 'brew', 'brewing'],
    photos: [
      { id: '1495474472287-4d71bcdd2085', title: 'Artisan Latte Art in Ceramic Cup', url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80', photographer: 'Nathan Dumlao' },
      { id: '1501339847302-ac426a4a7cbb', title: 'Cozy Sunlit Coffee Shop Table', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80', photographer: 'Daiga Ellaby' },
      { id: '1514432324607-a09d9b4aefdd', title: 'Specialty Chemex Pour Over Coffee', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80', photographer: 'Mike Kenneally' },
      { id: '1447933601403-0c6688de566e', title: 'Freshly Roasted Dark Coffee Beans', url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80', photographer: 'Alex Padurariu' },
      { id: '1517256064527-09c73fc73e38', title: 'Morning Coffee & Books by Window', url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80', photographer: 'Alisa Anton' },
      { id: '1498804103079-a6351b050096', title: 'Double Shot Espresso in White Cup', url: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=800&q=80', photographer: 'Demi DeHerrera' },
    ],
  },

  books: {
    tags: ['book', 'books', 'reading', 'read', 'library', 'literature', 'novel', 'study', 'studying', 'learning', 'education', 'writer', 'writing', 'author', 'pages', 'journal', 'notebook'],
    photos: [
      { id: '1497633762265-9d179a990aa6', title: 'Towering Stack of Vintage Books', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80', photographer: 'Andrew Neel' },
      { id: '1507842229440-9a74243a451e', title: 'Grand Historic Library Hallways', url: 'https://images.unsplash.com/photo-1507842229440-9a74243a451e?auto=format&fit=crop&w=800&q=80', photographer: 'Susan Q Yin' },
      { id: '1456513080510-7bf3a84b82f8', title: 'Open Hardcover Book on Desk', url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80', photographer: 'Aaron Burden' },
      { id: '1499750310107-5fef28a66643', title: 'Writer Desk with Open Journal', url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80', photographer: 'Andrew Neel' },
      { id: '1512820790803-83ca734da794', title: 'Cozy Evening Reading in Bed', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80', photographer: 'Thought Catalog' },
      { id: '1455390582262-044cdead277a', title: 'Vintage Fountain Pen & Ink Journal', url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80', photographer: 'Green Chameleon' },
    ],
  },

  city: {
    tags: ['city', 'urban', 'skyline', 'skyscraper', 'building', 'buildings', 'architecture', 'night', 'street', 'streets', 'neon', 'tokyo', 'nyc', 'london', 'metropolis', 'downtown', 'metro'],
    photos: [
      { id: '1477959858617-67f30bc75b82', title: 'Dramatic Metropolitan Skyline Dusk', url: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=800&q=80', photographer: 'Pedro Lastra' },
      { id: '1519501025264-65ba15a82390', title: 'Cyberpunk Neon Alley at Night', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80', photographer: 'Evgeny Tchebotarev' },
      { id: '1486406146926-c627a92ad1ab', title: 'Modern Glass Tower Facade', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80', photographer: 'Sean Pollock' },
      { id: '1514565131-fce0801e5785', title: 'Historic Cobblestone European Lane', url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80', photographer: 'Julia Solonina' },
      { id: '1502672260266-1c1ef2d93688', title: 'Penthouse View of City Architecture', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80', photographer: 'Patrick Perkins' },
      { id: '1517840901100-8179e982acb7', title: 'Grand Classical Building Columns', url: 'https://images.unsplash.com/photo-1517840901100-8179e982acb7?auto=format&fit=crop&w=800&q=80', photographer: 'Nikolay Vorobyev' },
    ],
  },

  business: {
    tags: ['business', 'work', 'working', 'office', 'desk', 'workspace', 'career', 'corporate', 'meeting', 'team', 'startup', 'finance', 'money', 'productivity', 'job', 'success', 'leader'],
    photos: [
      { id: '1497366216548-37526070297c', title: 'Clean Modern Studio Workspace', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', photographer: 'Redo' },
      { id: '1507238691740-187a5b1d37b8', title: 'Minimalist Workspace Setup', url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80', photographer: 'Ales Nesetril' },
      { id: '1522071820081-009f0129c71c', title: 'Creative Team Brainstorm Session', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80', photographer: 'Annie Spratt' },
      { id: '1486312338219-ce68d2c6f44d', title: 'Typing on Laptop with Coffee', url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80', photographer: 'Glenn Carstens-Peters' },
      { id: '1531403009284-440f080d1e12', title: 'Product Architecture Wireframing', url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80', photographer: 'Headway' },
      { id: '1521791136064-7986c2920216', title: 'Professional Business Handshake', url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80', photographer: 'Cytonn Photography' },
    ],
  },

  animals: {
    tags: ['animal', 'animals', 'dog', 'dogs', 'puppy', 'puppies', 'cat', 'cats', 'kitten', 'kittens', 'pet', 'pets', 'wildlife', 'bird', 'birds', 'fox', 'wolf', 'horse', 'safari'],
    photos: [
      { id: '1543466835-00a7907e9de1', title: 'Golden Retriever Smiling Puppy', url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80', photographer: 'Jamie Street' },
      { id: '1514888286974-6c03e2ca1dba', title: 'Curious Green Eyed Tabby Cat', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80', photographer: 'Mikhail Vasilyev' },
      { id: '1537151608828-ea2b11777ee8', title: 'Playful Puppy in Green Meadow', url: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80', photographer: 'Berkay Gumustekin' },
      { id: '1573865526739-10659fec78a5', title: 'Ginger Kitten Gazing Up', url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80', photographer: 'Manja Vitolic' },
      { id: '1474511320723-9a56873ee67b', title: 'Red Fox in Snowy Winter Woods', url: 'https://images.unsplash.com/photo-1474511320723-9a56873ee67b?auto=format&fit=crop&w=800&q=80', photographer: 'Ray Hennessy' },
      { id: '1555169062-013468b47731', title: 'Vibrant Tropical Macaw Plumage', url: 'https://images.unsplash.com/photo-1555169062-013468b47731?auto=format&fit=crop&w=800&q=80', photographer: 'David Clode' },
    ],
  },

  art: {
    tags: ['art', 'painting', 'design', 'creative', 'abstract', 'minimal', 'minimalism', 'color', 'colors', 'artist', 'museum', 'gallery', 'illustration', 'sculpture', 'graphic'],
    photos: [
      { id: '1579783900882-c0d3dad7b119', title: 'Vibrant Acrylic Abstract Palette', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80', photographer: 'Steve Johnson' },
      { id: '1550745165-9bc0b252726f', title: 'Retro Synthwave Neon Geometric Grid', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80', photographer: 'Lorenzo Herrera' },
      { id: '1513364776144-60967b0f800f', title: 'Modern Contemporary Art Exhibit', url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80', photographer: 'Ksenia Chernaya' },
      { id: '1541701494587-cb58502866ab', title: 'Fluid Color Marble Pigment', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80', photographer: 'Lucas Benjamin' },
      { id: '1518895949257-7621c3c786d7', title: 'Ethereal Rose Gold Gradient Mist', url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80', photographer: 'Pawel Czerwinski' },
      { id: '1600585154340-be6161a56a0c', title: 'Architectural Minimal Light Shapes', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', photographer: 'Francesca Tosolini' },
    ],
  },

  food: {
    tags: ['food', 'cooking', 'cook', 'chef', 'restaurant', 'meal', 'dinner', 'lunch', 'breakfast', 'pizza', 'burger', 'fruit', 'dessert', 'cake', 'baking', 'delicious', 'tasty', 'pasta'],
    photos: [
      { id: '1504674900247-0877df9cc836', title: 'Gourmet Culinary Plating Herb Garnishes', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80', photographer: 'Lily Banse' },
      { id: '1540420773420-3366772f4999', title: 'Fresh Healthy Mediterranean Salad Bowl', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80', photographer: 'Dan Gold' },
      { id: '1565299624946-b28f40a0ae38', title: 'Crispy Wood Fired Pepperoni Pizza', url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80', photographer: 'Chad Montano' },
      { id: '1555939594-58d7cb561ad1', title: 'Sizzling Flame Grilled Skewers', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', photographer: 'James Park' },
      { id: '1563729784474-d77dbb933a9e', title: 'Decadent Dark Chocolate Layer Cake', url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80', photographer: 'Food Photographer' },
      { id: '1498837167922-ddd27525d352', title: 'Morning Berry Smoothie Breakfast Bowl', url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80', photographer: 'Brooke Lark' },
    ],
  },

  music: {
    tags: ['music', 'song', 'audio', 'sound', 'guitar', 'piano', 'concert', 'band', 'singer', 'festival', 'stage', 'headphones', 'vinyl', 'record', 'dj', 'instrument', 'rock', 'jazz'],
    photos: [
      { id: '1511671782779-c97d3d27a1d4', title: 'Sunlit Vintage Acoustic Guitar', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80', photographer: 'Wes Hicks' },
      { id: '1470225620780-dba8ba36b745', title: 'Live Music Festival Stage Lights', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80', photographer: 'Marcela Laskoski' },
      { id: '1514525253161-7a46d19cd819', title: 'Vibrant Club Lighting & DJ Stage', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80', photographer: 'Danny Howe' },
      { id: '1539185441755-769473a23570', title: 'Retro Vinyl Turntable Needle', url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80', photographer: 'Adrian Kumpf' },
      { id: '1508700115892-45ecd05ae2ad', title: 'Studio Monitoring Headphones on Desk', url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80', photographer: 'Lee Campbell' },
      { id: '1465847899084-d164df4dedc6', title: 'Classic Grand Piano Key Close Up', url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80', photographer: 'Lorenzo Spoleti' },
    ],
  },

  people: {
    tags: ['people', 'person', 'portrait', 'face', 'human', 'friends', 'friendship', 'woman', 'man', 'girl', 'boy', 'lifestyle', 'fashion', 'model', 'smile', 'happy', 'love', 'community'],
    photos: [
      { id: '1534528741775-53994a69daeb', title: 'Studio Expressive Portrait Woman', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80', photographer: 'Joseph Gonzalez' },
      { id: '1507003211169-0a1dd7228f2d', title: 'Joyful Smiling Portrait Man', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80', photographer: 'Jonas Kakaroto' },
      { id: '1517841905240-472988babdf9', title: 'Urban Street Style Portrait', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80', photographer: 'Valerie Elash' },
      { id: '1539571696357-5a69c17a67c6', title: 'Thoughtful Young Man in City', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80', photographer: 'Ayo Ogunseinde' },
      { id: '1524504388940-b1c1722653e1', title: 'Golden Hour Natural Sunlit Portrait', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80', photographer: 'Michael Dam' },
      { id: '1506794778202-cad84cf45f1d', title: 'Striking Expressive Monochrome Portrait', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80', photographer: 'Albert Dera' },
    ],
  },

  dark: {
    tags: ['dark', 'black', 'shadow', 'shadows', 'night', 'noir', 'monochrome', 'moody', 'silhouette', 'contrast', 'low light', 'gloomy'],
    photos: [
      { id: '1518709268805-4e9042af9f23', title: 'Moody Shadow Silhouette in Dim Room', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', photographer: 'Junior REIS' },
      { id: '1509281373149-e957c6296406', title: 'Vintage Clock Ticking in the Dark', url: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80', photographer: 'Ksenia Chernaya' },
      { id: '1514533450685-4493e01d1fdc', title: 'Dark Foggy Alley Reflections', url: 'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?auto=format&fit=crop&w=800&q=80', photographer: 'Ales Krivec' },
      { id: '1506794778202-cad84cf45f1d', title: 'Striking Noir Shadow Portrait', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80', photographer: 'Albert Dera' },
      { id: '1550745165-9bc0b252726f', title: 'Neon Glow in Total Darkness', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80', photographer: 'Lorenzo Herrera' },
    ],
  },

  travel: {
    tags: ['travel', 'traveling', 'trip', 'journey', 'adventure', 'vacation', 'holiday', 'explore', 'exploring', 'hotel', 'resort', 'flight', 'airplane', 'tourist', 'tourism', 'destination'],
    photos: [
      { id: '1590490360182-c33d57733427', title: 'Luxury Boutique Suite Balcony', url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80', photographer: 'visualsofdana' },
      { id: '1566073771259-6a8506099945', title: 'Sunlit Mediterranean Coastal Balcony', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', photographer: 'Manuel Moreno' },
      { id: '1571896349842-33c89424de2d', title: 'Infinity Pool Mountain Horizon', url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80', photographer: 'Keyvan Mansouri' },
      { id: '1582719478250-c89cae4dc85b', title: 'Minimalist Modern Hotel Bedroom', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', photographer: 'Sasha Kaunas' },
      { id: '1520250497591-112f2f40a3f4', title: 'Alpine Chalet Mountain Resort', url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80', photographer: 'Alexander Kaunas' },
      { id: '1542314831-068cd1dbfeeb', title: 'Cozy Fireplace Suite View', url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80', photographer: 'Marta Dzedyshko' },
    ],
  },
};

// Master pool for dynamic hash generation
const MASTER_DIVERSE_POOL: UnsplashPhoto[] = Object.values(TOPIC_COLLECTIONS).flatMap((c) => c.photos);

// Normalization function to clean and stem terms
function normalizeTerm(term: string): string {
  return term
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Searches the Unsplash database using semantic matching, tag relevance,
 * and deterministic diverse fallback when no exact collection matches.
 */
export async function searchUnsplash(query: string): Promise<UnsplashPhoto[]> {
  const raw = query.trim().toLowerCase();
  if (!raw) {
    return TOPIC_COLLECTIONS.space.photos.concat(TOPIC_COLLECTIONS.nature.photos);
  }

  // 1. Check if direct Unsplash API key is available
  const accessKey =
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_ACCESS_KEY
      : undefined;

  if (accessKey) {
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(raw)}&per_page=24&client_id=${accessKey}`,
        { headers: { 'Accept-Version': 'v1' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          return data.results.map((p: any) => ({
            id: p.id,
            title: p.description || p.alt_description || `${raw} photo`,
            url: p.urls?.regular || p.urls?.small,
            photographer: p.user?.name || 'Unsplash Contributor',
            photographerUrl: p.user?.links?.html,
          }));
        }
      }
    } catch (_) {
      // Fall through
    }
  }

  // 2. When in browser without direct client access key, query our internal API route
  if (typeof window !== 'undefined') {
    try {
      const apiRes = await fetch(`/api/unsplash?q=${encodeURIComponent(raw)}`);
      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data.results && data.results.length > 0) {
          return data.results;
        }
      }
    } catch (_) {
      // Fall through to semantic engine
    }
  }

  const queryWords = raw.split(/\s+/).map(normalizeTerm).filter(Boolean);
  const normalizedRaw = normalizeTerm(raw);

  // 2. Score topic collections based on tag matches, phrases, and word stems
  const collectionScores: { key: string; score: number }[] = [];

  for (const [key, collection] of Object.entries(TOPIC_COLLECTIONS)) {
    let score = 0;

    // Direct collection key match
    if (key === raw || key === normalizedRaw) {
      score += 50;
    } else if (key.includes(normalizedRaw) || normalizedRaw.includes(key)) {
      score += 25;
    }

    for (const tag of collection.tags) {
      const normTag = normalizeTerm(tag);
      const tagWords = tag.toLowerCase().split(/\s+/).map(normalizeTerm).filter(Boolean);

      // Exact multi-word tag match (e.g. "black hole" in "black hole")
      if (tag.toLowerCase() === raw || normTag === normalizedRaw) {
        score += 80;
      } else if (normTag.includes(normalizedRaw) || normalizedRaw.includes(normTag)) {
        if (normalizedRaw.length >= 4) score += 30;
      }

      // Word-level matching
      for (const word of queryWords) {
        if (tagWords.includes(word)) {
          score += 20;
        } else if (normTag === word) {
          score += 15;
        } else if (normTag.startsWith(word) || word.startsWith(normTag)) {
          score += 10;
        } else if (normTag.includes(word)) {
          if (word.length >= 3) score += 5;
        }
      }
    }

    if (score > 0) {
      collectionScores.push({ key, score });
    }
  }

  // Sort matched collections by relevance score
  collectionScores.sort((a, b) => b.score - a.score);

  if (collectionScores.length > 0 && collectionScores[0].score >= 10) {
    const topKey = collectionScores[0].key;
    const topCollection = TOPIC_COLLECTIONS[topKey].photos;

    // If runner up collections also scored high, append them
    let combined = [...topCollection];
    for (let i = 1; i < collectionScores.length && i < 3; i++) {
      if (collectionScores[i].score >= 20) {
        combined = combined.concat(TOPIC_COLLECTIONS[collectionScores[i].key].photos);
      }
    }
    return combined;
  }

  // 3. Fallback: Seeded selection
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);
  const poolLen = MASTER_DIVERSE_POOL.length;

  const capitalized = raw.charAt(0).toUpperCase() + raw.slice(1);
  const selected: UnsplashPhoto[] = [];

  for (let i = 0; i < 18; i++) {
    const idx = (positiveHash + i * 7) % poolLen;
    const basePhoto = MASTER_DIVERSE_POOL[idx];
    selected.push({
      ...basePhoto,
      title: `${capitalized} — ${basePhoto.title}`,
    });
  }

  return selected;
}
