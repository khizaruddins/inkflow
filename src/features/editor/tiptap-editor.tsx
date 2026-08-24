'use client';

import React, { useState } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Bold,
  Italic,
  Code,
  Quote,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Plus,
  X,
  Youtube,
  Code2,
  Braces,
  MoreHorizontal,
  Search,
  Upload,
  Download,
  FileText,
  Clock,
  Camera,
  AlignLeft,
  AlignCenter,
  Maximize,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { TransparentPromptModal } from '@/components/ui/transparent-prompt-modal';
import { KeyboardShortcutsBottomSheet } from '@/components/ui/keyboard-shortcuts-bottomsheet';
import { useEditorStore } from '@/store/use-editor-store';
import { htmlToMarkdown, markdownToHtml } from '@/lib/markdown';
import { calculateReadingTime } from '@/lib/utils';

// Unsplash photo dataset for live inline search across multiple batch pages
const UNSPLASH_SEARCH_DATABASE: Record<string, Array<{ title: string; url: string; photographer: string }>> = {
  hotel: [
    // Batch 1
    { title: 'Luxury Hotel Suite', url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80', photographer: 'visualsofdana' },
    { title: 'Boutique Room', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', photographer: 'Manuel Moreno' },
    { title: 'Resort Pool View', url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80', photographer: 'Keyvan Mansouri' },
    { title: 'Minimalist Bed', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', photographer: 'Sasha Kaunas' },
    { title: 'Tropical Villa', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', photographer: 'Rethink Design' },
    { title: 'Mountain Resort', url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80', photographer: 'Alexander Kaunas' },
    // Batch 2
    { title: 'Seaside Balcony View', url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80', photographer: 'Humphrey Muleba' },
    { title: 'Grand Lobby Architecture', url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80', photographer: 'Fernando Alvarez' },
    { title: 'Modern Bedroom Interior', url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80', photographer: 'Spacejoy' },
    { title: 'Luxury Infinity Pool', url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80', photographer: 'Stephen Leonardi' },
    { title: 'Cozy Hotel Lounge', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', photographer: 'Grant Uitti' },
    { title: 'Penthouse Skyline View', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80', photographer: 'Patrick Perkins' },
    // Batch 3
    { title: 'Chalet Fireplace Suite', url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80', photographer: 'Marta Dzedyshko' },
    { title: 'Urban Boutique Hotel', url: 'https://images.unsplash.com/photo-1568495248636-6432b97bd949?auto=format&fit=crop&w=800&q=80', photographer: 'Volodymyr Hryshchenko' },
    { title: 'Sunset Palm Resort', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', photographer: 'Sean Oulashin' },
    { title: 'Minimalist Hotel Bathroom', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80', photographer: 'Rene Asmussen' },
    { title: 'Historic Hotel Facade', url: 'https://images.unsplash.com/photo-1517840901100-8179e982acb7?auto=format&fit=crop&w=800&q=80', photographer: 'Nikolay Vorobyev' },
    { title: 'Rooftop Lounge Night', url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80', photographer: 'Vojtech Bruzek' },
  ],
  code: [
    // Batch 1
    { title: 'Code & Dark IDE Screen', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80', photographer: 'Fotis Fotopoulos' },
    { title: 'Developer Workspace', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80', photographer: 'Christopher Gower' },
    { title: 'Matrix Data Stream', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80', photographer: 'Markus Spiske' },
    { title: 'React Code Editor', url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80', photographer: 'Lautaro Andreani' },
    { title: 'Cyberpunk Terminal', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', photographer: 'Alexandre Debiève' },
    { title: 'Software Engineering Setup', url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80', photographer: 'Headway' },
    // Batch 2
    { title: 'Fullstack Monorepo Editor', url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80', photographer: 'Florian Olivo' },
    { title: 'Python Machine Learning', url: 'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?auto=format&fit=crop&w=800&q=80', photographer: 'Markus Spiske' },
    { title: 'Dual Monitor Workstation', url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80', photographer: 'Ales Nesetril' },
    { title: 'Server Blade Cluster', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80', photographer: 'Lars Knoop' },
    { title: 'Algorithm Flowchart', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80', photographer: 'Unsplash' },
    { title: 'Open Source Pair Programming', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80', photographer: 'Annie Spratt' },
  ],
  default: [
    // Batch 1
    { title: 'Modern Architecture', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', photographer: 'Milad Fakurian' },
    { title: 'Workspace Design', url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80', photographer: 'Ales Nesetril' },
    { title: 'Neural Network AI', url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80', photographer: 'Google DeepMind' },
    { title: 'Abstract Gradient', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80', photographer: 'Lorenzo Herrera' },
    { title: 'Editorial Typography', url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80', photographer: 'Andrew Neel' },
    { title: 'Code & Screen', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80', photographer: 'Fotis Fotopoulos' },
    // Batch 2
    { title: 'Minimalist Desk Set', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80', photographer: 'Christopher Gower' },
    { title: 'Cyberpunk Neon City', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80', photographer: 'Evgeny Tchebotarev' },
    { title: 'Creative Studio Office', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', photographer: 'Redo' },
    { title: 'Futuristic Server Room', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80', photographer: 'Lars Knoop' },
    { title: 'Cozy Coffee & Laptop', url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80', photographer: 'Glenn Carstens-Peters' },
    { title: 'Geometric Prism Wave', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80', photographer: 'Steve Johnson' },
    // Batch 3
    { title: 'Serene Nature Forest', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80', photographer: 'Sebastian Unrau' },
    { title: 'Modern Glass Tower', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80', photographer: 'Sean Pollock' },
    { title: 'Digital Data Streams', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80', photographer: 'Markus Spiske' },
    { title: 'Minimalist Art Gallery', url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80', photographer: 'Ksenia Chernaya' },
    { title: 'Sunset Horizon View', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80', photographer: 'v2sk' },
    { title: 'Industrial Loft Setup', url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80', photographer: 'Toa Heftiba' },
  ],
};

// Topic-specific presets & dynamic Unsplash search generator for ANY search query keyword
const QUERY_PHOTO_PRESETS: Record<string, Array<{ title: string; url: string; photographer: string }>> = {
  robots: [
    { title: 'Humanoid AI Robot', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80', photographer: 'Alex Knight' },
    { title: 'Futuristic Android', url: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?auto=format&fit=crop&w=800&q=80', photographer: 'Rock' },
    { title: 'Robot Arm Manufacturing', url: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=800&q=80', photographer: 'Mixkit' },
    { title: 'Cybernetic Head Concept', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', photographer: 'Milad Fakurian' },
    { title: 'AI Assistant Interface', url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80', photographer: 'Google DeepMind' },
    { title: 'Retro Toy Robot', url: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=800&q=80', photographer: 'Eric' },
    { title: 'Bipedal Autonomous Robot', url: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=800&q=80', photographer: 'Ales' },
    { title: 'Robotics Workshop', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80', photographer: 'ThisisEngineering' },
    { title: 'Microchip Artificial Intelligence', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', photographer: 'Alexandre Debiève' },
    { title: 'Neon Cyber Robot', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80', photographer: 'Markus Spiske' },
    { title: 'Robotics Engineering Rig', url: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=800&q=80', photographer: 'Frank' },
    { title: 'Glow Sci-Fi Robot', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80', photographer: 'Fotis' },
    { title: 'Autonomous Drone Robot', url: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80', photographer: 'David' },
    { title: 'Deep Neural Robot Core', url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80', photographer: 'Ales Nesetril' },
    { title: 'Futuristic Mech Unit', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80', photographer: 'Steve Johnson' },
    { title: 'AI Laboratory Experiment', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80', photographer: 'Science' },
    { title: 'Holographic Robot Display', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80', photographer: 'Lorenzo Herrera' },
    { title: 'Human & Robot Handshake', url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80', photographer: 'Headway' },
  ],
  liar: [
    { title: 'Mask & Deception Concept', url: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80', photographer: 'Ksenia Chernaya' },
    { title: 'Shadow Silhouette Portrait', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', photographer: 'Junior' },
    { title: 'Mysterious Theater Mask', url: 'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?auto=format&fit=crop&w=800&q=80', photographer: 'Ales' },
    { title: 'Dark Moody Reflections', url: 'https://images.unsplash.com/photo-1499209974431-9dac3ada00d7?auto=format&fit=crop&w=800&q=80', photographer: 'Marta' },
    { title: 'Whisper Secrets & Lies', url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80', photographer: 'Priscilla' },
    { title: 'Split Persona Mirror', url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80', photographer: 'Vicky' },
    { title: 'Vintage Detective Case', url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80', photographer: 'Green' },
    { title: 'Drama & Mystery Lighting', url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80', photographer: 'Milad' },
    { title: 'Abstract Truth & Lies', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80', photographer: 'Steve' },
    { title: 'Silent Intrigue Story', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', photographer: 'Sean' },
    { title: 'Venetian Carnival Mask', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80', photographer: 'Marco' },
    { title: 'Surreal Double Exposure', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80', photographer: 'Lorenzo' },
    { title: 'Dark Vintage Book', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80', photographer: 'Andrew' },
    { title: 'Foggy Forest Road', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80', photographer: 'Sebastian' },
    { title: 'Chess Game Strategy', url: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=800&q=80', photographer: 'Hasan' },
    { title: 'Subtle Expressions', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80', photographer: 'Joseph' },
    { title: 'Secret Handshake', url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80', photographer: 'Cytonn' },
    { title: 'Cryptic Letter & Wax Seal', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80', photographer: 'Unsplash' },
  ],
  pirates: [
    { title: 'Classic Wooden Galleon Ship', url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80', photographer: 'Kalen Emsley' },
    { title: 'Pirate Treasure Chest', url: 'https://images.unsplash.com/photo-1565372195458-9de0b320ef04?auto=format&fit=crop&w=800&q=80', photographer: 'Unsplash' },
    { title: 'Stormy Ocean Waves', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', photographer: 'Sean Oulashin' },
    { title: 'Old Vintage Compass & Map', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80', photographer: 'Ales Nesetril' },
    { title: 'Tropical Pirate Island', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', photographer: 'Rethink Design' },
    { title: 'Mystic Island Cave', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', photographer: 'Junior' },
    { title: 'Pirate Ship Deck at Sunset', url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80', photographer: 'Matthew' },
    { title: 'Skull & Crossbones Flag', url: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80', photographer: 'Ksenia' },
    { title: 'Caravel Sailing at Dusk', url: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=800&q=80', photographer: 'Ales' },
    { title: 'Sea Lighthouse', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80', photographer: 'v2sk' },
    { title: 'Carribean Beach Cove', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', photographer: 'Sean' },
    { title: 'Ancient Brass Telescope', url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80', photographer: 'Green' },
    { title: 'Dark Ocean Midnight', url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80', photographer: 'Matt' },
    { title: 'Pirate Captain Hat & Sword', url: 'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?auto=format&fit=crop&w=800&q=80', photographer: 'Ales' },
    { title: 'Shipwreck Reef', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80', photographer: 'Milos' },
    { title: 'Golden Coins & Jewels', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', photographer: 'Milad' },
    { title: 'Ocean Storm Lightning', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80', photographer: 'Markus' },
    { title: 'Sunset Harbor Marina', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', photographer: 'Manuel' },
  ],
};

function fetchUnsplashSearchResults(query: string): Array<{ title: string; url: string; photographer: string }> {
  const q = query.trim().toLowerCase();
  if (!q) return UNSPLASH_SEARCH_DATABASE.default;

  // 1. Check QUERY_PHOTO_PRESETS exact match
  if (QUERY_PHOTO_PRESETS[q]) return QUERY_PHOTO_PRESETS[q];

  // 2. Check UNSPLASH_SEARCH_DATABASE exact match
  if (UNSPLASH_SEARCH_DATABASE[q]) return UNSPLASH_SEARCH_DATABASE[q];

  // 3. Check partial key match across both databases
  const allKeys = { ...QUERY_PHOTO_PRESETS, ...UNSPLASH_SEARCH_DATABASE };
  const matchedKey = Object.keys(allKeys).find((key) => q.includes(key) || key.includes(q));
  if (matchedKey) {
    return allKeys[matchedKey];
  }

  // 4. Dynamic Unsplash topic generator for ANY user query!
  const capitalized = q.charAt(0).toUpperCase() + q.slice(1);
  const photoSeeds = [
    '1485827404703-89b55fcc595e',
    '1546776310-eef45dd6d63c',
    '1563770660941-20978e870e26',
    '1618005182384-a83a8bd57fbe',
    '1620712943543-bcc4688e7485',
    '1535378917042-10a22c95931a',
    '1507146426996-ef05306b995a',
    '1581091226825-a6a2a5aee158',
    '1518770660439-4636190af475',
    '1526374965328-7f61d4dc18c5',
    '1531746790731-6c087fecd65a',
    '1555066931-4365d14bab8c',
    '1527977966376-1c8408f9f108',
    '1507238691740-187a5b1d37b8',
    '1579783900882-c0d3dad7b119',
    '1532094349884-543bc11b234d',
    '1550745165-9bc0b252726f',
    '1531403009284-440f080d1e12',
  ];

  return photoSeeds.map((id, idx) => ({
    title: `${capitalized} Concept ${idx + 1}`,
    url: `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80&sig=${encodeURIComponent(q)}_${idx}`,
    photographer: `${capitalized} Photographer`,
  }));
}

export function TipTapEditor() {
  const { currentPost, updateField, saveVersion } = useEditorStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  // Inline Unsplash Search Line State
  const [showInlineUnsplash, setShowInlineUnsplash] = useState(false);
  const [unsplashQuery, setUnsplashQuery] = useState('');
  const [unsplashPage, setUnsplashPage] = useState(1);
  const [activeUnsplashResults, setActiveUnsplashResults] = useState<Array<{ title: string; url: string; photographer: string }> | null>(null);

  // Image Selection Toolbar State
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [selectedImageAlt, setSelectedImageAlt] = useState<string>('');
  const [selectedImageScale, setSelectedImageScale] = useState<'normal' | 'wide' | 'full'>('normal');

  // Transparent Modals State (Replacing native prompt)
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'altText' | 'imageUrl' | 'videoUrl' | 'embedUrl' | null;
    title: string;
    subtitle?: string;
    imageSrc?: string | null;
    placeholder?: string;
    initialValue?: string;
  }>({
    isOpen: false,
    type: null,
    title: '',
  });

  const [showMarkdownModal, setShowMarkdownModal] = useState(false);
  const [markdownInput, setMarkdownInput] = useState('');
  const [showShortcutsSheet, setShowShortcutsSheet] = useState(false);

  // Dynamic Left Gutter Plus Button Line Tracking
  const [menuTop, setMenuTop] = useState<number>(0);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      ImageExtension.configure({
        allowBase64: true,
      }),
      LinkExtension.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Tell your story...',
      }),
    ],
    content: currentPost.content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      updateField('content', html);
      if (wrapperRef.current) {
        try {
          const { from } = editor.state.selection;
          const coords = editor.view.coordsAtPos(from);
          const wrapperRect = wrapperRef.current.getBoundingClientRect();
          setMenuTop(Math.max(0, coords.top - wrapperRect.top - 2));
        } catch (_) {}
      }
    },
    onSelectionUpdate: ({ editor }) => {
      if (editor.isActive('image')) {
        const attrs = editor.getAttributes('image');
        if (attrs.src) {
          setSelectedImageSrc(attrs.src);
          setSelectedImageAlt(attrs.alt || '');
        }
      } else {
        setSelectedImageSrc(null);
      }
      if (wrapperRef.current) {
        try {
          const { from } = editor.state.selection;
          const coords = editor.view.coordsAtPos(from);
          const wrapperRect = wrapperRef.current.getBoundingClientRect();
          setMenuTop(Math.max(0, coords.top - wrapperRect.top - 2));
        } catch (_) {}
      }
    },
    onFocus: ({ editor }) => {
      if (wrapperRef.current) {
        try {
          const { from } = editor.state.selection;
          const coords = editor.view.coordsAtPos(from);
          const wrapperRect = wrapperRef.current.getBoundingClientRect();
          setMenuTop(Math.max(0, coords.top - wrapperRect.top - 2));
        } catch (_) {}
      }
    },
  });

  const updateMenuPosition = React.useCallback(() => {
    if (!editor || !wrapperRef.current) return;
    try {
      const { from } = editor.state.selection;
      const coords = editor.view.coordsAtPos(from);
      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      const relativeY = coords.top - wrapperRect.top;
      setMenuTop(Math.max(0, relativeY - 2));
    } catch (_) {}
  }, [editor]);

  React.useEffect(() => {
    const handleToggle = () => setShowShortcutsSheet((prev) => !prev);
    const handleCmdAlt6 = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.altKey && (e.key === '6' || e.code === 'Digit6')) {
        e.preventDefault();
        if (editor) {
          editor.chain().focus().toggleCodeBlock().run();
        }
      }
    };
    window.addEventListener('toggle-shortcuts-bottomsheet', handleToggle);
    window.addEventListener('keydown', handleCmdAlt6);
    return () => {
      window.removeEventListener('toggle-shortcuts-bottomsheet', handleToggle);
      window.removeEventListener('keydown', handleCmdAlt6);
    };
  }, [editor]);

  React.useEffect(() => {
    if (editor) {
      updateMenuPosition();
      window.addEventListener('resize', updateMenuPosition);
      window.addEventListener('scroll', updateMenuPosition);
      return () => {
        window.removeEventListener('resize', updateMenuPosition);
        window.removeEventListener('scroll', updateMenuPosition);
      };
    }
  }, [editor, updateMenuPosition]);

  if (!editor) return null;

  const readingTime = calculateReadingTime(editor.getHTML());

  const handleUnsplashSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const q = unsplashQuery.trim();
      const results = fetchUnsplashSearchResults(q);
      setUnsplashPage(1);
      setActiveUnsplashResults(results);
    }
  };

  const insertUnsplashImageInline = (photo: { title: string; url: string; photographer: string }) => {
    const captionHtml = `<p><img src="${photo.url}" alt="${photo.title}" class="rounded-xl my-4 border-2 border-emerald-500 shadow-lg" /><span class="block text-center text-xs text-muted-foreground my-2">Photo by <a href="https://unsplash.com" target="_blank" class="underline">${photo.photographer}</a> on <a href="https://unsplash.com" target="_blank" class="underline">Unsplash</a></span></p>`;
    editor.chain().focus().insertContent(captionHtml).run();
    setShowInlineUnsplash(false);
    setActiveUnsplashResults(null);
    setUnsplashQuery('');
    setUnsplashPage(1);
  };

  const handleModalSave = (val: string) => {
    if (!val) return;
    if (modalConfig.type === 'imageUrl') {
      editor.chain().focus().setImage({ src: val }).run();
    } else if (modalConfig.type === 'altText' && selectedImageSrc) {
      editor.chain().focus().setImage({ src: selectedImageSrc, alt: val }).run();
    } else if (modalConfig.type === 'videoUrl') {
      const embedHtml = `<div className="aspect-video w-full my-6 rounded-2xl overflow-hidden shadow-lg"><iframe src="${val.replace('watch?v=', 'embed/')}" class="w-full h-full border-0" allowfullscreen></iframe></div>`;
      editor.chain().focus().insertContent(embedHtml).run();
    } else if (modalConfig.type === 'embedUrl') {
      const embedCode = `<blockquote class="border-l-4 border-primary pl-4 my-4 font-mono text-sm">Embed: ${val}</blockquote>`;
      editor.chain().focus().insertContent(embedCode).run();
    }
  };

  const handleImportMarkdown = () => {
    const html = markdownToHtml(markdownInput);
    editor.commands.setContent(html);
    updateField('content', html);
    setShowMarkdownModal(false);
  };

  const handleExportMarkdown = () => {
    const md = htmlToMarkdown(editor.getHTML());
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPost.slug || 'story'}.md`;
    a.click();
  };

  const actions = [
    {
      id: 'image',
      label: 'Add an image',
      icon: ImageIcon,
      onClick: () =>
        setModalConfig({
          isOpen: true,
          type: 'imageUrl',
          title: 'Add Image URL',
          subtitle: 'Paste a web address of an image to insert into your story',
          placeholder: 'https://images.unsplash.com/...',
        }),
    },
    {
      id: 'unsplash',
      label: 'Search Unsplash',
      icon: Camera,
      onClick: () => {
        setShowInlineUnsplash(!showInlineUnsplash);
        setActiveUnsplashResults(null);
      },
    },
    {
      id: 'video',
      label: 'Add a video',
      icon: Youtube,
      onClick: () =>
        setModalConfig({
          isOpen: true,
          type: 'videoUrl',
          title: 'Add Video Embed',
          subtitle: 'Paste a YouTube or Vimeo video link to embed in your story',
          placeholder: 'https://www.youtube.com/watch?v=...',
        }),
    },
    {
      id: 'embed',
      label: 'Add an embed',
      icon: Code2,
      onClick: () =>
        setModalConfig({
          isOpen: true,
          type: 'embedUrl',
          title: 'Add Interactive Embed',
          subtitle: 'Paste a Twitter/X post link or GitHub Gist URL',
          placeholder: 'https://twitter.com/username/status/...',
        }),
    },
    {
      id: 'code',
      label: 'Add a new code block',
      icon: Braces,
      onClick: () => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      id: 'divider',
      label: 'Add a part divider',
      icon: MoreHorizontal,
      onClick: () => editor.chain().focus().setHorizontalRule().run(),
    },
  ];

  return (
    <div className="relative space-y-6">
      {/* Medium Floating Selection Bubble Menu for Text */}
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 150 }}
          className="flex items-center gap-1 bg-slate-900 text-slate-100 p-1.5 rounded-xl shadow-2xl border border-slate-800 backdrop-blur-md z-50"
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors ${
              editor.isActive('bold') ? 'text-emerald-400 bg-slate-800' : 'text-slate-300'
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors ${
              editor.isActive('italic') ? 'text-emerald-400 bg-slate-800' : 'text-slate-300'
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors ${
              editor.isActive('heading', { level: 1 }) ? 'text-emerald-400 bg-slate-800' : 'text-slate-300'
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors ${
              editor.isActive('heading', { level: 2 }) ? 'text-emerald-400 bg-slate-800' : 'text-slate-300'
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors ${
              editor.isActive('blockquote') ? 'text-emerald-400 bg-slate-800' : 'text-slate-300'
            }`}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-1.5 rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors ${
              editor.isActive('codeBlock') ? 'text-emerald-400 bg-slate-800' : 'text-slate-300'
            }`}
            title="Code"
          >
            <Code className="w-4 h-4" />
          </button>
        </BubbleMenu>
      )}

      {/* Floating Image Scale & Alt Text Toolbar when Image is clicked */}
      <AnimatePresence>
        {selectedImageSrc && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900 text-slate-100 p-2 rounded-2xl shadow-2xl border border-slate-800 backdrop-blur-md font-sans"
          >
            <button
              onClick={() => setSelectedImageScale('normal')}
              className={`p-2 rounded-xl text-xs flex items-center gap-1 font-semibold transition-colors ${
                selectedImageScale === 'normal' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
              title="Normal Center Inset"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedImageScale('wide')}
              className={`p-2 rounded-xl text-xs flex items-center gap-1 font-semibold transition-colors ${
                selectedImageScale === 'wide' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
              title="Wide Column Width"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedImageScale('full')}
              className={`p-2 rounded-xl text-xs flex items-center gap-1 font-semibold transition-colors ${
                selectedImageScale === 'full' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
              title="Full Bleed Width"
            >
              <Maximize className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-slate-700 mx-1" />

            <button
              onClick={() =>
                setModalConfig({
                  isOpen: true,
                  type: 'altText',
                  title: 'Alternative text',
                  subtitle: 'Write a brief description of this image for readers with visual impairments',
                  imageSrc: selectedImageSrc,
                  placeholder: 'E.g., An antique typewriter with a blank sheet of paper sits on a wooden desk',
                  initialValue: selectedImageAlt,
                })
              }
              className="px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer"
            >
              Alt text
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Canvas Wrapper with Absolute Left Margin Gutter Positioned Menu */}
      <div className="relative w-full" ref={wrapperRef}>
        {/* Absolute Left Gutter Menu - Dynamically Tracks Active Line Position */}
        <motion.div
          animate={{ top: menuTop }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="absolute -left-12 sm:-left-16 z-30"
        >
          <div className="flex items-center gap-2">
            {/* Toggle Circle (+) / (X) Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                isMenuOpen
                  ? 'border-foreground text-foreground bg-background'
                  : 'border-muted-foreground/40 text-muted-foreground hover:border-foreground hover:text-foreground bg-background'
              }`}
              title={isMenuOpen ? 'Close menu' : 'Add media or element'}
            >
              {isMenuOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </motion.button>

            {/* Expanded Horizontal Green Circle Tools */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 bg-background/95 backdrop-blur-md p-1 rounded-full shadow-lg border border-border/40"
                >
                  {actions.map((act) => {
                    const Icon = act.icon;
                    return (
                      <div key={act.id} className="relative">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onMouseEnter={() => setHoveredAction(act.label)}
                          onMouseLeave={() => setHoveredAction(null)}
                          onClick={() => {
                            act.onClick();
                            setIsMenuOpen(false);
                          }}
                          className="w-8 h-8 rounded-full border border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-background hover:bg-emerald-500/10 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Medium Style Hover Tooltip */}
          <AnimatePresence>
            {isMenuOpen && hoveredAction && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute left-12 top-11 z-40 bg-slate-900 text-slate-100 text-[11px] px-2.5 py-1 rounded-md shadow-xl font-sans whitespace-nowrap"
              >
                {hoveredAction}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Medium Inline Unsplash Search Bar - Dynamically Attached to Current Active Line Position */}
        <AnimatePresence>
          {showInlineUnsplash && (
            <motion.div
              style={{ top: menuTop + 44 }}
              initial={{ opacity: 0, scale: 0.98, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -5 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 z-40 bg-card/95 backdrop-blur-xl p-5 rounded-3xl border border-border/80 shadow-2xl space-y-4 font-sans max-w-2xl mx-auto"
            >
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={unsplashQuery}
                  onChange={(e) => {
                    const q = e.target.value;
                    setUnsplashQuery(q);
                    const results = fetchUnsplashSearchResults(q);
                    setUnsplashPage(1);
                    setActiveUnsplashResults(results);
                  }}
                  onKeyDown={handleUnsplashSearch}
                  placeholder="Type keywords to search Unsplash (e.g. robots, liar, pirates, hotel, code, tech), and press Enter"
                  className="w-full py-2 text-sm font-sans bg-transparent border-none border-b border-border outline-none text-foreground placeholder:text-muted-foreground/50"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowInlineUnsplash(false);
                    setActiveUnsplashResults(null);
                  }}
                  className="ml-3 p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Close search"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Inline Photo Results Grid with True Batch Pagination */}
              {activeUnsplashResults && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Batch {unsplashPage} of {Math.ceil(activeUnsplashResults.length / 6)} • Showing{' '}
                      {Math.min((unsplashPage - 1) * 6 + 1, activeUnsplashResults.length)}-
                      {Math.min(unsplashPage * 6, activeUnsplashResults.length)} of {activeUnsplashResults.length * 500} photos
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={unsplashPage <= 1}
                        onClick={() => setUnsplashPage((p) => Math.max(1, p - 1))}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border/70 hover:bg-muted text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Prev
                      </button>
                      <button
                        type="button"
                        disabled={unsplashPage * 6 >= activeUnsplashResults.length}
                        onClick={() => setUnsplashPage((p) => p + 1)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border/70 hover:bg-muted text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                      >
                        Next
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {activeUnsplashResults
                      .slice((unsplashPage - 1) * 6, unsplashPage * 6)
                      .map((photo, idx) => (
                      <div
                        key={idx}
                        onClick={() => insertUnsplashImageInline(photo)}
                        className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-border cursor-pointer hover:border-emerald-500/80 transition-colors shadow-xs"
                      >
                        <img src={photo.url} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                          <span className="text-[10px] text-white font-medium line-clamp-1">Photo by {photo.photographer}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full-width TipTap Canvas Area */}
        <div className="w-full pl-0">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Minimal Footer Toolbar */}
      <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-10 border-t border-border/40 font-sans">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            {readingTime.wordCount} words
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {readingTime.minutes} min read
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMarkdownModal(true)}
            className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" /> Import MD
          </button>
          <span>•</span>
          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export MD
          </button>
          <span>•</span>
          <button
            onClick={saveVersion}
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            Save Revision
          </button>
          <span>•</span>
          <button
            onClick={() => setShowShortcutsSheet(true)}
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            Shortcuts (⌘Shift?)
          </button>
        </div>
      </div>

      {/* Transparent Full-Screen Prompt Modal for Alt Text, Image, Video & Embed Inputs */}
      <TransparentPromptModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onSave={handleModalSave}
        title={modalConfig.title}
        subtitle={modalConfig.subtitle}
        imageSrc={modalConfig.imageSrc}
        placeholder={modalConfig.placeholder}
        initialValue={modalConfig.initialValue}
      />

      {/* Keyboard Shortcuts Bottom Sheet Modal */}
      <KeyboardShortcutsBottomSheet
        isOpen={showShortcutsSheet}
        onClose={() => setShowShortcutsSheet(false)}
      />

      {/* Markdown Import Modal */}
      {showMarkdownModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-card p-6 rounded-2xl border border-border space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-foreground font-sans">Import Markdown Content</h3>
            <textarea
              rows={8}
              value={markdownInput}
              onChange={(e) => setMarkdownInput(e.target.value)}
              placeholder="Paste raw markdown here..."
              className="w-full p-3 bg-muted/50 border border-border rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setShowMarkdownModal(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleImportMarkdown}>
                Convert & Insert
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
