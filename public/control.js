(function () {
  'use strict';

  const BRAND_COLORS = ['#FAB001', '#FFFFFF', '#404040', '#000000'];

  const FONT_GROUPS = [
    {
      label: 'Broadcast & Sans-Serif',
      fonts: ['Quicksand', 'Montserrat', 'Poppins', 'Inter', 'Raleway', 'Nunito', 'Space Grotesk']
    },
    {
      label: 'Impact & Titres Forts',
      fonts: ['Bebas Neue', 'Anton', 'Oswald', 'Archivo Black', 'Righteous']
    },
    {
      label: 'Éditorial, Gala & Serif',
      fonts: ['Playfair Display', 'Cinzel', 'DM Serif Display', 'Abril Fatface', 'Roboto Slab']
    },
    {
      label: 'Noël, Fêtes & Calligraphie',
      fonts: ['Mountains of Christmas', 'Great Vibes', 'Dancing Script', 'Pacifico', 'Lobster', 'Caveat']
    },
    {
      label: 'Créatif, Pop & Événements',
      fonts: ['Fredoka', 'Baloo 2', 'Luckiest Guy', 'Bangers', 'Permanent Marker', 'Creepster', 'Henny Penny']
    },
    {
      label: 'Tech, Gaming & Code',
      fonts: ['JetBrains Mono', 'Press Start 2P']
    }
  ];

  // 28 Theme Presets grouped into 4 categories: mmi, noel, fetes, creatif
  const THEME_PRESETS = {
    // --- MMI & BROADCAST ---
    'light-gold': {
      cat: 'mmi',
      name: 'MMI Clair & Or',
      dots: ['#FAB001', '#FFFFFF', '#404040'],
      props: {
        primaryBg: '#FFFFFF', primaryColor: '#000000',
        secondaryBg: '#FAB001', secondaryColor: '#000000',
        accentColor: '#FAB001', iconBg: '#404040', iconColor: '#FAB001',
        tagBg: '#000000', tagColor: '#FAB001', borderColor: '#000000',
        decor: 'none', pattern: 'none'
      }
    },
    'grey-gold': {
      cat: 'mmi',
      name: 'MMI Anthracite',
      dots: ['#404040', '#FAB001', '#FFFFFF'],
      props: {
        primaryBg: '#404040', primaryColor: '#FFFFFF',
        secondaryBg: '#FAB001', secondaryColor: '#000000',
        accentColor: '#FAB001', iconBg: '#000000', iconColor: '#FAB001',
        tagBg: '#FAB001', tagColor: '#000000', borderColor: '#000000',
        decor: 'none', pattern: 'none'
      }
    },
    'black-gold': {
      cat: 'mmi',
      name: 'MMI Noir Intense',
      dots: ['#000000', '#FAB001', '#FFFFFF'],
      props: {
        primaryBg: '#000000', primaryColor: '#FFFFFF',
        secondaryBg: '#FAB001', secondaryColor: '#000000',
        accentColor: '#FAB001', iconBg: '#FAB001', iconColor: '#000000',
        tagBg: '#404040', tagColor: '#FFFFFF', borderColor: '#FAB001',
        decor: 'none', pattern: 'none'
      }
    },
    'gold-black': {
      cat: 'mmi',
      name: 'MMI Plein Soleil',
      dots: ['#FAB001', '#000000', '#FFFFFF'],
      props: {
        primaryBg: '#FAB001', primaryColor: '#000000',
        secondaryBg: '#000000', secondaryColor: '#FFFFFF',
        accentColor: '#000000', iconBg: '#000000', iconColor: '#FAB001',
        tagBg: '#FFFFFF', tagColor: '#000000', borderColor: '#000000',
        decor: 'none', pattern: 'none'
      }
    },
    'clean-white': {
      cat: 'mmi',
      name: 'Studio Blanc Pur',
      dots: ['#FFFFFF', '#404040', '#FAB001'],
      props: {
        primaryBg: '#FFFFFF', primaryColor: '#000000',
        secondaryBg: '#404040', secondaryColor: '#FFFFFF',
        accentColor: '#FAB001', iconBg: '#FAB001', iconColor: '#000000',
        tagBg: '#404040', tagColor: '#FAB001', borderColor: '#404040',
        decor: 'none', pattern: 'none'
      }
    },
    'jt-breaking': {
      cat: 'mmi',
      name: 'JT Flash Info',
      dots: ['#D90429', '#FFFFFF', '#0B090A'],
      props: {
        primaryBg: '#FFFFFF', primaryColor: '#0B090A',
        secondaryBg: '#D90429', secondaryColor: '#FFFFFF',
        accentColor: '#D90429', iconBg: '#D90429', iconColor: '#FFFFFF',
        tagBg: '#0B090A', tagColor: '#FFFFFF', borderColor: '#D90429',
        decor: 'none', pattern: 'none'
      }
    },
    'jt-navy': {
      cat: 'mmi',
      name: 'Plateau Débat Bleu',
      dots: ['#0A2463', '#3E92CC', '#FFFFFF'],
      props: {
        primaryBg: '#0A2463', primaryColor: '#FFFFFF',
        secondaryBg: '#FFFFFF', secondaryColor: '#0A2463',
        accentColor: '#3E92CC', iconBg: '#3E92CC', iconColor: '#FFFFFF',
        tagBg: '#D8315B', tagColor: '#FFFFFF', borderColor: '#3E92CC',
        decor: 'none', pattern: 'none'
      }
    },

    // --- NOËL & HIVER ---
    'xmas-classic': {
      cat: 'noel',
      name: '🎄 Noël Rouge & Or',
      dots: ['#B81D24', '#F4C430', '#165B33'],
      props: {
        primaryBg: '#B81D24', primaryColor: '#FFFFFF',
        secondaryBg: '#165B33', secondaryColor: '#F4C430',
        accentColor: '#F4C430', iconBg: '#165B33', iconColor: '#F4C430',
        tagBg: '#F4C430', tagColor: '#000000', borderColor: '#F4C430',
        decor: 'christmas', decorColor: '#F4C430', pattern: 'snow', patternOpacity: 0.18
      }
    },
    'xmas-pine': {
      cat: 'noel',
      name: '🌲 Sapin & Neige',
      dots: ['#14452F', '#FFFFFF', '#D62828'],
      props: {
        primaryBg: '#14452F', primaryColor: '#FFFFFF',
        secondaryBg: '#FFFFFF', secondaryColor: '#14452F',
        accentColor: '#D62828', iconBg: '#D62828', iconColor: '#FFFFFF',
        tagBg: '#D62828', tagColor: '#FFFFFF', borderColor: '#F4C430',
        decor: 'christmas', decorColor: '#F4C430', pattern: 'snow', patternOpacity: 0.2
      }
    },
    'xmas-candy': {
      cat: 'noel',
      name: '🎅 Atelier du Père Noël',
      dots: ['#D62828', '#FFFFFF', '#165B33'],
      props: {
        primaryBg: '#FFFFFF', primaryColor: '#B81D24',
        secondaryBg: '#D62828', secondaryColor: '#FFFFFF',
        accentColor: '#D62828', iconBg: '#D62828', iconColor: '#FFFFFF',
        tagBg: '#165B33', tagColor: '#FFFFFF', borderColor: '#D62828',
        decor: 'christmas-hat', decorColor: '#D62828', pattern: 'candy', patternOpacity: 0.14
      }
    },
    'xmas-gold': {
      cat: 'noel',
      name: '✨ Noël Prestige Or',
      dots: ['#121212', '#F4C430', '#9E1B24'],
      props: {
        primaryBg: '#121212', primaryColor: '#F4C430',
        secondaryBg: '#9E1B24', secondaryColor: '#FFFFFF',
        accentColor: '#F4C430', iconBg: '#F4C430', iconColor: '#121212',
        tagBg: '#F4C430', tagColor: '#121212', borderColor: '#F4C430',
        decor: 'christmas', decorColor: '#F4C430', pattern: 'stars', patternOpacity: 0.18
      }
    },
    'winter-frost': {
      cat: 'noel',
      name: '❄️ Hiver Polaire',
      dots: ['#0B2545', '#8DA9C4', '#EEF4ED'],
      props: {
        primaryBg: '#0B2545', primaryColor: '#FFFFFF',
        secondaryBg: '#8DA9C4', secondaryColor: '#0B2545',
        accentColor: '#70D6FF', iconBg: '#134074', iconColor: '#70D6FF',
        tagBg: '#70D6FF', tagColor: '#0B2545', borderColor: '#70D6FF',
        decor: 'snowflakes', decorColor: '#70D6FF', pattern: 'snow', patternOpacity: 0.22
      }
    },
    'winter-ice': {
      cat: 'noel',
      name: '🧊 Cristal de Glace',
      dots: ['#E0FBFC', '#293241', '#3D5A80'],
      props: {
        primaryBg: '#E0FBFC', primaryColor: '#293241',
        secondaryBg: '#3D5A80', secondaryColor: '#FFFFFF',
        accentColor: '#00B4D8', iconBg: '#293241', iconColor: '#E0FBFC',
        tagBg: '#00B4D8', tagColor: '#000000', borderColor: '#3D5A80',
        decor: 'snowflakes', decorColor: '#00B4D8', pattern: 'snow', patternOpacity: 0.18
      }
    },
    'gingerbread': {
      cat: 'noel',
      name: '🍪 Pain d’Épices & Cannelle',
      dots: ['#7F4F24', '#F8EDEB', '#D62828'],
      props: {
        primaryBg: '#7F4F24', primaryColor: '#FFF8F0',
        secondaryBg: '#FFF8F0', secondaryColor: '#7F4F24',
        accentColor: '#D62828', iconBg: '#D62828', iconColor: '#FFFFFF',
        tagBg: '#165B33', tagColor: '#FFFFFF', borderColor: '#FFF8F0',
        decor: 'christmas', decorColor: '#F4C430', pattern: 'dots', patternOpacity: 0.14
      }
    },

    // --- FÊTES & SAISONS ---
    'newyear-gala': {
      cat: 'fetes',
      name: '🥂 Nouvel An Champagne',
      dots: ['#0B0B0E', '#FFD166', '#FFFFFF'],
      props: {
        primaryBg: '#0B0B0E', primaryColor: '#FFFFFF',
        secondaryBg: '#FFD166', secondaryColor: '#0B0B0E',
        accentColor: '#FFD166', iconBg: '#FFD166', iconColor: '#0B0B0E',
        tagBg: '#FFFFFF', tagColor: '#0B0B0E', borderColor: '#FFD166',
        decor: 'newyear', decorColor: '#FFD166', pattern: 'stars', patternOpacity: 0.2
      }
    },
    'halloween-night': {
      cat: 'fetes',
      name: '🎃 Halloween Citrouille',
      dots: ['#1A1128', '#FF6B00', '#9B5DE5'],
      props: {
        primaryBg: '#1A1128', primaryColor: '#FF6B00',
        secondaryBg: '#FF6B00', secondaryColor: '#000000',
        accentColor: '#9B5DE5', iconBg: '#FF6B00', iconColor: '#000000',
        tagBg: '#9B5DE5', tagColor: '#FFFFFF', borderColor: '#FF6B00',
        decor: 'halloween', decorColor: '#FF6B00', pattern: 'stripes', patternOpacity: 0.15
      }
    },
    'valentine-love': {
      cat: 'fetes',
      name: '💖 Saint-Valentin',
      dots: ['#FF2A6D', '#FFF0F3', '#800F2F'],
      props: {
        primaryBg: '#FFF0F3', primaryColor: '#800F2F',
        secondaryBg: '#FF2A6D', secondaryColor: '#FFFFFF',
        accentColor: '#FF2A6D', iconBg: '#FF2A6D', iconColor: '#FFFFFF',
        tagBg: '#800F2F', tagColor: '#FFFFFF', borderColor: '#FF2A6D',
        decor: 'valentines', decorColor: '#FF2A6D', pattern: 'dots', patternOpacity: 0.12
      }
    },
    'easter-spring': {
      cat: 'fetes',
      name: '🥚 Pâques Pastel',
      dots: ['#FDF0D5', '#FF85A1', '#70D6FF'],
      props: {
        primaryBg: '#FFFDF7', primaryColor: '#3B2F2F',
        secondaryBg: '#FF85A1', secondaryColor: '#000000',
        accentColor: '#70D6FF', iconBg: '#BDE0FE', iconColor: '#000000',
        tagBg: '#A8DADC', tagColor: '#000000', borderColor: '#FF85A1',
        decor: 'easter', decorColor: '#FF85A1', pattern: 'dots', patternOpacity: 0.15
      }
    },
    'summer-fest': {
      cat: 'fetes',
      name: '☀️ Été & Festival',
      dots: ['#FFB703', '#0077B6', '#FB8500'],
      props: {
        primaryBg: '#0077B6', primaryColor: '#FFFFFF',
        secondaryBg: '#FFB703', secondaryColor: '#000000',
        accentColor: '#FB8500', iconBg: '#FFB703', iconColor: '#000000',
        tagBg: '#FB8500', tagColor: '#FFFFFF', borderColor: '#FFB703',
        decor: 'summer', decorColor: '#FFB703', pattern: 'waves', patternOpacity: 0.16
      }
    },
    'party-confetti': {
      cat: 'fetes',
      name: '🎉 Anniversaire / Party',
      dots: ['#FFFFFF', '#FF2A6D', '#00F5D4'],
      props: {
        primaryBg: '#FFFFFF', primaryColor: '#141414',
        secondaryBg: '#9B5DE5', secondaryColor: '#FFFFFF',
        accentColor: '#FF2A6D', iconBg: '#00F5D4', iconColor: '#000000',
        tagBg: '#FAB001', tagColor: '#000000', borderColor: '#000000',
        decor: 'confetti', decorColor: '#FF2A6D', pattern: 'dots', patternOpacity: 0.12
      }
    },
    'campus-grad': {
      cat: 'fetes',
      name: '🎓 Remise de Diplômes',
      dots: ['#1B263B', '#FAB001', '#FFFFFF'],
      props: {
        primaryBg: '#1B263B', primaryColor: '#FFFFFF',
        secondaryBg: '#FAB001', secondaryColor: '#000000',
        accentColor: '#FAB001', iconBg: '#FAB001', iconColor: '#1B263B',
        tagBg: '#FFFFFF', tagColor: '#1B263B', borderColor: '#FAB001',
        decor: 'campus', decorColor: '#FAB001', pattern: 'none'
      }
    },

    // --- CRÉATIF, GAMING & SPORT ---
    'cyber-neon': {
      cat: 'creatif',
      name: '🕹️ Cyberpunk / Gaming',
      dots: ['#0D0221', '#00F5D4', '#FF2A6D'],
      props: {
        primaryBg: '#0D0221', primaryColor: '#00F5D4',
        secondaryBg: '#FF2A6D', secondaryColor: '#FFFFFF',
        accentColor: '#00F5D4', iconBg: '#FF2A6D', iconColor: '#FFFFFF',
        tagBg: '#00F5D4', tagColor: '#0D0221', borderColor: '#00F5D4',
        decor: 'retro', decorColor: '#00F5D4', pattern: 'grid', patternOpacity: 0.22
      }
    },
    'neo-brutal': {
      cat: 'creatif',
      name: '⚡ Néo-Brutaliste Pop',
      dots: ['#FFBE0B', '#FB5607', '#000000'],
      props: {
        primaryBg: '#FFBE0B', primaryColor: '#000000',
        secondaryBg: '#FFFFFF', secondaryColor: '#000000',
        accentColor: '#FB5607', iconBg: '#FF006E', iconColor: '#FFFFFF',
        tagBg: '#8338EC', tagColor: '#FFFFFF', borderColor: '#000000',
        shadowOffset: 7, shadowColor: '#000000', borderWidth: 3,
        decor: 'none', pattern: 'dots', patternOpacity: 0.14
      }
    },
    'sport-lime': {
      cat: 'creatif',
      name: '🏆 Sport & Compétition',
      dots: ['#11151C', '#CCFF00', '#FFFFFF'],
      props: {
        primaryBg: '#11151C', primaryColor: '#FFFFFF',
        secondaryBg: '#CCFF00', secondaryColor: '#000000',
        accentColor: '#CCFF00', iconBg: '#CCFF00', iconColor: '#000000',
        tagBg: '#FFFFFF', tagColor: '#000000', borderColor: '#CCFF00',
        decor: 'trophy', decorColor: '#CCFF00', pattern: 'chevron', patternOpacity: 0.14
      }
    },
    'music-stage': {
      cat: 'creatif',
      name: '🎵 Concert & Session Live',
      dots: ['#240046', '#E0AAFF', '#FF9E00'],
      props: {
        primaryBg: '#240046', primaryColor: '#FFFFFF',
        secondaryBg: '#FF9E00', secondaryColor: '#000000',
        accentColor: '#E0AAFF', iconBg: '#7B2CBF', iconColor: '#FFFFFF',
        tagBg: '#E0AAFF', tagColor: '#240046', borderColor: '#E0AAFF',
        decor: 'music', decorColor: '#FF9E00', pattern: 'waves', patternOpacity: 0.16
      }
    },
    'fire-action': {
      cat: 'creatif',
      name: '🔥 Défi & Battle',
      dots: ['#1A090D', '#FF5400', '#FFBD00'],
      props: {
        primaryBg: '#1A090D', primaryColor: '#FFFFFF',
        secondaryBg: '#FF5400', secondaryColor: '#FFFFFF',
        accentColor: '#FFBD00', iconBg: '#FFBD00', iconColor: '#000000',
        tagBg: '#FF0054', tagColor: '#FFFFFF', borderColor: '#FF5400',
        decor: 'fire', decorColor: '#FFBD00', pattern: 'stripes', patternOpacity: 0.15
      }
    },
    'cinema-noir': {
      cat: 'creatif',
      name: '🎬 Cinéma & Court-Métrage',
      dots: ['#141414', '#E5C158', '#FFFFFF'],
      props: {
        primaryBg: '#141414', primaryColor: '#FFFFFF',
        secondaryBg: '#E5C158', secondaryColor: '#000000',
        accentColor: '#E5C158', iconBg: '#262626', iconColor: '#E5C158',
        tagBg: '#E5C158', tagColor: '#000000', borderColor: '#E5C158',
        decor: 'none', pattern: 'none'
      }
    },
    'arcade-8bit': {
      cat: 'creatif',
      name: '👾 Arcade Rétro 8-Bit',
      dots: ['#000000', '#39FF14', '#FF007F'],
      props: {
        primaryBg: '#000000', primaryColor: '#39FF14',
        secondaryBg: '#FF007F', secondaryColor: '#FFFFFF',
        accentColor: '#39FF14', iconBg: '#39FF14', iconColor: '#000000',
        tagBg: '#FFBE0B', tagColor: '#000000', borderColor: '#39FF14',
        borderWidth: 3, shadowOffset: 6, shadowColor: '#FF007F',
        decor: 'retro', decorColor: '#39FF14', pattern: 'checker', patternOpacity: 0.14
      }
    }
  };

  // 36 Complete Editable Templates for the Template Gallery Modal
  const GALLERY_TEMPLATES = [
    // ================= NOËL & HIVER (9) =================
    {
      name: 'Spécial Noël — Rouge & Houx',
      cat: 'noel',
      catLabel: '🎄 Noël & Hiver',
      asset: {
        kind: 'synthe',
        primaryText: 'Clara Montagne',
        secondaryText: 'Émission Spéciale Noël • Plateau MMI',
        tagText: 'JOYEUX NOËL',
        icon: 'fa-solid fa-gift',
        mode: 'auto', duration: 6.5,
        layout: 'layered', align: 'left', posX: 96, posY: 84, scale: 1,
        borderRadius: 14, paddingX: 28, paddingY: 14, accentWidth: 10, borderWidth: 2,
        shadowOffset: 6, shadowColor: '#0B2E1A', skewX: 0, gap: 6,
        primaryBg: '#B81D24', primaryColor: '#FFFFFF',
        secondaryBg: '#165B33', secondaryColor: '#F4C430',
        accentColor: '#F4C430', iconBg: '#165B33', iconColor: '#F4C430',
        tagBg: '#F4C430', tagColor: '#000000', borderColor: '#F4C430',
        decor: 'christmas', decorColor: '#F4C430', pattern: 'snow', patternOpacity: 0.2,
        primaryFont: 'Mountains of Christmas', primarySize: 46, primaryWeight: 700, primaryUppercase: false,
        secondaryFont: 'Quicksand', secondarySize: 20, secondaryWeight: 700, secondaryUppercase: false,
        animStyle: 'festive-sparkle', animSpeed: 1, animBounce: 1.25, animDirection: 'bottom'
      }
    },
    {
      name: 'Atelier du Père Noël — Sucre d’Orge',
      cat: 'noel',
      catLabel: '🎅 Noël & Hiver',
      asset: {
        kind: 'synthe',
        primaryText: 'Nicolas Lutin',
        secondaryText: 'Envoyé spécial • Laponie',
        tagText: 'DIRECT PÔLE NORD',
        icon: 'fa-solid fa-sleigh',
        mode: 'auto', duration: 6,
        layout: 'split', align: 'left', posX: 96, posY: 84, scale: 1,
        borderRadius: 16, paddingX: 26, paddingY: 14, accentWidth: 12, borderWidth: 3,
        shadowOffset: 6, shadowColor: '#780000', skewX: 0, gap: 6,
        primaryBg: '#FFFFFF', primaryColor: '#B81D24',
        secondaryBg: '#D62828', secondaryColor: '#FFFFFF',
        accentColor: '#D62828', iconBg: '#165B33', iconColor: '#FFFFFF',
        tagBg: '#165B33', tagColor: '#FFFFFF', borderColor: '#D62828',
        decor: 'christmas-hat', decorColor: '#D62828', pattern: 'candy', patternOpacity: 0.14,
        primaryFont: 'Fredoka', primarySize: 40, primaryWeight: 700, primaryUppercase: false,
        secondaryFont: 'Quicksand', secondarySize: 20, secondaryWeight: 700, secondaryUppercase: false,
        animStyle: 'snow-bounce', animSpeed: 1, animBounce: 1.3, animDirection: 'bottom'
      }
    },
    {
      name: 'Sapin Enchanté & Or',
      cat: 'noel',
      catLabel: '🌲 Noël & Hiver',
      asset: {
        kind: 'synthe',
        primaryText: 'Margaux Delcourt',
        secondaryText: 'Présentatrice • Veillée de Noël',
        tagText: 'CONTE DE NOËL',
        icon: 'fa-solid fa-tree',
        mode: 'auto', duration: 6.5,
        layout: 'frame', align: 'left', posX: 96, posY: 84, scale: 1,
        borderRadius: 14, paddingX: 28, paddingY: 15, accentWidth: 8, borderWidth: 2,
        shadowOffset: 5, shadowColor: '#000000', skewX: 0, gap: 6,
        primaryBg: '#14452F', primaryColor: '#FFFFFF',
        secondaryBg: '#F4C430', secondaryColor: '#0B2418',
        accentColor: '#F4C430', iconBg: '#B81D24', iconColor: '#F4C430',
        tagBg: '#B81D24', tagColor: '#FFFFFF', borderColor: '#F4C430',
        decor: 'christmas', decorColor: '#F4C430', pattern: 'stars', patternOpacity: 0.18,
        primaryFont: 'Playfair Display', primarySize: 40, primaryWeight: 700, primaryItalic: true,
        secondaryFont: 'Montserrat', secondarySize: 18, secondaryWeight: 700, secondaryUppercase: true,
        animStyle: 'velvet-glide', animSpeed: 1, animBounce: 1, animDirection: 'bottom'
      }
    },
    {
      name: 'Flocons & Glace Polaire',
      cat: 'noel',
      catLabel: '❄️ Noël & Hiver',
      asset: {
        kind: 'synthe',
        primaryText: 'Thomas Givre',
        secondaryText: 'Chroniqueur Météo & Montagne',
        tagText: 'HIVER',
        icon: 'fa-solid fa-snowflake',
        mode: 'auto', duration: 6,
        layout: 'capsule', align: 'left', posX: 96, posY: 84, scale: 1,
        borderRadius: 34, paddingX: 28, paddingY: 14, accentWidth: 8, borderWidth: 2,
        shadowOffset: 0, shadowColor: '#000000', skewX: 0, gap: 6,
        primaryBg: '#0B2545', primaryColor: '#FFFFFF',
        secondaryBg: '#E0FBFC', secondaryColor: '#0B2545',
        accentColor: '#70D6FF', iconBg: '#70D6FF', iconColor: '#0B2545',
        tagBg: '#70D6FF', tagColor: '#0B2545', borderColor: '#70D6FF',
        decor: 'snowflakes', decorColor: '#70D6FF', pattern: 'snow', patternOpacity: 0.24,
        primaryFont: 'Montserrat', primarySize: 38, primaryWeight: 800,
        secondaryFont: 'Quicksand', secondarySize: 19, secondaryWeight: 700,
        animStyle: 'snow-bounce', animSpeed: 1, animBounce: 1.2, animDirection: 'bottom'
      }
    },
    {
      name: 'Ticket Marché de Noël',
      cat: 'noel',
      catLabel: '🎟️ Noël & Hiver',
      asset: {
        kind: 'synthe',
        primaryText: 'Chocolat Chaud & Vin Épicé',
        secondaryText: 'Reportage au Marché de Noël de Troyes',
        tagText: 'ÉDITION HIVER',
        icon: 'fa-solid fa-mug-hot',
        mode: 'auto', duration: 6,
        layout: 'ticket', align: 'left', posX: 96, posY: 84, scale: 1,
        borderRadius: 12, paddingX: 26, paddingY: 14, accentWidth: 8, borderWidth: 3,
        shadowOffset: 6, shadowColor: '#3D1E05', skewX: 0, gap: 6,
        primaryBg: '#FFF8F0', primaryColor: '#7F4F24',
        secondaryBg: '#B81D24', secondaryColor: '#FFFFFF',
        accentColor: '#F4C430', iconBg: '#B81D24', iconColor: '#F4C430',
        tagBg: '#165B33', tagColor: '#FFFFFF', borderColor: '#B81D24',
        decor: 'christmas', decorColor: '#F4C430', pattern: 'dots', patternOpacity: 0.12,
        primaryFont: 'Lobster', primarySize: 40, primaryWeight: 400,
        secondaryFont: 'Quicksand', secondarySize: 19, secondaryWeight: 700,
        animStyle: 'origami-unfold', animSpeed: 1, animBounce: 1.2, animDirection: 'bottom'
      }
    },
    {
      name: 'Médaillon de Noël Festif',
      cat: 'noel',
      catLabel: '🔔 Noël & Hiver',
      asset: {
        kind: 'synthe',
        primaryText: 'Amélie Neige',
        secondaryText: 'Chorale & Musiques de Fêtes',
        tagText: 'LIVE NOËL',
        icon: 'fa-solid fa-bell',
        mode: 'auto', duration: 6,
        layout: 'badge-card', align: 'left', posX: 96, posY: 84, scale: 1,
        borderRadius: 14, paddingX: 28, paddingY: 14, accentWidth: 8, borderWidth: 2,
        shadowOffset: 5, shadowColor: '#000000', skewX: 0, gap: 6,
        primaryBg: '#121212', primaryColor: '#F4C430',
        secondaryBg: '#B81D24', secondaryColor: '#FFFFFF',
        accentColor: '#F4C430', iconBg: '#B81D24', iconColor: '#F4C430',
        tagBg: '#F4C430', tagColor: '#000000', borderColor: '#F4C430',
        decor: 'christmas-hat', decorColor: '#F4C430', pattern: 'stars', patternOpacity: 0.18,
        primaryFont: 'Dancing Script', primarySize: 46, primaryWeight: 700,
        secondaryFont: 'Poppins', secondarySize: 18, secondaryWeight: 600,
        animStyle: 'pop-elastic', animSpeed: 1, animBounce: 1.3, animDirection: 'bottom'
      }
    },
    {
      name: 'Titre Noël — Le Bêtisier des Fêtes',
      cat: 'noel',
      catLabel: '🎄 Titre Noël',
      asset: {
        kind: 'titre',
        primaryText: 'Le Grand Bêtisier de Noël',
        secondaryText: 'SÉQUENCE FÊTES',
        tagText: '',
        icon: 'fa-solid fa-candy-cane',
        mode: 'auto', duration: 5.5,
        layout: 'minimal', align: 'center', posX: 0, posY: 62, scale: 1,
        borderRadius: 99, paddingX: 30, paddingY: 13, accentWidth: 6, borderWidth: 2,
        shadowOffset: 5, shadowColor: '#0B2E1A', skewX: 0, gap: 6,
        primaryBg: '#B81D24', primaryColor: '#FFFFFF',
        secondaryBg: '#F4C430', secondaryColor: '#000000',
        accentColor: '#F4C430', iconBg: '#165B33', iconColor: '#FFFFFF',
        tagBg: '#165B33', tagColor: '#FFFFFF', borderColor: '#F4C430',
        decor: 'christmas', decorColor: '#F4C430', pattern: 'snow', patternOpacity: 0.2,
        primaryFont: 'Mountains of Christmas', primarySize: 34, primaryWeight: 700,
        secondaryFont: 'Quicksand', secondarySize: 15, secondaryWeight: 700, secondaryUppercase: true,
        animStyle: 'festive-sparkle', animSpeed: 1, animBounce: 1.25, animDirection: 'bottom'
      }
    },
    {
      name: 'Titre Hiver — Flocons & Cinéma',
      cat: 'noel',
      catLabel: '❄️ Titre Hiver',
      asset: {
        kind: 'titre',
        primaryText: 'Les Films Incontournables de l’Hiver',
        secondaryText: 'CHRONIQUE CINÉ',
        tagText: '',
        icon: 'fa-solid fa-snowflake',
        mode: 'auto', duration: 5,
        layout: 'minimal', align: 'center', posX: 0, posY: 60, scale: 1,
        borderRadius: 14, paddingX: 28, paddingY: 13, accentWidth: 5, borderWidth: 2,
        shadowOffset: 0, shadowColor: '#000000', skewX: 0, gap: 6,
        primaryBg: '#0B2545', primaryColor: '#FFFFFF',
        secondaryBg: '#70D6FF', secondaryColor: '#0B2545',
        accentColor: '#70D6FF', iconBg: '#70D6FF', iconColor: '#0B2545',
        tagBg: '#70D6FF', tagColor: '#0B2545', borderColor: '#70D6FF',
        decor: 'snowflakes', decorColor: '#70D6FF', pattern: 'snow', patternOpacity: 0.22,
        primaryFont: 'Quicksand', primarySize: 28, primaryWeight: 700,
        secondaryFont: 'Montserrat', secondarySize: 14, secondaryWeight: 800, secondaryUppercase: true,
        animStyle: 'snow-bounce', animSpeed: 1, animBounce: 1.2, animDirection: 'bottom'
      }
    },
    {
      name: 'Bannière Calendrier de l’Avent',
      cat: 'noel',
      catLabel: '🎁 Noël & Hiver',
      asset: {
        kind: 'synthe',
        primaryText: 'Case #24 : Le Grand Cadeau MMI',
        secondaryText: 'Tirage au sort en direct sur le plateau',
        tagText: 'CALENDRIER DE L’AVENT',
        icon: 'fa-solid fa-gifts',
        mode: 'auto', duration: 6.5,
        layout: 'banner', align: 'left', posX: 96, posY: 84, scale: 1,
        borderRadius: 12, paddingX: 28, paddingY: 14, accentWidth: 8, borderWidth: 2,
        shadowOffset: 6, shadowColor: '#000000', skewX: 0, gap: 6,
        primaryBg: '#165B33', primaryColor: '#FFFFFF',
        secondaryBg: '#B81D24', secondaryColor: '#FFFFFF',
        accentColor: '#F4C430', iconBg: '#F4C430', iconColor: '#000000',
        tagBg: '#F4C430', tagColor: '#000000', borderColor: '#F4C430',
        decor: 'christmas', decorColor: '#F4C430', pattern: 'candy', patternOpacity: 0.14,
        primaryFont: 'Baloo 2', primarySize: 38, primaryWeight: 800,
        secondaryFont: 'Quicksand', secondarySize: 20, secondaryWeight: 700,
        animStyle: 'spring-cascade', animSpeed: 1, animBounce: 1.25, animDirection: 'bottom'
      }
    },

    // ================= FÊTES & SAISONS (8) =================
    {
      name: 'Gala du Nouvel An — Or & Champagne',
      cat: 'fetes',
      catLabel: '🥂 Fêtes & Saisons',
      asset: {
        kind: 'synthe',
        primaryText: 'Sébastien Roche',
        secondaryText: 'Soirée de Gala & Rétrospective de l’Année',
        tagText: 'SPÉCIAL RÉVEILLON',
        icon: 'fa-solid fa-champagne-glasses',
        mode: 'auto', duration: 6.5,
        layout: 'frame', align: 'left', posX: 96, posY: 84, scale: 1,
        borderRadius: 12, paddingX: 30, paddingY: 15, accentWidth: 8, borderWidth: 2,
        shadowOffset: 6, shadowColor: '#000000', skewX: 0, gap: 6,
        primaryBg: '#0B0B0E', primaryColor: '#FFFFFF',
        secondaryBg: '#FFD166', secondaryColor: '#0B0B0E',
        accentColor: '#FFD166', iconBg: '#FFD166', iconColor: '#0B0B0E',
        tagBg: '#FFD166', tagColor: '#0B0B0E', borderColor: '#FFD166',
        decor: 'newyear', decorColor: '#FFD166', pattern: 'stars', patternOpacity: 0.22,
        primaryFont: 'Cinzel', primarySize: 38, primaryWeight: 700,
        secondaryFont: 'Montserrat', secondarySize: 18, secondaryWeight: 700, secondaryUppercase: true,
        animStyle: 'festive-sparkle', animSpeed: 1, animBounce: 1.2, animDirection: 'bottom'
      }
    },
    {
      name: 'Spécial Halloween — Frissons en Direct',
      cat: 'fetes',
      catLabel: '🎃 Fêtes & Saisons',
      asset: {
        kind: 'synthe',
        primaryText: 'Victor Morlock',
        secondaryText: 'Spécialiste Cinéma d’Horreur & Légendes',
        tagText: 'NUIT HALLOWEEN',
        icon: 'fa-solid fa-ghost',
        mode: 'auto', duration: 6,
        layout: 'brutalist', align: 'left', posX: 96, posY: 84, scale: 1,
        borderRadius: 10, paddingX: 26, paddingY: 14, accentWidth: 8, borderWidth: 3,
        shadowOffset: 8, shadowColor: '#FF6B00', skewX: -3, gap: 6,
        primaryBg: '#1A1128', primaryColor: '#FF6B00',
        secondaryBg: '#9B5DE5', secondaryColor: '#FFFFFF',
        accentColor: '#FF6B00', iconBg: '#FF6B00', iconColor: '#000000',
        tagBg: '#000000', tagColor: '#FF6B00', borderColor: '#FF6B00',
        decor: 'halloween', decorColor: '#FF6B00', pattern: 'stripes', patternOpacity: 0.16,
        primaryFont: 'Creepster', primarySize: 48, primaryWeight: 400, primaryLetterSpacing: 4,
        secondaryFont: 'Space Grotesk', secondarySize: 20, secondaryWeight: 700,
        animStyle: 'pop-elastic', animSpeed: 1, animBounce: 1.35, animDirection: 'bottom'
      }
    },
    {
      name: 'Saint-Valentin — Courrier du Cœur',
      cat: 'fetes',
      catLabel: '💖 Fêtes & Saisons',
      asset: {
        kind: 'synthe',
        primaryText: 'Juliette & Roméo',
        secondaryText: 'Émission Spéciale Saint-Valentin • Campus',
        tagText: 'LOVE LIVE',
        icon: 'fa-solid fa-heart',
        mode: 'auto', duration: 6,
        layout: 'capsule', align: 'left', posX: 96, posY: 84, scale: 1,
        borderRadius: 36, paddingX: 28, paddingY: 14, accentWidth: 8, borderWidth: 2,
        shadowOffset: 5, shadowColor: '#800F2F', skewX: 0, gap: 6,
        primaryBg: '#FFF0F3', primaryColor: '#800F2F',
        secondaryBg: '#FF2A6D', secondaryColor: '#FFFFFF',
        accentColor: '#FF2A6D', iconBg: '#FF2A6D', iconColor: '#FFFFFF',
        tagBg: '#800F2F', tagColor: '#FFFFFF', borderColor: '#FF2A6D',
        decor: 'valentines', decorColor: '#FF2A6D', pattern: 'dots', patternOpacity: 0.14,
        primaryFont: 'Great Vibes', primarySize: 50, primaryWeight: 400,
        secondaryFont: 'Quicksand', secondarySize: 19, secondaryWeight: 700,
        animStyle: 'wave-stagger', animSpeed: 1, animBounce: 1.25, animDirection: 'bottom'
      }
    },
    {
      name: 'Pâques & Printemps Pop',
      cat: 'fetes',
      catLabel: '🥚 Fêtes & Saisons',
      asset: {
        kind: 'synthe',
        primaryText: 'Chloé Printemps',
        secondaryText: 'Chasse aux œufs & Chocolaterie Artisanale',
        tagText: 'SPÉCIAL PÂQUES',
        icon: 'fa-solid fa-egg',
        mode: 'auto', duration: 6,
        layout: 'floating', align: 'left', posX: 96, posY: 84, scale: 1,
        borderRadius: 20, paddingX: 26, paddingY: 14, accentWidth: 8, borderWidth: 2,
        shadowOffset: 5, shadowColor: '#3B2F2F', skewX: 0, gap: 8,
        primaryBg: '#FFFDF7', primaryColor: '#3B2F2F',
        secondaryBg: '#FF85A1', secondaryColor: '#000000',
        accentColor: '#70D6FF', iconBg: '#BDE0FE', iconColor: '#000000',
        tagBg: '#70D6FF', tagColor: '#000000', borderColor: '#3B2F2F',
        decor: 'easter', decorColor: '#FF85A1', pattern: 'dots', patternOpacity: 0.14,
        primaryFont: 'Fredoka', primarySize: 40, primaryWeight: 700,
        secondaryFont: 'Nunito', secondarySize: 20, secondaryWeight: 700,
        animStyle: 'bouncy-rise', animSpeed: 1, animBounce: 1.3, animDirection: 'bottom'
      }
    },
    {
      name: 'Summer Vibes & Festival d’Été',
      cat: 'fetes',
      catLabel: '☀️ Fêtes & Saisons',
      asset: {
        kind: 'synthe',
        primaryText: 'Matéo Soler',
        secondaryText: 'En direct de la scène principale • Festival',
        tagText: 'SUMMER LIVE',
        icon: 'fa-solid fa-sun',
        mode: 'auto', duration: 6,
        layout: 'layered', align: 'left', posX: 96, posY: 84, scale: 1,
        borderRadius: 16, paddingX: 28, paddingY: 14, accentWidth: 10, borderWidth: 2,
        shadowOffset: 6, shadowColor: '#023E8A', skewX: 0, gap: 6,
        primaryBg: '#0077B6', primaryColor: '#FFFFFF',
        secondaryBg: '#FFB703', secondaryColor: '#000000',
        accentColor: '#FB8500', iconBg: '#FFB703', iconColor: '#000000',
        tagBg: '#FB8500', tagColor: '#FFFFFF', borderColor: '#FFB703',
        decor: 'summer', decorColor: '#FFB703', pattern: 'waves', patternOpacity: 0.18,
        primaryFont: 'Pacifico', primarySize: 42, primaryWeight: 400,
        secondaryFont: 'Montserrat', secondarySize: 19, secondaryWeight: 700,
        animStyle: 'wave-stagger', animSpeed: 1, animBounce: 1.2, animDirection: 'bottom'
      }
    },
    {
      name: 'Anniversaire & Confettis Party',
      cat: 'fetes',
      catLabel: '🎉 Fêtes & Saisons',
      asset: {
        kind: 'synthe',
        primaryText: 'Les 10 Ans de la WebTV !',
        secondaryText: 'Émission Anniversaire • Anciens & Étudiants',
        tagText: 'CELEBRATION',
        icon: 'fa-solid fa-cake-candles',
        mode: 'auto', duration: 6.5,
        layout: 'brutalist', align: 'left', posX: 96, posY: 84, scale: 1,
        borderRadius: 14, paddingX: 28, paddingY: 14, accentWidth: 8, borderWidth: 3,
        shadowOffset: 7, shadowColor: '#000000', skewX: 0, gap: 6,
        primaryBg: '#FFFFFF', primaryColor: '#141414',
        secondaryBg: '#9B5DE5', secondaryColor: '#FFFFFF',
        accentColor: '#FF2A6D', iconBg: '#00F5D4', iconColor: '#000000',
        tagBg: '#FAB001', tagColor: '#000000', borderColor: '#000000',
        decor: 'confetti', decorColor: '#FF2A6D', pattern: 'dots', patternOpacity: 0.14,
        primaryFont: 'Luckiest Guy', primarySize: 40, primaryWeight: 400, primaryLetterSpacing: 2,
        secondaryFont: 'Poppins', secondarySize: 19, secondaryWeight: 700,
        animStyle: 'festive-sparkle', animSpeed: 1, animBounce: 1.35, animDirection: 'bottom'
      }
    },
    {
      name: 'Cérémonie Remise de Diplômes BUT MMI',
      cat: 'fetes',
      catLabel: '🎓 Fêtes & Saisons',
      asset: {
        kind: 'synthe',
        primaryText: 'Promotion 2026 — BUT MMI',
        secondaryText: 'Cérémonie officielle • IUT de Troyes',
        tagText: 'DIPLÔMÉS',
        icon: 'fa-solid fa-graduation-cap',
        mode: 'auto', duration: 6.5,
        layout: 'editorial', align: 'left', posX: 96, posY: 84, scale: 1,
        borderRadius: 10, paddingX: 28, paddingY: 14, accentWidth: 8, borderWidth: 1,
        shadowOffset: 5, shadowColor: '#000000', skewX: 0, gap: 6,
        primaryBg: '#1B263B', primaryColor: '#FFFFFF',
        secondaryBg: '#FAB001', secondaryColor: '#000000',
        accentColor: '#FAB001', iconBg: '#FAB001', iconColor: '#1B263B',
        tagBg: '#FAB001', tagColor: '#000000', borderColor: '#FAB001',
        decor: 'campus', decorColor: '#FAB001', pattern: 'none',
        primaryFont: 'Playfair Display', primarySize: 40, primaryWeight: 700,
        secondaryFont: 'Montserrat', secondarySize: 18, secondaryWeight: 700, secondaryUppercase: true,
        animStyle: 'velvet-glide', animSpeed: 1, animBounce: 1, animDirection: 'bottom'
      }
    },
    {
      name: 'Soirée Carnaval & BDE',
      cat: 'fetes',
      catLabel: '🎭 Fêtes & Saisons',
      asset: {
        kind: 'synthe',
        primaryText: 'Collectif BDE MMI',
        secondaryText: 'Organisation Soirée Étudiante & Animations',
        tagText: 'VIE ÉTUDIANTE',
        icon: 'fa-solid fa-masks-theater',
        mode: 'auto', duration: 6,
        layout: 'badge-card', align: 'left', posX: 96, posY: 84, scale: 1,
        borderRadius: 16, paddingX: 28, paddingY: 14, accentWidth: 8, borderWidth: 3,
        shadowOffset: 6, shadowColor: '#000000', skewX: -2, gap: 6,
        primaryBg: '#FFBE0B', primaryColor: '#000000',
        secondaryBg: '#8338EC', secondaryColor: '#FFFFFF',
        accentColor: '#FF006E', iconBg: '#FF006E', iconColor: '#FFFFFF',
        tagBg: '#3A86FF', tagColor: '#FFFFFF', borderColor: '#000000',
        decor: 'confetti', decorColor: '#FF006E', pattern: 'chevron', patternOpacity: 0.12,
        primaryFont: 'Bangers', primarySize: 44, primaryWeight: 400, primaryLetterSpacing: 3,
        secondaryFont: 'Quicksand', secondarySize: 20, secondaryWeight: 700,
        animStyle: 'pop-elastic', animSpeed: 1, animBounce: 1.3, animDirection: 'bottom'
      }
    },

    // ================= MMI, JT & PLATEAU (7) =================
    {
      name: 'Signature MMI — Décalé Blanc & Or',
      cat: 'mmi',
      catLabel: '📺 MMI & Plateau',
      asset: {
        kind: 'synthe',
        primaryText: 'Camille Moreau',
        secondaryText: 'Réalisatrice • Plateau MMI',
        tagText: '',
        icon: 'fa-solid fa-video',
        mode: 'auto', duration: 6,
        layout: 'layered', align: 'left', posX: 96, posY: 84, scale: 1,
        borderRadius: 10, paddingX: 26, paddingY: 14, accentWidth: 8, borderWidth: 0,
        shadowOffset: 0, shadowColor: '#000000', skewX: 0, gap: 6,
        primaryBg: '#FFFFFF', primaryColor: '#000000',
        secondaryBg: '#FAB001', secondaryColor: '#000000',
        accentColor: '#FAB001', iconBg: '#404040', iconColor: '#FAB001',
        tagBg: '#000000', tagColor: '#FAB001', borderColor: '#000000',
        decor: 'none', pattern: 'none',
        primaryFont: 'Quicksand', primarySize: 42, primaryWeight: 700,
        secondaryFont: 'Quicksand', secondarySize: 22, secondaryWeight: 600,
        animStyle: 'bouncy-rise', animSpeed: 1, animBounce: 1, animDirection: 'bottom'
      }
    },
    {
      name: 'Invité Plateau — Bloc Unifié Anthracite',
      cat: 'mmi',
      catLabel: '🎙️ MMI & Plateau',
      asset: {
        kind: 'synthe',
        primaryText: 'Lucas Bernard',
        secondaryText: 'Enseignant-chercheur • IUT de Troyes',
        tagText: 'INVITÉ',
        icon: 'fa-solid fa-microphone-lines',
        mode: 'manual', duration: 7,
        layout: 'split', align: 'left', posX: 96, posY: 84, scale: 1,
        borderRadius: 12, paddingX: 26, paddingY: 14, accentWidth: 8, borderWidth: 0,
        shadowOffset: 0, shadowColor: '#000000', skewX: 0, gap: 6,
        primaryBg: '#404040', primaryColor: '#FFFFFF',
        secondaryBg: '#FAB001', secondaryColor: '#000000',
        accentColor: '#FAB001', iconBg: '#000000', iconColor: '#FAB001',
        tagBg: '#FAB001', tagColor: '#000000', borderColor: '#000000',
        decor: 'none', pattern: 'none',
        primaryFont: 'Quicksand', primarySize: 40, primaryWeight: 700,
        secondaryFont: 'Quicksand', secondarySize: 21, secondaryWeight: 600,
        animStyle: 'bouncy-rise', animSpeed: 1, animBounce: 1, animDirection: 'bottom'
      }
    },
    {
      name: 'JT 20H — Bannière News & Direct',
      cat: 'mmi',
      catLabel: '📰 JT & Info',
      asset: {
        kind: 'synthe',
        primaryText: 'Édition Spéciale : Portes Ouvertes IUT',
        secondaryText: 'En direct du studio WebTV • Troyes',
        tagText: 'EN DIRECT',
        icon: 'fa-solid fa-tower-broadcast',
        mode: 'auto', duration: 6.5,
        layout: 'banner', align: 'left', posX: 96, posY: 84, scale: 1,
        borderRadius: 8, paddingX: 28, paddingY: 14, accentWidth: 6, borderWidth: 0,
        shadowOffset: 6, shadowColor: '#000000', skewX: 0, gap: 6,
        primaryBg: '#FFFFFF', primaryColor: '#0B090A',
        secondaryBg: '#161A1D', secondaryColor: '#FFFFFF',
        accentColor: '#D90429', iconBg: '#D90429', iconColor: '#FFFFFF',
        tagBg: '#D90429', tagColor: '#FFFFFF', borderColor: '#000000',
        decor: 'none', pattern: 'grid', patternOpacity: 0.08,
        primaryFont: 'Montserrat', primarySize: 36, primaryWeight: 800, primaryUppercase: true,
        secondaryFont: 'Inter', secondarySize: 19, secondaryWeight: 600,
        animStyle: 'kinetic-slide', animSpeed: 0.9, animBounce: 1, animDirection: 'left'
      }
    },
    {
      name: 'Magazine Culturel — Éditorial Prestige',
      cat: 'mmi',
      catLabel: '📚 Magazine',
      asset: {
        kind: 'synthe',
        primaryText: 'jeanne Vasseur',
        secondaryText: 'Réalisatrice & Critique Cinéma',
        tagText: 'RENCONTRE',
        icon: 'fa-solid fa-feather-pointed',
        mode: 'auto', duration: 6,
        layout: 'editorial', align: 'left', posX: 96, posY: 84, scale: 1,
        borderRadius: 6, paddingX: 28, paddingY: 14, accentWidth: 8, borderWidth: 0,
        shadowOffset: 0, shadowColor: '#000000', skewX: 0, gap: 6,
        primaryBg: '#FFFFFF', primaryColor: '#141414',
        secondaryBg: '#141414', secondaryColor: '#FAB001',
        accentColor: '#FAB001', iconBg: '#141414', iconColor: '#FAB001',
        tagBg: '#FAB001', tagColor: '#000000', borderColor: '#000000',
        decor: 'none', pattern: 'none',
        primaryFont: 'DM Serif Display', primarySize: 42, primaryWeight: 400,
        secondaryFont: 'Montserrat', secondarySize: 17, secondaryWeight: 700, secondaryUppercase: true, secondaryLetterSpacing: 8,
        animStyle: 'velvet-glide', animSpeed: 1, animBounce: 1, animDirection: 'bottom'
      }
    },
    {
      name: 'Capsule Moderne — Noir & Jaune MMI',
      cat: 'mmi',
      catLabel: '⚡ MMI & Plateau',
      asset: {
        kind: 'synthe',
        primaryText: 'Éléa Fontaine',
        secondaryText: 'Étudiante BUT MMI 3 • Création Numérique',
        tagText: '',
        icon: 'fa-solid fa-bolt',
        mode: 'auto', duration: 5.5,
        layout: 'capsule', align: 'left', posX: 96, posY: 84, scale: 1,
        borderRadius: 32, paddingX: 26, paddingY: 13, accentWidth: 6, borderWidth: 0,
        shadowOffset: 0, shadowColor: '#000000', skewX: 0, gap: 6,
        primaryBg: '#000000', primaryColor: '#FFFFFF',
        secondaryBg: '#FFFFFF', secondaryColor: '#000000',
        accentColor: '#FAB001', iconBg: '#FAB001', iconColor: '#000000',
        tagBg: '#FAB001', tagColor: '#000000', borderColor: '#FAB001',
        decor: 'none', pattern: 'none',
        primaryFont: 'Quicksand', primarySize: 40, primaryWeight: 700,
        secondaryFont: 'Quicksand', secondarySize: 21, secondaryWeight: 600,
        animStyle: 'spring-cascade', animSpeed: 1, animBounce: 1, animDirection: 'bottom'
      }
    },
    {
      name: 'Pastilles Flottantes — Talk-Show',
      cat: 'mmi',
      catLabel: '💬 Talk-Show',
      asset: {
        kind: 'synthe',
        primaryText: 'Hugo Chevalier',
        secondaryText: 'Animateur • Le Talk du Jeudi',
        tagText: 'TALK-SHOW',
        icon: 'fa-solid fa-comments',
        mode: 'auto', duration: 6,
        layout: 'floating', align: 'left', posX: 96, posY: 84, scale: 1,
        borderRadius: 18, paddingX: 26, paddingY: 14, accentWidth: 8, borderWidth: 0,
        shadowOffset: 5, shadowColor: '#000000', skewX: 0, gap: 8,
        primaryBg: '#FAB001', primaryColor: '#000000',
        secondaryBg: '#FFFFFF', secondaryColor: '#000000',
        accentColor: '#000000', iconBg: '#000000', iconColor: '#FAB001',
        tagBg: '#404040', tagColor: '#FFFFFF', borderColor: '#000000',
        decor: 'none', pattern: 'none',
        primaryFont: 'Poppins', primarySize: 38, primaryWeight: 800,
        secondaryFont: 'Quicksand', secondarySize: 20, secondaryWeight: 700,
        animStyle: 'wave-stagger', animSpeed: 1, animBounce: 1.2, animDirection: 'bottom'
      }
    },
    {
      name: 'Micro-Trottoir Campus — Style Marker',
      cat: 'mmi',
      catLabel: '🎤 Micro-Trottoir',
      asset: {
        kind: 'synthe',
        primaryText: 'Yanis • BUT MMI 1',
        secondaryText: '« Mon projet préféré du semestre ! »',
        tagText: 'MICRO-TROTTOIR',
        icon: 'fa-solid fa-street-view',
        mode: 'auto', duration: 5.5,
        layout: 'brutalist', align: 'left', posX: 96, posY: 84, scale: 1,
        borderRadius: 12, paddingX: 26, paddingY: 13, accentWidth: 8, borderWidth: 3,
        shadowOffset: 6, shadowColor: '#000000', skewX: -2, gap: 6,
        primaryBg: '#FFFFFF', primaryColor: '#000000',
        secondaryBg: '#FAB001', secondaryColor: '#000000',
        accentColor: '#FAB001', iconBg: '#FAB001', iconColor: '#000000',
        tagBg: '#000000', tagColor: '#FAB001', borderColor: '#000000',
        decor: 'none', pattern: 'dots', patternOpacity: 0.1,
        primaryFont: 'Permanent Marker', primarySize: 38, primaryWeight: 400,
        secondaryFont: 'Caveat', secondarySize: 28, secondaryWeight: 700,
        animStyle: 'whip-skew', animSpeed: 0.95, animBounce: 1.2, animDirection: 'left'
      }
    },

    // ================= CRÉATIF, GAMING & SPORT (7) =================
    {
      name: 'Esport & Stream — Cyberpunk Glitch',
      cat: 'creatif',
      catLabel: '🕹️ Gaming & Esport',
      asset: {
        kind: 'synthe',
        primaryText: 'KRAKEN_MMI',
        secondaryText: 'Caster Officiel • Tournoi LAN IUT',
        tagText: 'PRO LEAGUE',
        icon: 'fa-solid fa-gamepad',
        mode: 'auto', duration: 6,
        layout: 'ribbon', align: 'left', posX: 96, posY: 84, scale: 1,
        borderRadius: 6, paddingX: 28, paddingY: 14, accentWidth: 10, borderWidth: 2,
        shadowOffset: 6, shadowColor: '#FF2A6D', skewX: -6, gap: 6,
        primaryBg: '#0D0221', primaryColor: '#00F5D4',
        secondaryBg: '#FF2A6D', secondaryColor: '#FFFFFF',
        accentColor: '#00F5D4', iconBg: '#FF2A6D', iconColor: '#FFFFFF',
        tagBg: '#00F5D4', tagColor: '#0D0221', borderColor: '#00F5D4',
        decor: 'retro', decorColor: '#00F5D4', pattern: 'grid', patternOpacity: 0.25,
        primaryFont: 'Righteous', primarySize: 42, primaryWeight: 400, primaryLetterSpacing: 4,
        secondaryFont: 'JetBrains Mono', secondarySize: 18, secondaryWeight: 700, secondaryUppercase: true,
        animStyle: 'glitch-snap', animSpeed: 1, animBounce: 1, animDirection: 'left'
      }
    },
    {
      name: 'Rétro Gaming 8-Bit Pixel',
      cat: 'creatif',
      catLabel: '👾 Rétro Arcade',
      asset: {
        kind: 'synthe',
        primaryText: 'PLAYER 1 : ALEX',
        secondaryText: 'HIGH SCORE : 99 420 PTS • STAGE 03',
        tagText: 'INSERT COIN',
        icon: 'fa-solid fa-trophy',
        mode: 'auto', duration: 6,
        layout: 'brutalist', align: 'left', posX: 96, posY: 84, scale: 1,
        borderRadius: 0, paddingX: 24, paddingY: 16, accentWidth: 8, borderWidth: 4,
        shadowOffset: 8, shadowColor: '#FF007F', skewX: 0, gap: 6,
        primaryBg: '#000000', primaryColor: '#39FF14',
        secondaryBg: '#FF007F', secondaryColor: '#FFFFFF',
        accentColor: '#39FF14', iconBg: '#39FF14', iconColor: '#000000',
        tagBg: '#FFBE0B', tagColor: '#000000', borderColor: '#39FF14',
        decor: 'retro', decorColor: '#39FF14', pattern: 'checker', patternOpacity: 0.15,
        primaryFont: 'Press Start 2P', primarySize: 26, primaryWeight: 400,
        secondaryFont: 'JetBrains Mono', secondarySize: 17, secondaryWeight: 700,
        animStyle: 'glitch-snap', animSpeed: 1, animBounce: 1, animDirection: 'bottom'
      }
    },
    {
      name: 'Sport & Match — Ruban Biseauté',
      cat: 'creatif',
      catLabel: '🏆 Sport & Direct',
      asset: {
        kind: 'synthe',
        primaryText: 'MAXIME LEROY',
        secondaryText: 'Capitaine Équipe Universitaire • Finale',
        tagText: 'FINALE CAMPUS',
        icon: 'fa-solid fa-medal',
        mode: 'auto', duration: 6,
        layout: 'ribbon', align: 'left', posX: 96, posY: 84, scale: 1,
        borderRadius: 4, paddingX: 30, paddingY: 13, accentWidth: 10, borderWidth: 0,
        shadowOffset: 5, shadowColor: '#000000', skewX: -8, gap: 5,
        primaryBg: '#11151C', primaryColor: '#FFFFFF',
        secondaryBg: '#CCFF00', secondaryColor: '#000000',
        accentColor: '#CCFF00', iconBg: '#CCFF00', iconColor: '#000000',
        tagBg: '#FFFFFF', tagColor: '#000000', borderColor: '#CCFF00',
        decor: 'trophy', decorColor: '#CCFF00', pattern: 'chevron', patternOpacity: 0.15,
        primaryFont: 'Bebas Neue', primarySize: 52, primaryWeight: 400, primaryLetterSpacing: 4,
        secondaryFont: 'Oswald', secondarySize: 21, secondaryWeight: 600, secondaryUppercase: true,
        animStyle: 'whip-skew', animSpeed: 0.9, animBounce: 1.15, animDirection: 'left'
      }
    },
    {
      name: 'Néo-Brutaliste Pop & Créatif',
      cat: 'creatif',
      catLabel: '🎨 Design & Pop',
      asset: {
        kind: 'synthe',
        primaryText: 'Salomé Garnier',
        secondaryText: 'Direction Artistique & Motion Design',
        tagText: 'CRÉATION',
        icon: 'fa-solid fa-palette',
        mode: 'auto', duration: 6,
        layout: 'brutalist', align: 'left', posX: 96, posY: 84, scale: 1,
        borderRadius: 10, paddingX: 28, paddingY: 14, accentWidth: 8, borderWidth: 4,
        shadowOffset: 8, shadowColor: '#000000', skewX: 0, gap: 6,
        primaryBg: '#FFBE0B', primaryColor: '#000000',
        secondaryBg: '#FFFFFF', secondaryColor: '#000000',
        accentColor: '#FB5607', iconBg: '#FF006E', iconColor: '#FFFFFF',
        tagBg: '#8338EC', tagColor: '#FFFFFF', borderColor: '#000000',
        decor: 'none', pattern: 'dots', patternOpacity: 0.14,
        primaryFont: 'Archivo Black', primarySize: 38, primaryWeight: 400,
        secondaryFont: 'Space Grotesk', secondarySize: 20, secondaryWeight: 700,
        animStyle: 'pop-elastic', animSpeed: 1, animBounce: 1.35, animDirection: 'bottom'
      }
    },
    {
      name: 'Session Live & Concert Acoustique',
      cat: 'creatif',
      catLabel: '🎵 Musique & Live',
      asset: {
        kind: 'synthe',
        primaryText: 'Duo Éclipse',
        secondaryText: 'Session Live • Scène Ouverte MMI',
        tagText: 'LIVE SESSION',
        icon: 'fa-solid fa-music',
        mode: 'auto', duration: 6,
        layout: 'badge-card', align: 'left', posX: 96, posY: 84, scale: 1,
        borderRadius: 16, paddingX: 28, paddingY: 14, accentWidth: 8, borderWidth: 2,
        shadowOffset: 6, shadowColor: '#10002B', skewX: 0, gap: 6,
        primaryBg: '#240046', primaryColor: '#FFFFFF',
        secondaryBg: '#FF9E00', secondaryColor: '#000000',
        accentColor: '#E0AAFF', iconBg: '#7B2CBF', iconColor: '#FFFFFF',
        tagBg: '#E0AAFF', tagColor: '#240046', borderColor: '#E0AAFF',
        decor: 'music', decorColor: '#FF9E00', pattern: 'waves', patternOpacity: 0.16,
        primaryFont: 'Righteous', primarySize: 40, primaryWeight: 400,
        secondaryFont: 'Poppins', secondarySize: 19, secondaryWeight: 600,
        animStyle: 'flip-3d', animSpeed: 1, animBounce: 1.2, animDirection: 'bottom'
      }
    },
    {
      name: 'Battle & Défi — Feu & Action',
      cat: 'creatif',
      catLabel: '🔥 Battle & Quiz',
      asset: {
        kind: 'synthe',
        primaryText: 'Équipe Rouge vs Équipe Or',
        secondaryText: 'Manche Finale • Le Grand Quiz de la Régie',
        tagText: 'DUEL EN DIRECT',
        icon: 'fa-solid fa-fire-flame-curved',
        mode: 'auto', duration: 6,
        layout: 'ribbon', align: 'left', posX: 96, posY: 84, scale: 1,
        borderRadius: 8, paddingX: 28, paddingY: 14, accentWidth: 10, borderWidth: 2,
        shadowOffset: 6, shadowColor: '#000000', skewX: -4, gap: 6,
        primaryBg: '#1A090D', primaryColor: '#FFFFFF',
        secondaryBg: '#FF5400', secondaryColor: '#FFFFFF',
        accentColor: '#FFBD00', iconBg: '#FFBD00', iconColor: '#000000',
        tagBg: '#FF0054', tagColor: '#FFFFFF', borderColor: '#FF5400',
        decor: 'fire', decorColor: '#FFBD00', pattern: 'stripes', patternOpacity: 0.15,
        primaryFont: 'Anton', primarySize: 44, primaryWeight: 400, primaryLetterSpacing: 3,
        secondaryFont: 'Montserrat', secondarySize: 19, secondaryWeight: 700,
        animStyle: 'shutter-reveal', animSpeed: 0.95, animBounce: 1.25, animDirection: 'bottom'
      }
    },
    {
      name: 'Ticket Festival Court-Métrage',
      cat: 'creatif',
      catLabel: '🎬 Cinéma & Jury',
      asset: {
        kind: 'synthe',
        primaryText: '« L’Heure Bleue » — Court-Métrage',
        secondaryText: 'Réalisé par l’équipe SAE Audiovisuel S5',
        tagText: 'SÉLECTION OFFICIELLE',
        icon: 'fa-solid fa-film',
        mode: 'auto', duration: 6.5,
        layout: 'ticket', align: 'left', posX: 96, posY: 84, scale: 1,
        borderRadius: 10, paddingX: 28, paddingY: 14, accentWidth: 8, borderWidth: 2,
        shadowOffset: 6, shadowColor: '#000000', skewX: 0, gap: 6,
        primaryBg: '#141414', primaryColor: '#FFFFFF',
        secondaryBg: '#E5C158', secondaryColor: '#000000',
        accentColor: '#E5C158', iconBg: '#E5C158', iconColor: '#000000',
        tagBg: '#E5C158', tagColor: '#000000', borderColor: '#E5C158',
        decor: 'trophy', decorColor: '#E5C158', pattern: 'none',
        primaryFont: 'Abril Fatface', primarySize: 38, primaryWeight: 400,
        secondaryFont: 'Raleway', secondarySize: 18, secondaryWeight: 700,
        animStyle: 'origami-unfold', animSpeed: 1, animBounce: 1.15, animDirection: 'bottom'
      }
    },

    // ================= TITRES DE SÉQUENCE (5) =================
    {
      name: 'Titre Séquence — Bandeau Minimal MMI',
      cat: 'titres',
      catLabel: '🏷️ Titre Centré',
      asset: {
        kind: 'titre',
        primaryText: 'Les coulisses de la WebTV',
        secondaryText: 'SÉQUENCE 01',
        tagText: '',
        icon: 'fa-solid fa-clapperboard',
        mode: 'auto', duration: 5,
        layout: 'minimal', align: 'center', posX: 0, posY: 60, scale: 1,
        borderRadius: 10, paddingX: 26, paddingY: 12, accentWidth: 5, borderWidth: 0,
        shadowOffset: 0, shadowColor: '#000000', skewX: 0, gap: 6,
        primaryBg: '#404040', primaryColor: '#FFFFFF',
        secondaryBg: '#FAB001', secondaryColor: '#000000',
        accentColor: '#FAB001', iconBg: '#FAB001', iconColor: '#000000',
        tagBg: '#FAB001', tagColor: '#000000', borderColor: '#000000',
        decor: 'none', pattern: 'none',
        primaryFont: 'Quicksand', primarySize: 27, primaryWeight: 600,
        secondaryFont: 'Quicksand', secondarySize: 15, secondaryWeight: 700, secondaryUppercase: true,
        animStyle: 'elastic-wipe', animSpeed: 1, animBounce: 1, animDirection: 'bottom'
      }
    },
    {
      name: 'Titre Pilule — Débat en Direct',
      cat: 'titres',
      catLabel: '🏷️ Titre Centré',
      asset: {
        kind: 'titre',
        primaryText: 'Débat : L’audiovisuel en direct',
        secondaryText: 'TABLE RONDE',
        tagText: '',
        icon: 'fa-solid fa-tower-broadcast',
        mode: 'manual', duration: 6,
        layout: 'minimal', align: 'center', posX: 0, posY: 60, scale: 1,
        borderRadius: 99, paddingX: 28, paddingY: 12, accentWidth: 5, borderWidth: 0,
        shadowOffset: 0, shadowColor: '#000000', skewX: 0, gap: 6,
        primaryBg: '#FFFFFF', primaryColor: '#000000',
        secondaryBg: '#404040', secondaryColor: '#FFFFFF',
        accentColor: '#FAB001', iconBg: '#FAB001', iconColor: '#000000',
        tagBg: '#000000', tagColor: '#FAB001', borderColor: '#000000',
        decor: 'none', pattern: 'none',
        primaryFont: 'Quicksand', primarySize: 26, primaryWeight: 700,
        secondaryFont: 'Quicksand', secondarySize: 14, secondaryWeight: 700, secondaryUppercase: true,
        animStyle: 'bouncy-rise', animSpeed: 1, animBounce: 1, animDirection: 'bottom'
      }
    },
    {
      name: 'Titre Cadre Gala & Remise de Prix',
      cat: 'titres',
      catLabel: '✨ Titre Centré',
      asset: {
        kind: 'titre',
        primaryText: 'Catégorie : Meilleur Montage Vidéo',
        secondaryText: 'TROPHÉES MMI 2026',
        tagText: '',
        icon: 'fa-solid fa-trophy',
        mode: 'auto', duration: 5.5,
        layout: 'frame', align: 'center', posX: 0, posY: 60, scale: 1,
        borderRadius: 12, paddingX: 30, paddingY: 12, accentWidth: 6, borderWidth: 2,
        shadowOffset: 5, shadowColor: '#000000', skewX: 0, gap: 6,
        primaryBg: '#0B0B0E', primaryColor: '#FFFFFF',
        secondaryBg: '#FFD166', secondaryColor: '#0B0B0E',
        accentColor: '#FFD166', iconBg: '#FFD166', iconColor: '#0B0B0E',
        tagBg: '#FFD166', tagColor: '#0B0B0E', borderColor: '#FFD166',
        decor: 'trophy', decorColor: '#FFD166', pattern: 'stars', patternOpacity: 0.18,
        primaryFont: 'Cinzel', primarySize: 28, primaryWeight: 700,
        secondaryFont: 'Montserrat', secondarySize: 14, secondaryWeight: 700, secondaryUppercase: true,
        animStyle: 'festive-sparkle', animSpeed: 1, animBounce: 1.2, animDirection: 'bottom'
      }
    },
    {
      name: 'Titre Quiz & Jeu Plateau — Pop',
      cat: 'titres',
      catLabel: '⚡ Titre Centré',
      asset: {
        kind: 'titre',
        primaryText: 'Question #04 : Culture Web & Médias',
        secondaryText: 'QUIZ CHRONO',
        tagText: '',
        icon: 'fa-solid fa-bolt',
        mode: 'auto', duration: 5,
        layout: 'brutalist', align: 'center', posX: 0, posY: 60, scale: 1,
        borderRadius: 12, paddingX: 28, paddingY: 12, accentWidth: 6, borderWidth: 3,
        shadowOffset: 6, shadowColor: '#000000', skewX: 0, gap: 5,
        primaryBg: '#FFBE0B', primaryColor: '#000000',
        secondaryBg: '#8338EC', secondaryColor: '#FFFFFF',
        accentColor: '#FF006E', iconBg: '#FF006E', iconColor: '#FFFFFF',
        tagBg: '#000000', tagColor: '#FFFFFF', borderColor: '#000000',
        decor: 'confetti', decorColor: '#FF006E', pattern: 'dots', patternOpacity: 0.14,
        primaryFont: 'Fredoka', primarySize: 28, primaryWeight: 700,
        secondaryFont: 'Montserrat', secondarySize: 14, secondaryWeight: 800, secondaryUppercase: true,
        animStyle: 'pop-elastic', animSpeed: 1, animBounce: 1.3, animDirection: 'scale'
      }
    },
    {
      name: 'Titre Rubrique Tech & IA',
      cat: 'titres',
      catLabel: '💻 Titre Centré',
      asset: {
        kind: 'titre',
        primaryText: 'Intelligence Artificielle & Création',
        secondaryText: 'DOSSIER TECH',
        tagText: '',
        icon: 'fa-solid fa-microchip',
        mode: 'auto', duration: 5,
        layout: 'minimal', align: 'center', posX: 0, posY: 60, scale: 1,
        borderRadius: 8, paddingX: 28, paddingY: 12, accentWidth: 5, borderWidth: 2,
        shadowOffset: 5, shadowColor: '#00F5D4', skewX: 0, gap: 6,
        primaryBg: '#0D0221', primaryColor: '#00F5D4',
        secondaryBg: '#FF2A6D', secondaryColor: '#FFFFFF',
        accentColor: '#00F5D4', iconBg: '#00F5D4', iconColor: '#0D0221',
        tagBg: '#FF2A6D', tagColor: '#FFFFFF', borderColor: '#00F5D4',
        decor: 'none', pattern: 'grid', patternOpacity: 0.22,
        primaryFont: 'Space Grotesk', primarySize: 27, primaryWeight: 700,
        secondaryFont: 'JetBrains Mono', secondarySize: 14, secondaryWeight: 700, secondaryUppercase: true,
        animStyle: 'shutter-reveal', animSpeed: 1, animBounce: 1.15, animDirection: 'bottom'
      }
    }
  ];

  const COLOR_FIELDS = [
    { key: 'primaryBg', label: 'Fond principal' },
    { key: 'primaryColor', label: 'Texte principal' },
    { key: 'secondaryBg', label: 'Fond secondaire' },
    { key: 'secondaryColor', label: 'Texte secondaire' },
    { key: 'accentColor', label: 'Accent graphique' },
    { key: 'iconBg', label: 'Fond icône' },
    { key: 'iconColor', label: 'Couleur icône' },
    { key: 'tagBg', label: 'Fond badge' },
    { key: 'tagColor', label: 'Texte badge' },
    { key: 'borderColor', label: 'Couleur bordure' },
    { key: 'decorColor', label: 'Couleur ornement' },
    { key: 'shadowColor', label: 'Couleur ombre' }
  ];

  const ICON_CHOICES = [
    '',
    'fa-solid fa-user',
    'fa-solid fa-microphone-lines',
    'fa-solid fa-video',
    'fa-solid fa-clapperboard',
    'fa-solid fa-tower-broadcast',
    'fa-solid fa-tv',
    'fa-solid fa-bolt',
    'fa-solid fa-bullhorn',
    'fa-solid fa-comments',
    'fa-solid fa-graduation-cap',
    'fa-solid fa-award',
    'fa-solid fa-trophy',
    'fa-solid fa-crown',
    'fa-solid fa-medal',
    'fa-solid fa-star',
    'fa-solid fa-wand-magic-sparkles',
    'fa-solid fa-snowflake',
    'fa-solid fa-gift',
    'fa-solid fa-gifts',
    'fa-solid fa-tree',
    'fa-solid fa-candy-cane',
    'fa-solid fa-sleigh',
    'fa-solid fa-bell',
    'fa-solid fa-mug-hot',
    'fa-solid fa-champagne-glasses',
    'fa-solid fa-cake-candles',
    'fa-solid fa-masks-theater',
    'fa-solid fa-ghost',
    'fa-solid fa-spider',
    'fa-solid fa-moon',
    'fa-solid fa-heart',
    'fa-solid fa-egg',
    'fa-solid fa-seedling',
    'fa-solid fa-sun',
    'fa-solid fa-umbrella-beach',
    'fa-solid fa-fire-flame-curved',
    'fa-solid fa-fire',
    'fa-solid fa-gamepad',
    'fa-solid fa-headset',
    'fa-solid fa-music',
    'fa-solid fa-headphones',
    'fa-solid fa-compact-disc',
    'fa-solid fa-camera',
    'fa-solid fa-film',
    'fa-solid fa-feather-pointed',
    'fa-solid fa-code',
    'fa-solid fa-microchip',
    'fa-solid fa-palette',
    'fa-solid fa-globe',
    'fa-solid fa-location-dot',
    'fa-solid fa-clock',
    'fa-solid fa-newspaper',
    'fa-solid fa-circle-info',
    'fa-solid fa-hashtag',
    'fa-solid fa-lightbulb',
    'fa-solid fa-briefcase',
    'fa-solid fa-users',
    'fa-solid fa-street-view',
    'fa-solid fa-play',
    'fa-solid fa-rocket',
    'fa-solid fa-gem',
    'fa-solid fa-futbol',
    'fa-solid fa-basketball'
  ];

  // State
  let assets = [];
  let profiles = [];
  let activeProfileId = null;
  let selectedId = null;
  let draft = null;
  let activeFilter = 'all';
  let searchQuery = '';
  let dragSrcId = null;

  let autoSaveEnabled = localStorage.getItem('mmitv_autosave') === '1';
  let autoSaveTimer = null;
  let pendingUnsavedAction = null;
  let pendingDeleteAssetId = null;

  // Undo / Redo History Stack (Ctrl+Z / Cmd+Z & Ctrl+Y / Cmd+Shift+Z)
  const MAX_HISTORY = 60;
  let undoStack = [];
  let redoStack = [];
  let lastCommittedDraft = null;
  let historyDebounceTimer = null;
  let isApplyingHistory = false;

  let leftCollapsed = localStorage.getItem('mmitv_left_collapsed') === '1';
  let rightCollapsed = localStorage.getItem('mmitv_right_collapsed') === '1';
  let updateOnStartup = localStorage.getItem('mmitv_update_startup') !== '0';
  let appVersion = '1.1.1';
  let githubRepo = 'noamdbc/overlay-mmitv3';
  let hasAvailableUpdate = false;
  let hasStreamDeckMismatch = false;

  let activeThemeCat = 'mmi';
  let activeGalleryCat = 'all';
  let gallerySearchQuery = '';
  let galleryRenderers = [];

  let airState = {
    phase: 'IDLE',
    currentAsset: null,
    queuedAsset: null,
    autoHideAt: null,
    autoDurationMs: null
  };
  let clockOffsetMs = 0;
  let pgmInitialized = false;
  let lanOverlayUrl = `${window.location.origin}/overlay`;

  const pvwStage = document.getElementById('pvwStage');
  const pgmStage = document.getElementById('pgmStage');
  const pvwRenderer = new window.OverlayRenderer(pvwStage);
  const pgmRenderer = new window.OverlayRenderer(pgmStage);

  const socket = window.io({ query: { role: 'control' } });

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function getSavedSelected() {
    if (!selectedId) return null;
    return assets.find((a) => a.id === selectedId) || null;
  }

  function checkDirty() {
    if (!draft) return false;
    const saved = getSavedSelected();
    if (!saved) return true;
    return JSON.stringify(draft) !== JSON.stringify(saved);
  }

  function showToast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => el.classList.add('hidden'), 1800);
  }

  // =========================================================
  // Responsive 1920x1080 Viewport Scaling
  // =========================================================
  function fitViewport(wrapId, scalerId) {
    const wrap = document.getElementById(wrapId);
    const scaler = document.getElementById(scalerId);
    if (!wrap || !scaler) return;
    const pad = 16;
    const w = Math.max(80, wrap.clientWidth - pad);
    const h = Math.max(45, wrap.clientHeight - pad);
    const scale = Math.min(w / 1920, h / 1080);
    scaler.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(4)})`;
  }

  function setupViewportObservers() {
    const ro = new ResizeObserver(() => {
      fitViewport('pvwViewport', 'pvwScaler');
      fitViewport('pgmViewport', 'pgmScaler');
    });
    ro.observe(document.getElementById('pvwViewport'));
    ro.observe(document.getElementById('pgmViewport'));
    fitViewport('pvwViewport', 'pvwScaler');
    fitViewport('pgmViewport', 'pgmScaler');
  }

  // =========================================================
  // Collapsible Workspace Panels (Left & Right)
  // =========================================================
  function applyPanelsCollapseState() {
    const ws = document.getElementById('mainWorkspace');
    const panelLeft = document.getElementById('panelLeft');
    const railLeft = document.getElementById('railLeft');
    const panelRight = document.getElementById('panelRight');
    const railRight = document.getElementById('railRight');

    if (ws) {
      ws.classList.toggle('left-collapsed', leftCollapsed);
      ws.classList.toggle('right-collapsed', rightCollapsed);
    }
    if (panelLeft) panelLeft.classList.toggle('hidden', leftCollapsed);
    if (railLeft) railLeft.classList.toggle('hidden', !leftCollapsed);
    if (panelRight) panelRight.classList.toggle('hidden', rightCollapsed);
    if (railRight) railRight.classList.toggle('hidden', !rightCollapsed);

    requestAnimationFrame(() => {
      fitViewport('pvwViewport', 'pvwScaler');
      fitViewport('pgmViewport', 'pgmScaler');
    });
  }

  function toggleLeftPanel() {
    leftCollapsed = !leftCollapsed;
    localStorage.setItem('mmitv_left_collapsed', leftCollapsed ? '1' : '0');
    applyPanelsCollapseState();
  }

  function toggleRightPanel() {
    rightCollapsed = !rightCollapsed;
    localStorage.setItem('mmitv_right_collapsed', rightCollapsed ? '1' : '0');
    applyPanelsCollapseState();
  }

  // =========================================================
  // Network Info, Version & Stream Deck Status
  // =========================================================
  async function loadNetworkInfo() {
    try {
      const res = await fetch('/api/info');
      const info = await res.json();
      if (info.serverNow) {
        clockOffsetMs = info.serverNow - Date.now();
      }
      if (info.version) {
        appVersion = info.version;
      }
      if (info.githubRepo) {
        githubRepo = info.githubRepo;
      }
      const host =
        info.ips && info.ips.length > 0
          ? `${info.ips[0].address}:${info.port}`
          : window.location.host;
      lanOverlayUrl = `http://${host}/overlay`;
      document.getElementById('lanUrlText').textContent = `${host}/overlay`;
      updateOverlayCount(info.overlayClients || 0);
      updateVersionAndStreamDeckUI(info);

      if (updateOnStartup) {
        checkUpdatesFromGitHub(true);
      }
    } catch (_e) {
      document.getElementById('lanUrlText').textContent = `${window.location.host}/overlay`;
    }
  }

  function updateOverlayCount(count) {
    const dot = document.getElementById('overlayConnDot');
    const lbl = document.getElementById('overlayCountLabel');
    dot.classList.toggle('connected', count > 0);
    lbl.textContent = `${count} Overlay${count > 1 ? 's' : ''}`;
  }

  function updateSettingsAlertDot() {
    const dot = document.getElementById('settingsAlertDot');
    if (!dot) return;
    dot.classList.toggle('hidden', !(hasAvailableUpdate || hasStreamDeckMismatch));
  }

  function updateVersionAndStreamDeckUI(data) {
    const ver = data?.version || data?.serverVersion || appVersion || '1.0.0';
    appVersion = ver;

    const topBadge = document.getElementById('topVersionBadge');
    if (topBadge) topBadge.textContent = `v${ver}`;

    const sdVerBadge = document.getElementById('sdVersionBadge');
    if (sdVerBadge) sdVerBadge.textContent = `Requis : v${ver}`;

    const sdReqVer = document.getElementById('sdReqVerText');
    if (sdReqVer) sdReqVer.textContent = `v${ver}`;

    const sdBtnVer = document.getElementById('sdBtnVerText');
    if (sdBtnVer) sdBtnVer.textContent = `v${ver}`;

    const appVerPill = document.getElementById('appVersionPill');
    if (appVerPill) appVerPill.textContent = `Installé : v${ver}`;

    if (data?.githubRepo) {
      githubRepo = data.githubRepo;
      const repoLbl = document.getElementById('githubRepoLabel');
      if (repoLbl) repoLbl.textContent = `github.com/${githubRepo}`;
    }

    const sdTotal = Number(data?.streamdeckClients || 0);
    const sdCompat = Number(data?.streamdeckCompatibleClients || 0);
    const mismatched = Array.isArray(data?.streamdeckMismatchedVersions)
      ? data.streamdeckMismatchedVersions
      : [];

    const banner = document.getElementById('sdStatusBanner');
    const dot = document.getElementById('sdStatusDot');
    const lbl = document.getElementById('sdStatusLabel');

    hasStreamDeckMismatch = mismatched.length > 0;
    updateSettingsAlertDot();

    if (!banner || !dot || !lbl) return;
    banner.classList.remove('is-ok', 'is-error');
    dot.classList.remove('connected');

    if (mismatched.length > 0) {
      banner.classList.add('is-error');
      lbl.textContent = `⚠ DÉFAUT VERSION : Stream Deck connecté en v${mismatched[0]} (Serveur v${ver} requis). Installez le plugin v${ver} ci-dessous.`;
    } else if (sdCompat > 0) {
      banner.classList.add('is-ok');
      dot.classList.add('connected');
      lbl.textContent = `${sdCompat} Stream Deck connecté${sdCompat > 1 ? 's' : ''} et synchronisé${sdCompat > 1 ? 's' : ''} (v${ver} OK)`;
    } else if (sdTotal > 0) {
      banner.classList.add('is-ok');
      dot.classList.add('connected');
      lbl.textContent = `Stream Deck connecté (v${ver})`;
    } else {
      lbl.textContent = 'Aucun Stream Deck connecté actuellement';
    }
  }

  function openExternalUrl(url) {
    if (!url) return;
    if (window.electronAPI && typeof window.electronAPI.openExternal === 'function') {
      window.electronAPI.openExternal(url);
    } else {
      window.open(url, '_blank', 'noopener');
    }
  }

  function openSettingsModal() {
    document.getElementById('settingsModal').classList.remove('hidden');
  }

  function closeSettingsModal() {
    document.getElementById('settingsModal').classList.add('hidden');
  }

  function openUpdatePromptModal(info) {
    if (!info || !info.hasUpdate) return;
    const modal = document.getElementById('updatePromptModal');
    document.getElementById('updPromptLatestVer').textContent = `v${info.latestVersion}`;
    document.getElementById('updPromptCurrentVer').textContent = `v${info.currentVersion || appVersion}`;

    const notesEl = document.getElementById('updPromptNotes');
    if (info.releaseNotes && info.releaseNotes.trim()) {
      notesEl.textContent = info.releaseNotes.trim();
      notesEl.classList.remove('hidden');
    } else {
      notesEl.classList.add('hidden');
    }

    const isMac = /Mac|iPod|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);
    const primaryBtn = document.getElementById('btnUpdPromptDownloadPrimary');
    const primaryLbl = document.getElementById('updPromptPrimaryLabel');
    const primaryUrl =
      (isMac ? info.assets?.dmg : info.assets?.exe) ||
      info.assets?.dmg ||
      info.assets?.exe ||
      info.releaseUrl ||
      `https://github.com/${githubRepo}/releases/latest`;

    primaryBtn.href = primaryUrl;
    if (isMac && info.assets?.dmg) {
      primaryLbl.textContent = `Télécharger l'installeur macOS (.dmg v${info.latestVersion})`;
    } else if (!isMac && info.assets?.exe) {
      primaryLbl.textContent = `Télécharger l'installeur Windows (.exe v${info.latestVersion})`;
    } else {
      primaryLbl.textContent = `Ouvrir la Release v${info.latestVersion} sur GitHub`;
    }

    const sdBtn = document.getElementById('btnUpdPromptDownloadSd');
    if (info.assets?.streamdeck) {
      sdBtn.href = info.assets.streamdeck;
      sdBtn.classList.remove('hidden');
    } else {
      sdBtn.classList.add('hidden');
    }

    modal.classList.remove('hidden');
  }

  function closeUpdatePromptModal() {
    document.getElementById('updatePromptModal').classList.add('hidden');
  }

  async function triggerAutoInstallUpdate(btnEl) {
    const labelEl = btnEl?.querySelector('span') || btnEl;
    const origText = labelEl ? labelEl.textContent : '';
    if (btnEl) btnEl.disabled = true;
    if (labelEl) labelEl.textContent = 'Téléchargement & installation en cours...';
    showToast('Téléchargement de la mise à jour en cours...');

    try {
      const res = await fetch('/api/install-update', { method: 'POST' });
      const data = await res.json();
      if (data?.ok) {
        showToast(data.message || 'Mise à jour installée ! Redémarrage...');
        if (labelEl) labelEl.textContent = 'Installé ! Redémarrage en cours...';
      } else {
        showToast(data?.error || 'Échec de l\'installation automatique');
        if (btnEl) btnEl.disabled = false;
        if (labelEl) labelEl.textContent = origText;
      }
    } catch (_err) {
      showToast('Redémarrage de l\'application...');
    }
  }

  async function checkUpdatesFromGitHub(isStartup = false) {
    const statusBox = document.getElementById('updateStatusBox');
    const statusText = document.getElementById('updateStatusText');
    const dlLinks = document.getElementById('updateDownloadLinks');

    if (!isStartup && statusText) {
      statusBox.classList.remove('has-update', 'up-to-date');
      statusText.textContent = 'Vérification des releases sur GitHub en cours...';
      dlLinks.classList.add('hidden');
    }

    try {
      const res = await fetch('/api/check-update');
      const info = await res.json();

      if (!info.ok) {
        if (!isStartup && statusText) {
          statusText.textContent = info.offline
            ? 'Mode hors-ligne : impossible de joindre GitHub actuellement (le logiciel fonctionne 100% hors-ligne).'
            : `Vérification indisponible : ${info.error || 'Dépôt GitHub non accessible'}`;
        }
        return;
      }

      hasAvailableUpdate = Boolean(info.hasUpdate);
      updateSettingsAlertDot();

      if (info.hasUpdate) {
        statusBox.classList.remove('up-to-date');
        statusBox.classList.add('has-update');
        statusText.textContent = `Nouvelle version v${info.latestVersion} disponible sur GitHub ! (Version installée : v${info.currentVersion})`;

        const btns = [
          `<button type="button" id="btnSettingsAutoInstall" class="btn-broadcast btn-take"><i class="fa-solid fa-bolt"></i> <span>Installer automatiquement (v${escapeText(info.latestVersion)})</span></button>`
        ];
        if (info.assets?.dmg) {
          btns.push(
            `<a href="${escapeText(info.assets.dmg)}" target="_blank" rel="noopener" class="btn-sec"><i class="fa-brands fa-apple"></i> .dmg macOS</a>`
          );
        }
        if (info.assets?.exe) {
          btns.push(
            `<a href="${escapeText(info.assets.exe)}" target="_blank" rel="noopener" class="btn-sec"><i class="fa-brands fa-windows"></i> .exe Windows</a>`
          );
        }
        if (info.assets?.streamdeck) {
          btns.push(
            `<a href="${escapeText(info.assets.streamdeck)}" target="_blank" rel="noopener" class="btn-sec"><i class="fa-solid fa-puzzle-piece"></i> Plugin Stream Deck (v${escapeText(info.latestVersion)})</a>`
          );
        }
        dlLinks.innerHTML = btns.join('');
        dlLinks.classList.remove('hidden');
        document.getElementById('btnSettingsAutoInstall')?.addEventListener('click', (e) => {
          triggerAutoInstallUpdate(e.currentTarget);
        });

        if (isStartup) {
          openUpdatePromptModal(info);
        }
      } else {
        statusBox.classList.remove('has-update');
        statusBox.classList.add('up-to-date');
        statusText.textContent = info.noReleasesYet
          ? `Vous utilisez la version v${info.currentVersion} (aucune release publique publiée sur ${info.githubRepo} pour le moment).`
          : `Votre logiciel est à jour (v${info.currentVersion}).`;
        dlLinks.classList.add('hidden');
        if (!isStartup) {
          showToast(`Logiciel à jour (v${info.currentVersion})`);
        }
      }
    } catch (_err) {
      if (!isStartup && statusText) {
        statusText.textContent = 'Impossible de vérifier les mises à jour (mode hors-ligne).';
      }
    }
  }

  // =========================================================
  // Build Font Selectors, Theme Presets, Color Matrix & Icons
  // =========================================================
  function buildFontSelectors() {
    const selP = document.getElementById('selPrimaryFont');
    const selS = document.getElementById('selSecondaryFont');

    const html = FONT_GROUPS.map((grp) => {
      const opts = grp.fonts
        .map((f) => `<option value="${f}" style="font-family:'${f}', sans-serif">${f}</option>`)
        .join('');
      return `<optgroup label="${grp.label}">${opts}</optgroup>`;
    }).join('');

    selP.innerHTML = html;
    selS.innerHTML = html;

    selP.addEventListener('change', () => {
      if (!draft) return;
      draft.primaryFont = selP.value;
      selP.style.fontFamily = `'${selP.value}', 'Quicksand', sans-serif`;
      renderPreviewStatic();
      updateDirtyUI();
    });

    selS.addEventListener('change', () => {
      if (!draft) return;
      draft.secondaryFont = selS.value;
      selS.style.fontFamily = `'${selS.value}', 'Quicksand', sans-serif`;
      renderPreviewStatic();
      updateDirtyUI();
    });
  }

  function renderThemePresets() {
    const container = document.getElementById('themePresets');
    container.innerHTML = '';

    for (const [key, item] of Object.entries(THEME_PRESETS)) {
      if (item.cat !== activeThemeCat) continue;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'theme-chip-card';
      btn.dataset.theme = key;
      const dotsHtml = item.dots.map((c) => `<span style="background:${c}"></span>`).join('');
      btn.innerHTML = `
        <span>${item.name}</span>
        <span class="theme-dots">${dotsHtml}</span>
      `;
      container.appendChild(btn);
    }
  }

  function buildColorsMatrix() {
    const container = document.getElementById('colorsMatrix');
    container.innerHTML = '';

    for (const field of COLOR_FIELDS) {
      const row = document.createElement('div');
      row.className = 'color-row';

      const swatchesHtml = BRAND_COLORS.map(
        (hex) =>
          `<button type="button" class="swatch-dot" data-color-key="${field.key}" data-hex="${hex}" style="background:${hex}" title="${hex}"></button>`
      ).join('');

      row.innerHTML = `
        <span class="color-lbl">${field.label}</span>
        <div class="color-controls">
          <div class="brand-swatches">${swatchesHtml}</div>
          <input type="color" class="color-picker-native" data-picker-key="${field.key}">
        </div>
      `;
      container.appendChild(row);
    }

    container.addEventListener('click', (e) => {
      const sw = e.target.closest('.swatch-dot');
      if (!sw || !draft) return;
      const key = sw.dataset.colorKey;
      const hex = sw.dataset.hex;
      draft[key] = hex;
      syncInspectorFromDraft();
      renderPreviewStatic();
      updateDirtyUI();
    });

    container.addEventListener('input', (e) => {
      const picker = e.target.closest('.color-picker-native');
      if (!picker || !draft) return;
      draft[picker.dataset.pickerKey] = picker.value.toUpperCase();
      renderPreviewStatic();
      updateDirtyUI();
    });
  }

  function buildIconGrid() {
    const grid = document.getElementById('iconGrid');
    grid.innerHTML = '';

    for (const cls of ICON_CHOICES) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ico-choice';
      btn.dataset.ico = cls;
      btn.title = cls || 'Aucune icône';
      btn.innerHTML = cls ? `<i class="${cls}"></i>` : `<i class="fa-solid fa-ban" style="opacity:0.45"></i>`;
      grid.appendChild(btn);
    }

    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('.ico-choice');
      if (!btn || !draft) return;
      draft.icon = btn.dataset.ico;
      syncInspectorFromDraft();
      renderPreviewStatic();
      updateDirtyUI();
    });
  }

  // =========================================================
  // Template Gallery Modal Rendering & Actions
  // =========================================================
  function openGalleryModal() {
    const modal = document.getElementById('galleryModal');
    modal.classList.remove('hidden');
    renderGalleryCards();
  }

  function closeGalleryModal() {
    const modal = document.getElementById('galleryModal');
    modal.classList.add('hidden');
    for (const r of galleryRenderers) {
      r.cut();
    }
    galleryRenderers = [];
  }

  function renderGalleryCards() {
    for (const r of galleryRenderers) {
      r.cut();
    }
    galleryRenderers = [];

    const grid = document.getElementById('galleryGrid');
    grid.innerHTML = '';

    const q = gallerySearchQuery.trim().toLowerCase();

    const list = GALLERY_TEMPLATES.filter((tpl) => {
      if (activeGalleryCat !== 'all' && tpl.cat !== activeGalleryCat) return false;
      if (q) {
        const hay = `${tpl.name} ${tpl.catLabel} ${tpl.asset.primaryText} ${tpl.asset.secondaryText} ${tpl.asset.primaryFont}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    list.forEach((tpl, idx) => {
      const card = document.createElement('div');
      card.className = 'tpl-card';

      const previewAsset = clone(tpl.asset);

      card.innerHTML = `
        <div class="tpl-preview-box">
          <span class="tpl-badge-cat">${escapeText(tpl.catLabel)}</span>
          <button type="button" class="tpl-play-btn" data-tpl-play="${idx}">
            <i class="fa-solid fa-play"></i> Tester l'anim
          </button>
          <div class="ov-stage ov-stage-thumb" id="tplStage_${idx}"></div>
        </div>
        <div class="tpl-info">
          <div class="tpl-meta">
            <span class="tpl-name" title="${escapeText(tpl.name)}">${escapeText(tpl.name)}</span>
            <span class="tpl-specs">${escapeText(tpl.asset.primaryFont || 'Quicksand')} • ${escapeText(tpl.asset.layout)}</span>
          </div>
          <div class="tpl-actions">
            <button type="button" class="btn-tpl-create" data-tpl-create="${idx}">
              <i class="fa-solid fa-plus"></i> Créer cet asset
            </button>
            <button type="button" class="btn-tpl-style" data-tpl-style="${idx}" title="Appliquer le design à l'asset en cours sans écraser son texte">
              <i class="fa-solid fa-wand-magic-sparkles"></i> Appliquer le style
            </button>
          </div>
        </div>
      `;

      grid.appendChild(card);

      const stageEl = card.querySelector(`#tplStage_${idx}`);
      const renderer = new window.OverlayRenderer(stageEl, { thumbnail: true });
      renderer.renderStatic(previewAsset);
      galleryRenderers.push(renderer);

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          if (renderer.currentEl) {
            renderer.fitThumbnail(renderer.currentEl);
          }
        });
      }

      card.querySelector(`[data-tpl-play="${idx}"]`).addEventListener('click', () => {
        renderer.playIn(previewAsset);
      });

      card.querySelector(`[data-tpl-create="${idx}"]`).addEventListener('click', () => {
        guardUnsavedChanges(() => {
          const fresh = {
            ...clone(tpl.asset),
            id: 'ast_' + Math.random().toString(36).slice(2, 10)
          };
          socket.emit('asset:save', fresh, (res) => {
            if (res?.asset) {
              selectAssetByIdImmediate(res.asset.id);
              closeGalleryModal();
              pvwRenderer.playIn(draft);
              showToast(`Template « ${tpl.name} » ajouté`);
            }
          });
        });
      });

      card.querySelector(`[data-tpl-style="${idx}"]`).addEventListener('click', () => {
        if (!draft) {
          draft = makeNewTemplate('synthe');
        }
        const keep = {
          id: draft.id,
          primaryText: draft.primaryText,
          secondaryText: draft.secondaryText,
          tagText: draft.tagText,
          mode: draft.mode,
          duration: draft.duration
        };
        Object.assign(draft, clone(tpl.asset), keep);
        syncInspectorFromDraft();
        closeGalleryModal();
        pvwRenderer.playIn(draft);
        updateDirtyUI();
        showToast(`Style « ${tpl.name} » appliqué`);
      });
    });
  }

  // =========================================================
  // Asset Selection, Creation & Rundown List Rendering
  // =========================================================
  function makeNewTemplate(kind) {
    const isTitre = kind === 'titre';
    return {
      id: 'ast_' + Math.random().toString(36).slice(2, 10),
      kind: isTitre ? 'titre' : 'synthe',
      primaryText: isTitre ? 'Nouveau titre de séquence' : 'Prénom Nom',
      secondaryText: isTitre ? '' : 'Fonction / Rôle',
      tagText: '',
      icon: isTitre ? 'fa-solid fa-clapperboard' : 'fa-solid fa-user',
      mode: 'auto',
      duration: isTitre ? 5 : 6,
      layout: isTitre ? 'minimal' : 'layered',
      align: isTitre ? 'center' : 'left',
      posX: isTitre ? 0 : 96,
      posY: isTitre ? 58 : 84,
      scale: 1,
      borderRadius: 10,
      paddingX: isTitre ? 24 : 26,
      paddingY: isTitre ? 11 : 14,
      accentWidth: isTitre ? 5 : 8,
      borderWidth: 0,
      shadowOffset: 0,
      shadowColor: '#000000',
      skewX: 0,
      gap: 6,
      primaryBg: isTitre ? '#404040' : '#FFFFFF',
      primaryColor: isTitre ? '#FFFFFF' : '#000000',
      secondaryBg: '#FAB001',
      secondaryColor: '#000000',
      accentColor: '#FAB001',
      iconBg: isTitre ? '#FAB001' : '#404040',
      iconColor: isTitre ? '#000000' : '#FAB001',
      tagBg: '#000000',
      tagColor: '#FAB001',
      borderColor: '#000000',
      decor: 'none',
      decorColor: '#FAB001',
      pattern: 'none',
      patternOpacity: 0.16,
      primaryFont: 'Quicksand',
      primarySize: isTitre ? 27 : 42,
      primaryWeight: isTitre ? 600 : 700,
      primaryUppercase: false,
      primaryItalic: false,
      primaryLetterSpacing: isTitre ? 0 : -1,
      secondaryFont: 'Quicksand',
      secondarySize: isTitre ? 15 : 22,
      secondaryWeight: 600,
      secondaryUppercase: isTitre,
      secondaryItalic: false,
      secondaryLetterSpacing: isTitre ? 6 : 1,
      animStyle: 'bouncy-rise',
      animSpeed: 1,
      animBounce: 1,
      animDirection: 'bottom'
    };
  }

  function selectAssetByIdImmediate(id) {
    const found = assets.find((a) => a.id === id);
    if (!found) return;
    flushDraftHistoryCommit();
    selectedId = found.id;
    draft = clone(found);
    lastCommittedDraft = clone(found);
    syncInspectorFromDraft();
    renderPreviewStatic();
    updateDirtyUI(true);
    renderAssetList();
  }

  function selectAssetById(id) {
    if (id === selectedId && !checkDirty()) return;
    guardUnsavedChanges(() => {
      selectAssetByIdImmediate(id);
    });
  }

  // =========================================================
  // Undo / Redo History Engine & Delete Asset Confirmation
  // =========================================================
  function updateUndoRedoButtons() {
    const btnUndo = document.getElementById('btnUndo');
    const btnRedo = document.getElementById('btnRedo');
    if (btnUndo) btnUndo.disabled = undoStack.length === 0;
    if (btnRedo) btnRedo.disabled = redoStack.length === 0;
  }

  function pushHistoryEntry(entry) {
    if (!entry) return;
    undoStack.push(entry);
    if (undoStack.length > MAX_HISTORY) {
      undoStack.shift();
    }
    redoStack = [];
    updateUndoRedoButtons();
  }

  function flushDraftHistoryCommit() {
    if (historyDebounceTimer) {
      clearTimeout(historyDebounceTimer);
      historyDebounceTimer = null;
    }
    if (isApplyingHistory || !draft || !lastCommittedDraft) return;
    if (draft.id !== lastCommittedDraft.id) {
      lastCommittedDraft = clone(draft);
      return;
    }
    if (JSON.stringify(draft) !== JSON.stringify(lastCommittedDraft)) {
      pushHistoryEntry({
        type: 'draft',
        assetId: selectedId,
        before: clone(lastCommittedDraft),
        after: clone(draft)
      });
      lastCommittedDraft = clone(draft);
    }
  }

  function scheduleDraftHistoryCommit() {
    if (isApplyingHistory || !draft) return;
    if (!lastCommittedDraft || draft.id !== lastCommittedDraft.id) {
      lastCommittedDraft = clone(draft);
      return;
    }
    clearTimeout(historyDebounceTimer);
    historyDebounceTimer = setTimeout(() => {
      historyDebounceTimer = null;
      flushDraftHistoryCommit();
    }, 260);
  }

  function performUndo() {
    flushDraftHistoryCommit();
    if (undoStack.length === 0) {
      showToast('Aucune action à annuler');
      return;
    }
    const entry = undoStack.pop();
    redoStack.push(entry);
    updateUndoRedoButtons();

    if (entry.type === 'delete-asset' && entry.asset) {
      isApplyingHistory = true;
      socket.emit('asset:save', entry.asset, (res) => {
        if (Array.isArray(entry.prevOrderIds) && entry.prevOrderIds.length > 0) {
          socket.emit('asset:reorder', entry.prevOrderIds);
        }
        if (res?.asset) {
          selectAssetByIdImmediate(res.asset.id);
        }
        isApplyingHistory = false;
        showToast(`Suppression annulée (« ${entry.asset.primaryText || 'Asset'} » restauré)`);
      });
      return;
    }

    if (entry.type === 'draft' && entry.before) {
      isApplyingHistory = true;
      if (entry.assetId && entry.assetId !== selectedId && assets.some((a) => a.id === entry.assetId)) {
        selectedId = entry.assetId;
      }
      draft = clone(entry.before);
      lastCommittedDraft = clone(entry.before);
      syncInspectorFromDraft();
      renderPreviewStatic();
      updateDirtyUI(false);
      renderAssetList();
      isApplyingHistory = false;
      showToast('Annulé (Ctrl+Z)');
    }
  }

  function performRedo() {
    flushDraftHistoryCommit();
    if (redoStack.length === 0) {
      showToast('Aucune action à rétablir');
      return;
    }
    const entry = redoStack.pop();
    undoStack.push(entry);
    updateUndoRedoButtons();

    if (entry.type === 'delete-asset' && entry.asset) {
      isApplyingHistory = true;
      executeAssetDeletion(entry.asset.id, true);
      isApplyingHistory = false;
      showToast(`Suppression rétablie (« ${entry.asset.primaryText || 'Asset'} »)`);
      return;
    }

    if (entry.type === 'draft' && entry.after) {
      isApplyingHistory = true;
      if (entry.assetId && entry.assetId !== selectedId && assets.some((a) => a.id === entry.assetId)) {
        selectedId = entry.assetId;
      }
      draft = clone(entry.after);
      lastCommittedDraft = clone(entry.after);
      syncInspectorFromDraft();
      renderPreviewStatic();
      updateDirtyUI(false);
      renderAssetList();
      isApplyingHistory = false;
      showToast('Rétabli');
    }
  }

  function openDeleteAssetModal(assetId) {
    const item = assets.find((a) => a.id === assetId);
    if (!item) return;
    pendingDeleteAssetId = assetId;
    const nameEl = document.getElementById('deleteAssetName');
    if (nameEl) {
      nameEl.textContent = item.primaryText || 'Sans titre';
    }
    document.getElementById('deleteAssetModal').classList.remove('hidden');
  }

  function closeDeleteAssetModal() {
    document.getElementById('deleteAssetModal').classList.add('hidden');
    pendingDeleteAssetId = null;
  }

  function executeAssetDeletion(id, skipHistory) {
    const item = assets.find((a) => a.id === id);
    if (!item) return;

    if (!skipHistory) {
      pushHistoryEntry({
        type: 'delete-asset',
        asset: clone(item),
        prevOrderIds: assets.map((a) => a.id)
      });
    }

    socket.emit('asset:delete', id, () => {
      if (selectedId === id) {
        const remaining = assets.filter((a) => a.id !== id);
        if (remaining.length > 0) {
          selectAssetByIdImmediate(remaining[0].id);
        } else {
          selectedId = null;
          draft = makeNewTemplate('synthe');
          lastCommittedDraft = clone(draft);
          syncInspectorFromDraft();
          renderPreviewStatic();
          updateDirtyUI(true);
        }
      }
      if (!skipHistory) {
        showToast(`Asset « ${item.primaryText || 'Sans titre'} » supprimé`);
      }
    });
  }

  function confirmDeleteAsset() {
    const id = pendingDeleteAssetId;
    closeDeleteAssetModal();
    if (!id) return;
    executeAssetDeletion(id, false);
  }

  // =========================================================
  // Unsaved Changes Guard & Auto-Save Management
  // =========================================================
  function guardUnsavedChanges(nextActionFn) {
    if (!checkDirty()) {
      nextActionFn();
      return;
    }

    // If Auto-save is enabled and we are editing a saved asset, flush save immediately
    if (autoSaveEnabled && getSavedSelected()) {
      clearTimeout(autoSaveTimer);
      saveCurrentDraft(() => {
        nextActionFn();
      });
      return;
    }

    pendingUnsavedAction = nextActionFn;
    const nameEl = document.getElementById('unsavedAssetName');
    if (nameEl) {
      nameEl.textContent = draft?.primaryText || 'Sans titre';
    }
    document.getElementById('unsavedModal').classList.remove('hidden');
  }

  function closeUnsavedModal() {
    document.getElementById('unsavedModal').classList.add('hidden');
    pendingUnsavedAction = null;
  }

  function updateDirtyUI(skipAutoSave) {
    const dirty = checkDirty();
    const savedExists = Boolean(getSavedSelected());
    document.getElementById('dirtyIndicator').classList.toggle('hidden', !dirty);
    document.getElementById('btnRevert').classList.toggle('hidden', !(dirty && savedExists));
    const btnSave = document.getElementById('btnSave');
    btnSave.classList.toggle('has-changes', dirty);
    document.getElementById('saveBtnLabel').textContent = savedExists ? 'Enregistrer' : 'Ajouter à la liste';

    if (!skipAutoSave && !isApplyingHistory) {
      scheduleDraftHistoryCommit();
    }

    if (!skipAutoSave && autoSaveEnabled && dirty && savedExists) {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        if (checkDirty() && getSavedSelected()) {
          saveCurrentDraft(null, true);
        }
      }, 320);
    }
  }

  // =========================================================
  // Multi-Profile Manager & Multi-File JSON Import/Export
  // =========================================================
  function openProfilesModal() {
    document.getElementById('profilesModal').classList.remove('hidden');
    renderProfilesUI();
  }

  function closeProfilesModal() {
    document.getElementById('profilesModal').classList.add('hidden');
  }

  function renderProfilesUI() {
    const sel = document.getElementById('profileSelect');
    if (sel) {
      sel.innerHTML = profiles
        .map(
          (p) =>
            `<option value="${escapeText(p.id)}" ${p.id === activeProfileId ? 'selected' : ''}>${escapeText(p.name)} (${p.count})</option>`
        )
        .join('');
    }

    const badge = document.getElementById('profilesCountBadge');
    if (badge) badge.textContent = String(profiles.length);

    const listEl = document.getElementById('profilesListContainer');
    if (!listEl) return;
    listEl.innerHTML = '';

    for (const p of profiles) {
      const isAct = p.id === activeProfileId;
      const card = document.createElement('div');
      card.className = `prof-card ${isAct ? 'is-active' : ''}`;

      const dateStr = p.updatedAt
        ? new Date(p.updatedAt).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })
        : '';

      card.innerHTML = `
        <div class="prof-card-left">
          <span class="prof-active-dot"></span>
          <div class="prof-card-meta">
            <div class="prof-card-title-row">
              <span class="prof-card-name">${escapeText(p.name)}</span>
              ${isAct ? '<span class="prof-badge-active">ACTIF</span>' : ''}
            </div>
            <span class="prof-card-sub">${p.count} asset${p.count > 1 ? 's' : ''}${dateStr ? ` • Modifié ${dateStr}` : ''}</span>
          </div>
        </div>
        <div class="prof-card-actions">
          ${
            !isAct
              ? `<button type="button" class="btn-sec" data-prof-act="switch" data-prof-id="${escapeText(p.id)}">
                  <i class="fa-solid fa-check"></i> Activer
                </button>`
              : ''
          }
          <button type="button" class="btn-sec" data-prof-act="rename" data-prof-id="${escapeText(p.id)}" title="Renommer ce profil">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button type="button" class="btn-sec" data-prof-act="dup" data-prof-id="${escapeText(p.id)}" title="Dupliquer ce profil">
            <i class="fa-regular fa-clone"></i>
          </button>
          <button type="button" class="btn-sec" data-prof-act="export" data-prof-id="${escapeText(p.id)}" title="Exporter ce profil (.json)">
            <i class="fa-solid fa-download"></i>
          </button>
          ${
            profiles.length > 1
              ? `<button type="button" class="btn-sec btn-danger-outline" data-prof-act="delete" data-prof-id="${escapeText(p.id)}" title="Supprimer ce profil">
                  <i class="fa-regular fa-trash-can"></i>
                </button>`
              : ''
          }
        </div>
      `;
      listEl.appendChild(card);
    }
  }

  async function handleFilesImport(fileList, mode) {
    if (!fileList || fileList.length === 0) return;
    const filesPayload = [];

    for (const file of Array.from(fileList)) {
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        filesPayload.push({
          fileName: file.name,
          data
        });
      } catch (_err) {
        showToast(`Fichier invalide ignoré : ${file.name}`);
      }
    }

    if (filesPayload.length === 0) return;

    socket.emit(
      'profile:importMany',
      {
        files: filesPayload,
        mode: mode || 'new-profiles',
        switchToImported: true
      },
      (res) => {
        if (res?.ok) {
          if (res.importedProfiles > 0) {
            showToast(
              `${res.importedProfiles} profil${res.importedProfiles > 1 ? 's' : ''} importé${res.importedProfiles > 1 ? 's' : ''} (${res.importedAssets} assets)`
            );
          } else {
            showToast(`${res.importedAssets} assets importés dans le profil actif`);
          }
          renderProfilesUI();
        } else {
          showToast('Aucun asset valide trouvé dans les fichiers');
        }
      }
    );
  }

  function renderPreviewStatic() {
    if (!draft) {
      pvwRenderer.cut();
      return;
    }
    pvwRenderer.renderStatic(draft);
  }

  function renderAssetList() {
    const listEl = document.getElementById('assetList');
    listEl.innerHTML = '';

    const q = searchQuery.trim().toLowerCase();
    const canDrag = activeFilter === 'all' && !q;

    const filtered = assets.filter((item) => {
      if (activeFilter !== 'all' && item.kind !== activeFilter) return false;
      if (q) {
        const hay = `${item.primaryText} ${item.secondaryText} ${item.tagText}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const liveId =
      airState.phase !== 'IDLE' && airState.currentAsset ? airState.currentAsset.id : null;
    const queuedId = airState.queuedAsset ? airState.queuedAsset.id : null;

    for (const item of filtered) {
      const isSelected = item.id === selectedId;
      const isLive = item.id === liveId && airState.phase !== 'EXITING';
      const isQueued = item.id === queuedId;

      const row = document.createElement('div');
      row.className = [
        'asset-item',
        isSelected ? 'is-selected' : '',
        isLive ? 'is-live' : '',
        isQueued ? 'is-queued' : ''
      ]
        .filter(Boolean)
        .join(' ');
      row.dataset.id = item.id;
      row.draggable = canDrag;

      const kindIcon =
        item.align === 'center' || item.kind === 'titre'
          ? 'fa-closed-captioning'
          : 'fa-id-badge';

      const modeBadge =
        item.mode === 'auto' ? `AUTO ${item.duration}s` : 'MANUEL';

      row.innerHTML = `
        <span class="asset-swatch" style="background:${item.accentColor || '#FAB001'}"></span>
        <div class="asset-info">
          <div class="asset-top-line">
            <i class="fa-solid ${kindIcon} asset-kind-ico"></i>
            <span class="asset-primary">${escapeText(item.primaryText || 'Sans titre')}</span>
          </div>
          <div class="asset-meta-line">
            <span class="asset-secondary">${escapeText(item.secondaryText || (item.kind === 'titre' ? 'Titre centré' : 'Synthé'))}</span>
            <span class="asset-mode-tag">${isQueued ? 'SUIVANT' : modeBadge}</span>
          </div>
        </div>
        <div class="asset-actions">
          <button type="button" class="btn-row-mini" data-act="dup" title="Dupliquer">
            <i class="fa-regular fa-clone"></i>
          </button>
          <button type="button" class="btn-row-mini danger" data-act="del" title="Supprimer">
            <i class="fa-regular fa-trash-can"></i>
          </button>
          <button type="button" class="btn-row-air" data-act="air" title="${isLive ? 'Sortir de l\'antenne' : 'Envoyer en direct'}">
            <i class="fa-solid ${isLive ? 'fa-stop' : 'fa-play'}"></i>
          </button>
        </div>
      `;

      if (canDrag) {
        row.addEventListener('dragstart', (e) => {
          dragSrcId = item.id;
          row.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
        });
        row.addEventListener('dragend', () => {
          dragSrcId = null;
          row.classList.remove('dragging');
        });
        row.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        });
        row.addEventListener('drop', (e) => {
          e.preventDefault();
          if (!dragSrcId || dragSrcId === item.id) return;
          const ids = assets.map((a) => a.id);
          const from = ids.indexOf(dragSrcId);
          const to = ids.indexOf(item.id);
          if (from < 0 || to < 0) return;
          ids.splice(from, 1);
          ids.splice(to, 0, dragSrcId);
          socket.emit('asset:reorder', ids);
        });
      }

      listEl.appendChild(row);
    }
  }

  function escapeText(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // =========================================================
  // Sync Inspector Controls <-> Draft
  // =========================================================
  function syncInspectorFromDraft() {
    if (!draft) return;

    document.querySelectorAll('[data-kind-preset]').forEach((b) => {
      b.classList.toggle('active', b.dataset.kindPreset === draft.kind);
    });

    document.getElementById('inpPrimary').value = draft.primaryText || '';
    document.getElementById('inpSecondary').value = draft.secondaryText || '';
    document.getElementById('inpTag').value = draft.tagText || '';
    document.getElementById('inpIcon').value = draft.icon || '';

    const prevIco = document.getElementById('currentIconPreview');
    prevIco.className = draft.icon && draft.icon.trim() ? draft.icon.trim() : 'fa-solid fa-ban';

    document.querySelectorAll('.ico-choice').forEach((b) => {
      b.classList.toggle('active', b.dataset.ico === (draft.icon || ''));
    });

    document.querySelectorAll('[data-mode]').forEach((b) => {
      b.classList.toggle('active', b.dataset.mode === draft.mode);
    });

    document.getElementById('durationGroup').classList.toggle('hidden', draft.mode !== 'auto');
    setPair('rngDuration', 'numDuration', draft.duration);

    document.querySelectorAll('[data-layout]').forEach((b) => {
      b.classList.toggle('active', b.dataset.layout === draft.layout);
    });

    document.querySelectorAll('[data-align]').forEach((b) => {
      b.classList.toggle('active', b.dataset.align === draft.align);
    });

    document.getElementById('selDecor').value = draft.decor || 'none';
    document.getElementById('selPattern').value = draft.pattern || 'none';
    document.getElementById('patternOpacityRow').classList.toggle('hidden', !draft.pattern || draft.pattern === 'none');
    setPair('rngPatternOp', 'numPatternOp', draft.patternOpacity ?? 0.16);

    document.querySelectorAll('[data-picker-key]').forEach((inp) => {
      const val = draft[inp.dataset.pickerKey] || '#000000';
      if (/^#[0-9a-fA-F]{6}$/.test(val)) {
        inp.value = val;
      }
    });

    setPair('rngPosX', 'numPosX', draft.posX);
    setPair('rngPosY', 'numPosY', draft.posY);
    setPair('rngScale', 'numScale', draft.scale);
    setPair('rngRadius', 'numRadius', draft.borderRadius);
    setPair('rngPadX', 'numPadX', draft.paddingX);
    setPair('rngPadY', 'numPadY', draft.paddingY);
    setPair('rngAccentW', 'numAccentW', draft.accentWidth);
    setPair('rngBorderW', 'numBorderW', draft.borderWidth);
    setPair('rngShadow', 'numShadow', draft.shadowOffset ?? 0);
    setPair('rngSkewX', 'numSkewX', draft.skewX ?? 0);
    setPair('rngGap', 'numGap', draft.gap ?? 6);

    const selP = document.getElementById('selPrimaryFont');
    const selS = document.getElementById('selSecondaryFont');
    selP.value = draft.primaryFont || 'Quicksand';
    selS.value = draft.secondaryFont || 'Quicksand';
    selP.style.fontFamily = `'${selP.value}', 'Quicksand', sans-serif`;
    selS.style.fontFamily = `'${selS.value}', 'Quicksand', sans-serif`;

    document.getElementById('chkPrimaryUpper').checked = Boolean(draft.primaryUppercase);
    document.getElementById('chkSecondaryUpper').checked = Boolean(draft.secondaryUppercase);
    document.getElementById('chkPrimaryItalic').checked = Boolean(draft.primaryItalic);
    document.getElementById('chkSecondaryItalic').checked = Boolean(draft.secondaryItalic);

    setPair('rngPrimarySize', 'numPrimarySize', draft.primarySize);
    setPair('rngSecondarySize', 'numSecondarySize', draft.secondarySize);
    setPair('rngPrimaryLS', 'numPrimaryLS', draft.primaryLetterSpacing ?? -1);
    setPair('rngSecondaryLS', 'numSecondaryLS', draft.secondaryLetterSpacing ?? 1);

    document.querySelectorAll('[data-weight-target="primaryWeight"] button').forEach((b) => {
      b.classList.toggle('active', Number(b.dataset.w) === Number(draft.primaryWeight));
    });
    document.querySelectorAll('[data-weight-target="secondaryWeight"] button').forEach((b) => {
      b.classList.toggle('active', Number(b.dataset.w) === Number(draft.secondaryWeight));
    });

    document.querySelectorAll('[data-anim]').forEach((b) => {
      b.classList.toggle('active', b.dataset.anim === draft.animStyle);
    });

    document.querySelectorAll('[data-dir]').forEach((b) => {
      b.classList.toggle('active', b.dataset.dir === (draft.animDirection || 'bottom'));
    });

    setPair('rngAnimSpeed', 'numAnimSpeed', draft.animSpeed ?? 1);
    setPair('rngAnimBounce', 'numAnimBounce', draft.animBounce ?? 1);
  }

  function updateRangeVisual(r) {
    if (!r) return;
    const min = parseFloat(r.min);
    const max = parseFloat(r.max);
    const val = parseFloat(r.value);
    if (Number.isNaN(min) || Number.isNaN(max) || max <= min || Number.isNaN(val)) return;
    const pct = Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
    r.style.setProperty('--slider-pct', `${pct.toFixed(1)}%`);
  }

  function setPair(rangeId, numId, val) {
    const r = document.getElementById(rangeId);
    const n = document.getElementById(numId);
    if (r) {
      r.value = val;
      updateRangeVisual(r);
    }
    if (n) n.value = val;
  }

  function bindSliderPair(rangeId, numId, key, isFloat) {
    const r = document.getElementById(rangeId);
    const n = document.getElementById(numId);
    if (!r || !n) return;
    updateRangeVisual(r);
    const apply = (raw) => {
      if (!draft) return;
      const v = isFloat ? parseFloat(raw) : parseInt(raw, 10);
      if (Number.isNaN(v)) return;
      draft[key] = v;
      if (document.activeElement !== r) r.value = v;
      if (document.activeElement !== n) n.value = v;
      updateRangeVisual(r);
      renderPreviewStatic();
      updateDirtyUI();
    };
    r.addEventListener('input', () => apply(r.value));
    n.addEventListener('input', () => apply(n.value));
  }

  // =========================================================
  // Bind All UI Events
  // =========================================================
  function bindEvents() {
    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeFilter = btn.dataset.filter;
        document.querySelectorAll('.filter-tab').forEach((b) => b.classList.toggle('active', b === btn));
        renderAssetList();
      });
    });

    // Search
    const searchInput = document.getElementById('searchInput');
    const btnClearSearch = document.getElementById('btnClearSearch');
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value;
      btnClearSearch.classList.toggle('hidden', !searchQuery);
      renderAssetList();
    });
    btnClearSearch.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      btnClearSearch.classList.add('hidden');
      renderAssetList();
    });

    // Create Synthé / Titre
    document.getElementById('btnNewSynthe').addEventListener('click', () => {
      guardUnsavedChanges(() => {
        const fresh = makeNewTemplate('synthe');
        socket.emit('asset:save', fresh, (res) => {
          if (res?.asset) {
            selectAssetByIdImmediate(res.asset.id);
            const inp = document.getElementById('inpPrimary');
            inp.focus();
            inp.select();
          }
        });
      });
    });

    document.getElementById('btnNewTitre').addEventListener('click', () => {
      guardUnsavedChanges(() => {
        const fresh = makeNewTemplate('titre');
        socket.emit('asset:save', fresh, (res) => {
          if (res?.asset) {
            selectAssetByIdImmediate(res.asset.id);
            const inp = document.getElementById('inpPrimary');
            inp.focus();
            inp.select();
          }
        });
      });
    });

    // Gallery Modal Open / Close / Filter
    document.getElementById('btnOpenGalleryTop').addEventListener('click', openGalleryModal);
    document.getElementById('btnOpenGallerySide').addEventListener('click', openGalleryModal);
    document.getElementById('btnCloseGallery').addEventListener('click', closeGalleryModal);
    document.getElementById('galleryBackdrop').addEventListener('click', closeGalleryModal);

    document.querySelectorAll('[data-gcat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeGalleryCat = btn.dataset.gcat;
        document.querySelectorAll('[data-gcat]').forEach((b) => b.classList.toggle('active', b === btn));
        renderGalleryCards();
      });
    });

    document.getElementById('gallerySearchInput').addEventListener('input', (e) => {
      gallerySearchQuery = e.target.value;
      renderGalleryCards();
    });

    // Asset list interactions
    document.getElementById('assetList').addEventListener('click', (e) => {
      const row = e.target.closest('.asset-item');
      if (!row) return;
      const id = row.dataset.id;
      const actBtn = e.target.closest('[data-act]');

      if (actBtn) {
        e.stopPropagation();
        const act = actBtn.dataset.act;
        const item = assets.find((a) => a.id === id);
        if (!item) return;

        if (act === 'air') {
          const isCurrentlyLive =
            airState.phase !== 'IDLE' &&
            airState.phase !== 'EXITING' &&
            airState.currentAsset &&
            airState.currentAsset.id === id;

          if (isCurrentlyLive) {
            socket.emit('air:out');
          } else {
            const payload = id === selectedId && draft ? draft : item;
            socket.emit('air:take', { asset: payload });
          }
        } else if (act === 'dup') {
          socket.emit('asset:duplicate', id, (res) => {
            if (res?.asset) {
              selectAssetById(res.asset.id);
              showToast('Asset dupliqué');
            }
          });
        } else if (act === 'del') {
          openDeleteAssetModal(id);
        }
        return;
      }

      selectAssetById(id);
    });

    // Inspector tabs
    document.querySelectorAll('.insp-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.insp-tab').forEach((t) => t.classList.toggle('active', t === tab));
        document.querySelectorAll('.insp-pane').forEach((p) => {
          p.classList.toggle('active', p.id === `tab-${tab.dataset.tab}`);
        });
      });
    });

    // Kind preset switch (Synthé bottom-left vs Titre bottom-center)
    document.querySelectorAll('[data-kind-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!draft) return;
        const kind = btn.dataset.kindPreset;
        draft.kind = kind;
        if (kind === 'titre') {
          draft.layout = 'minimal';
          draft.align = 'center';
          draft.posX = 0;
          draft.posY = 60;
          draft.primarySize = 27;
          draft.primaryWeight = 600;
          draft.secondarySize = 15;
          draft.accentWidth = 5;
          draft.paddingX = 26;
          draft.paddingY = 12;
        } else {
          draft.layout = 'layered';
          draft.align = 'left';
          draft.posX = 96;
          draft.posY = 84;
          draft.primarySize = 42;
          draft.primaryWeight = 700;
          draft.secondarySize = 22;
          draft.accentWidth = 8;
          draft.paddingX = 28;
          draft.paddingY = 15;
        }
        syncInspectorFromDraft();
        renderPreviewStatic();
        updateDirtyUI();
      });
    });

    // Text inputs
    ['inpPrimary', 'inpSecondary', 'inpTag', 'inpIcon'].forEach((id) => {
      const mapKey = {
        inpPrimary: 'primaryText',
        inpSecondary: 'secondaryText',
        inpTag: 'tagText',
        inpIcon: 'icon'
      }[id];

      document.getElementById(id).addEventListener('input', (e) => {
        if (!draft) return;
        draft[mapKey] = e.target.value;
        if (id === 'inpIcon') {
          const prevIco = document.getElementById('currentIconPreview');
          prevIco.className = draft.icon && draft.icon.trim() ? draft.icon.trim() : 'fa-solid fa-ban';
        }
        renderPreviewStatic();
        updateDirtyUI();
      });
    });

    // Icon picker toggle & clear
    document.getElementById('btnIconPicker').addEventListener('click', () => {
      document.getElementById('iconPickerDrawer').classList.toggle('hidden');
    });
    document.getElementById('btnClearIcon').addEventListener('click', () => {
      if (!draft) return;
      draft.icon = '';
      syncInspectorFromDraft();
      renderPreviewStatic();
      updateDirtyUI();
    });

    // Mode Auto / Manual
    document.querySelectorAll('[data-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!draft) return;
        draft.mode = btn.dataset.mode;
        syncInspectorFromDraft();
        updateDirtyUI();
      });
    });

    // Layout (12 choices)
    document.querySelectorAll('[data-layout]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!draft) return;
        draft.layout = btn.dataset.layout;
        syncInspectorFromDraft();
        renderPreviewStatic();
        updateDirtyUI();
      });
    });

    // Align
    document.querySelectorAll('[data-align]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!draft) return;
        const nextAlign = btn.dataset.align;
        if (nextAlign === 'center' && draft.align !== 'center') {
          draft.posX = 0;
        } else if (nextAlign !== 'center' && draft.align === 'center') {
          draft.posX = 96;
        }
        draft.align = nextAlign;
        syncInspectorFromDraft();
        renderPreviewStatic();
        updateDirtyUI();
      });
    });

    // Theme category tabs & presets
    document.querySelectorAll('[data-tcat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeThemeCat = btn.dataset.tcat;
        document.querySelectorAll('[data-tcat]').forEach((b) => b.classList.toggle('active', b === btn));
        renderThemePresets();
      });
    });

    document.getElementById('themePresets').addEventListener('click', (e) => {
      const chip = e.target.closest('[data-theme]');
      if (!chip || !draft) return;
      const theme = THEME_PRESETS[chip.dataset.theme];
      if (!theme) return;
      Object.assign(draft, clone(theme.props));
      syncInspectorFromDraft();
      renderPreviewStatic();
      updateDirtyUI();
    });

    // Decor & Pattern selects
    document.getElementById('selDecor').addEventListener('change', (e) => {
      if (!draft) return;
      draft.decor = e.target.value;
      renderPreviewStatic();
      updateDirtyUI();
    });

    document.getElementById('selPattern').addEventListener('change', (e) => {
      if (!draft) return;
      draft.pattern = e.target.value;
      document.getElementById('patternOpacityRow').classList.toggle('hidden', !draft.pattern || draft.pattern === 'none');
      renderPreviewStatic();
      updateDirtyUI();
    });

    // Sliders
    bindSliderPair('rngDuration', 'numDuration', 'duration', true);
    bindSliderPair('rngPatternOp', 'numPatternOp', 'patternOpacity', true);
    bindSliderPair('rngPosX', 'numPosX', 'posX', false);
    bindSliderPair('rngPosY', 'numPosY', 'posY', false);
    bindSliderPair('rngScale', 'numScale', 'scale', true);
    bindSliderPair('rngRadius', 'numRadius', 'borderRadius', false);
    bindSliderPair('rngPadX', 'numPadX', 'paddingX', false);
    bindSliderPair('rngPadY', 'numPadY', 'paddingY', false);
    bindSliderPair('rngAccentW', 'numAccentW', 'accentWidth', false);
    bindSliderPair('rngBorderW', 'numBorderW', 'borderWidth', false);
    bindSliderPair('rngShadow', 'numShadow', 'shadowOffset', false);
    bindSliderPair('rngSkewX', 'numSkewX', 'skewX', false);
    bindSliderPair('rngGap', 'numGap', 'gap', false);
    bindSliderPair('rngPrimarySize', 'numPrimarySize', 'primarySize', false);
    bindSliderPair('rngSecondarySize', 'numSecondarySize', 'secondarySize', false);
    bindSliderPair('rngPrimaryLS', 'numPrimaryLS', 'primaryLetterSpacing', false);
    bindSliderPair('rngSecondaryLS', 'numSecondaryLS', 'secondaryLetterSpacing', false);
    bindSliderPair('rngAnimSpeed', 'numAnimSpeed', 'animSpeed', true);
    bindSliderPair('rngAnimBounce', 'numAnimBounce', 'animBounce', true);

    // Uppercase & Italic toggles
    document.getElementById('chkPrimaryUpper').addEventListener('change', (e) => {
      if (!draft) return;
      draft.primaryUppercase = e.target.checked;
      renderPreviewStatic();
      updateDirtyUI();
    });
    document.getElementById('chkSecondaryUpper').addEventListener('change', (e) => {
      if (!draft) return;
      draft.secondaryUppercase = e.target.checked;
      renderPreviewStatic();
      updateDirtyUI();
    });
    document.getElementById('chkPrimaryItalic').addEventListener('change', (e) => {
      if (!draft) return;
      draft.primaryItalic = e.target.checked;
      renderPreviewStatic();
      updateDirtyUI();
    });
    document.getElementById('chkSecondaryItalic').addEventListener('change', (e) => {
      if (!draft) return;
      draft.secondaryItalic = e.target.checked;
      renderPreviewStatic();
      updateDirtyUI();
    });

    // Font weights
    document.querySelectorAll('[data-weight-target]').forEach((group) => {
      const key = group.dataset.weightTarget;
      group.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-w]');
        if (!b || !draft) return;
        draft[key] = Number(b.dataset.w);
        syncInspectorFromDraft();
        renderPreviewStatic();
        updateDirtyUI();
      });
    });

    // Animation style & direction
    document.querySelectorAll('[data-anim]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!draft) return;
        draft.animStyle = btn.dataset.anim;
        syncInspectorFromDraft();
        pvwRenderer.playIn(draft);
        updateDirtyUI();
      });
    });

    document.querySelectorAll('[data-dir]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!draft) return;
        draft.animDirection = btn.dataset.dir;
        syncInspectorFromDraft();
        pvwRenderer.playIn(draft);
        updateDirtyUI();
      });
    });

    // Style propagation
    document.getElementById('btnApplySameKind').addEventListener('click', () => {
      if (!draft) return;
      socket.emit('asset:applyStyle', { styleAsset: draft, scope: 'kind' }, () => {
        showToast('Style appliqué à la catégorie');
      });
    });
    document.getElementById('btnApplyAll').addEventListener('click', () => {
      if (!draft) return;
      socket.emit('asset:applyStyle', { styleAsset: draft, scope: 'all' }, () => {
        showToast('Style appliqué à tous les assets');
      });
    });

    // Preview tools
    document.getElementById('btnTestAnimIn').addEventListener('click', () => {
      if (draft) pvwRenderer.playIn(draft);
    });
    document.getElementById('btnTestAnimOut').addEventListener('click', () => {
      if (!draft) return;
      pvwRenderer.playOut(() => {
        setTimeout(() => {
          if (draft) pvwRenderer.renderStatic(draft);
        }, 280);
      });
    });

    const safeGuides = document.getElementById('safeGuides');
    const btnToggleSafe = document.getElementById('btnToggleSafe');
    btnToggleSafe.addEventListener('click', () => {
      const hidden = safeGuides.classList.toggle('hidden');
      btnToggleSafe.classList.toggle('active', !hidden);
    });

    const pvwScaler = document.getElementById('pvwScaler');
    const bgModes = ['bg-checker', 'bg-dark-studio', 'bg-light-studio'];
    let bgIdx = 0;
    document.getElementById('btnCycleBg').addEventListener('click', () => {
      pvwScaler.classList.remove(...bgModes);
      bgIdx = (bgIdx + 1) % bgModes.length;
      pvwScaler.classList.add(bgModes[bgIdx]);
    });

    // Broadcast transport buttons
    document.getElementById('btnTake').addEventListener('click', () => {
      if (!draft) return;
      socket.emit('air:take', { asset: draft });
    });
    document.getElementById('btnTakeAuto').addEventListener('click', () => {
      if (!draft) return;
      socket.emit('air:take', { asset: draft, overrideMode: 'auto' });
    });
    document.getElementById('btnTakeManual').addEventListener('click', () => {
      if (!draft) return;
      socket.emit('air:take', { asset: draft, overrideMode: 'manual' });
    });
    document.getElementById('btnOut').addEventListener('click', () => {
      socket.emit('air:out');
    });
    document.getElementById('btnCut').addEventListener('click', () => {
      socket.emit('air:cut');
    });
    document.getElementById('btnHoldAir').addEventListener('click', () => {
      socket.emit('air:hold');
    });

    // Auto-Save toggle
    const chkAutoSave = document.getElementById('chkAutoSave');
    if (chkAutoSave) {
      chkAutoSave.checked = autoSaveEnabled;
      chkAutoSave.addEventListener('change', () => {
        autoSaveEnabled = chkAutoSave.checked;
        localStorage.setItem('mmitv_autosave', autoSaveEnabled ? '1' : '0');
        if (autoSaveEnabled && checkDirty() && getSavedSelected()) {
          saveCurrentDraft();
        }
        showToast(autoSaveEnabled ? 'Sauvegarde automatique activée' : 'Confirmation manuelle activée');
      });
    }

    // Unsaved Changes Modal Buttons
    document.getElementById('btnUnsavedSave').addEventListener('click', () => {
      const act = pendingUnsavedAction;
      closeUnsavedModal();
      saveCurrentDraft(() => {
        if (typeof act === 'function') act();
      });
    });

    document.getElementById('btnUnsavedDiscard').addEventListener('click', () => {
      const act = pendingUnsavedAction;
      closeUnsavedModal();
      const saved = getSavedSelected();
      if (saved) {
        draft = clone(saved);
      }
      updateDirtyUI(true);
      if (typeof act === 'function') act();
    });

    document.getElementById('btnUnsavedCancel').addEventListener('click', closeUnsavedModal);
    document.getElementById('unsavedBackdrop').addEventListener('click', closeUnsavedModal);

    // Delete Asset Confirmation Modal Buttons
    document.getElementById('btnConfirmDeleteAsset')?.addEventListener('click', confirmDeleteAsset);
    document.getElementById('btnCancelDeleteAsset')?.addEventListener('click', closeDeleteAssetModal);
    document.getElementById('deleteAssetBackdrop')?.addEventListener('click', closeDeleteAssetModal);

    // Undo / Redo Buttons
    document.getElementById('btnUndo')?.addEventListener('click', performUndo);
    document.getElementById('btnRedo')?.addEventListener('click', performRedo);

    // Profile Selector & Profile Manager Modal
    const profileSelect = document.getElementById('profileSelect');
    profileSelect.addEventListener('change', () => {
      const targetId = profileSelect.value;
      if (!targetId || targetId === activeProfileId) return;
      // Restore visual selection until guard passes
      profileSelect.value = activeProfileId;
      guardUnsavedChanges(() => {
        selectedId = null;
        draft = null;
        socket.emit('profile:switch', targetId, (res) => {
          if (res?.ok && res.profile) {
            showToast(`Profil actif : ${res.profile.name}`);
          }
        });
      });
    });

    document.getElementById('btnOpenProfiles').addEventListener('click', openProfilesModal);
    document.getElementById('btnCloseProfiles').addEventListener('click', closeProfilesModal);
    document.getElementById('profilesBackdrop').addEventListener('click', closeProfilesModal);

    document.getElementById('btnCreateProfile').addEventListener('click', () => {
      const nameInp = document.getElementById('inpNewProfileName');
      const modeSel = document.getElementById('selNewProfileMode');
      const name = (nameInp.value || '').trim() || `Profil ${profiles.length + 1}`;
      const mode = modeSel.value;

      guardUnsavedChanges(() => {
        selectedId = null;
        draft = null;
        socket.emit(
          'profile:create',
          {
            name,
            copyCurrent: mode === 'copy',
            empty: mode === 'empty'
          },
          (res) => {
            if (res?.ok && res.profile) {
              nameInp.value = '';
              showToast(`Profil « ${res.profile.name} » créé`);
              renderProfilesUI();
            }
          }
        );
      });
    });

    document.getElementById('btnExportAllProfiles').addEventListener('click', () => {
      window.location.href = '/api/export?all=1';
    });

    document.getElementById('profilesListContainer').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-prof-act]');
      if (!btn) return;
      const act = btn.dataset.profAct;
      const profId = btn.dataset.profId;
      const prof = profiles.find((p) => p.id === profId);
      if (!prof) return;

      if (act === 'switch') {
        guardUnsavedChanges(() => {
          selectedId = null;
          draft = null;
          socket.emit('profile:switch', profId, (res) => {
            if (res?.ok && res.profile) {
              showToast(`Profil actif : ${res.profile.name}`);
            }
          });
        });
      } else if (act === 'rename') {
        const nextName = window.prompt('Nouveau nom du profil :', prof.name);
        if (nextName && nextName.trim()) {
          socket.emit('profile:rename', { id: profId, name: nextName.trim() }, (res) => {
            if (res?.ok) showToast('Profil renommé');
          });
        }
      } else if (act === 'dup') {
        guardUnsavedChanges(() => {
          selectedId = null;
          draft = null;
          socket.emit(
            'profile:create',
            {
              name: `${prof.name} (Copie)`,
              sourceProfileId: profId
            },
            (res) => {
              if (res?.ok && res.profile) {
                showToast(`Profil « ${res.profile.name} » dupliqué`);
              }
            }
          );
        });
      } else if (act === 'export') {
        window.location.href = `/api/export?profileId=${encodeURIComponent(profId)}`;
      } else if (act === 'delete') {
        if (profiles.length <= 1) return;
        if (!window.confirm(`Supprimer définitivement le profil « ${prof.name} » ?`)) return;
        socket.emit('profile:delete', profId, (res) => {
          if (res?.ok) {
            showToast('Profil supprimé');
          }
        });
      }
    });

    // Save / Revert / Duplicate / Scratch
    document.getElementById('btnSave').addEventListener('click', () => saveCurrentDraft());
    document.getElementById('btnRevert').addEventListener('click', () => {
      const saved = getSavedSelected();
      if (!saved) return;
      draft = clone(saved);
      syncInspectorFromDraft();
      renderPreviewStatic();
      updateDirtyUI(true);
      showToast('Modifications annulées');
    });
    document.getElementById('btnDuplicate').addEventListener('click', duplicateCurrentDraft);
    document.getElementById('btnScratch').addEventListener('click', () => {
      guardUnsavedChanges(() => {
        const base = draft ? clone(draft) : makeNewTemplate('synthe');
        selectedId = null;
        draft = {
          ...base,
          id: 'live_' + Math.random().toString(36).slice(2, 9),
          primaryText: '',
          secondaryText: ''
        };
        syncInspectorFromDraft();
        renderPreviewStatic();
        updateDirtyUI(true);
        renderAssetList();
        document.getElementById('inpPrimary').focus();
      });
    });

    // Copy LAN URL
    document.getElementById('btnCopyOverlayUrl').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(lanOverlayUrl);
        showToast(`Copié : ${lanOverlayUrl}`);
      } catch (_e) {
        window.prompt('URL Overlay vMix :', lanOverlayUrl);
      }
    });

    // Export / Multi-File Import JSON
    document.getElementById('btnExport').addEventListener('click', () => {
      window.location.href = `/api/export?profileId=${encodeURIComponent(activeProfileId || '')}`;
    });
    const fileImport = document.getElementById('fileImport');
    document.getElementById('btnImport').addEventListener('click', () => {
      fileImport.dataset.importSource = 'topbar';
      fileImport.click();
    });
    document.getElementById('btnTriggerMultiImport').addEventListener('click', () => {
      fileImport.dataset.importSource = 'modal';
      fileImport.click();
    });
    fileImport.addEventListener('change', async () => {
      const files = fileImport.files;
      if (!files || files.length === 0) return;
      const mode =
        fileImport.dataset.importSource === 'modal'
          ? document.getElementById('selImportMode').value
          : 'new-profiles';
      await handleFilesImport(files, mode);
      fileImport.value = '';
    });

    // Collapsible Left / Right Workspace Panels
    document.getElementById('btnCollapseLeft')?.addEventListener('click', toggleLeftPanel);
    document.getElementById('railLeft')?.addEventListener('click', toggleLeftPanel);
    document.getElementById('btnCollapseRight')?.addEventListener('click', toggleRightPanel);
    document.getElementById('railRight')?.addEventListener('click', toggleRightPanel);
    document.getElementById('btnToggleLeftPanelSet')?.addEventListener('click', toggleLeftPanel);
    document.getElementById('btnToggleRightPanelSet')?.addEventListener('click', toggleRightPanel);

    // Settings Modal
    document.getElementById('btnOpenSettings')?.addEventListener('click', openSettingsModal);
    document.getElementById('btnCloseSettings')?.addEventListener('click', closeSettingsModal);
    document.getElementById('settingsBackdrop')?.addEventListener('click', closeSettingsModal);

    // Check GitHub Releases & Open GitHub
    document.getElementById('btnCheckUpdatesNow')?.addEventListener('click', () => {
      checkUpdatesFromGitHub(false);
    });
    document.getElementById('btnOpenGithubReleases')?.addEventListener('click', () => {
      openExternalUrl(`https://github.com/${githubRepo}/releases`);
    });

    const chkUpdateStartup = document.getElementById('chkUpdateOnStartup');
    if (chkUpdateStartup) {
      chkUpdateStartup.checked = updateOnStartup;
      chkUpdateStartup.addEventListener('change', () => {
        updateOnStartup = chkUpdateStartup.checked;
        localStorage.setItem('mmitv_update_startup', updateOnStartup ? '1' : '0');
        showToast(
          updateOnStartup
            ? 'Vérification des mises à jour au démarrage activée'
            : 'Vérification au démarrage désactivée'
        );
      });
    }

    // Startup Update Prompt Modal
    document.getElementById('btnUpdPromptAutoInstall')?.addEventListener('click', (e) => {
      triggerAutoInstallUpdate(e.currentTarget);
    });
    document.getElementById('btnUpdPromptLater')?.addEventListener('click', closeUpdatePromptModal);
    document.getElementById('updatePromptBackdrop')?.addEventListener('click', closeUpdatePromptModal);

    // Electron Desktop Integration (Tray, Direct Stream Deck Install, Native Menu Bar)
    if (window.electronAPI && window.electronAPI.isElectron) {
      document.getElementById('electronSettingsGroup')?.classList.remove('hidden');
      const btnInstallSdElectron = document.getElementById('btnInstallSdPluginElectron');
      if (btnInstallSdElectron) {
        btnInstallSdElectron.classList.remove('hidden');
        btnInstallSdElectron.addEventListener('click', async () => {
          const res = await window.electronAPI.installStreamDeckPlugin();
          if (res?.ok) {
            showToast('Ouverture de l\'installeur Elgato Stream Deck...');
          } else {
            showToast(res?.error || 'Téléchargement du plugin lancé');
          }
        });
      }

      const chkCloseToTray = document.getElementById('chkCloseToTray');
      if (chkCloseToTray && typeof window.electronAPI.getAppSettings === 'function') {
        window.electronAPI.getAppSettings().then((s) => {
          if (s && typeof s.closeToTray === 'boolean') {
            chkCloseToTray.checked = s.closeToTray;
          }
        });
        chkCloseToTray.addEventListener('change', () => {
          window.electronAPI.setCloseToTray(chkCloseToTray.checked);
          showToast(
            chkCloseToTray.checked
              ? 'Maintien en arrière-plan (Tray / Barre des menus) activé'
              : 'Fermeture complète à la fermeture de la fenêtre'
          );
        });
      }

      document.getElementById('btnOpenDataFolder')?.addEventListener('click', () => {
        window.electronAPI.openDataFolder();
      });

      document.getElementById('btnQuitAppCompletely')?.addEventListener('click', () => {
        window.electronAPI.quitApp();
      });

      if (typeof window.electronAPI.onMenuAction === 'function') {
        window.electronAPI.onMenuAction((action) => {
          switch (action) {
            case 'new-synthe':
              document.getElementById('btnNewSynthe')?.click();
              break;
            case 'new-titre':
              document.getElementById('btnNewTitre')?.click();
              break;
            case 'open-gallery':
              openGalleryModal();
              break;
            case 'open-profiles':
              openProfilesModal();
              break;
            case 'open-settings':
              openSettingsModal();
              break;
            case 'save-asset':
              saveCurrentDraft();
              break;
            case 'duplicate-asset':
              duplicateCurrentDraft();
              break;
            case 'undo':
              performUndo();
              break;
            case 'redo':
              performRedo();
              break;
            case 'export-profile':
              document.getElementById('btnExport')?.click();
              break;
            case 'import-profile':
              document.getElementById('btnImport')?.click();
              break;
            case 'take-air':
              if (draft) socket.emit('air:take', { asset: draft });
              break;
            case 'out-air':
              socket.emit('air:out');
              break;
            case 'cut-air':
              socket.emit('air:cut');
              break;
            case 'hold-air':
              socket.emit('air:hold');
              break;
            case 'toggle-left-panel':
              toggleLeftPanel();
              break;
            case 'toggle-right-panel':
              toggleRightPanel();
              break;
            case 'toggle-safe-guides':
              document.getElementById('btnToggleSafe')?.click();
              break;
            case 'check-updates':
              openSettingsModal();
              checkUpdatesFromGitHub(false);
              break;
            case 'install-streamdeck':
              window.electronAPI.installStreamDeckPlugin();
              break;
          }
        });
      }
    }

    // Warn before closing browser tab if unsaved changes exist
    window.addEventListener('beforeunload', (e) => {
      if (checkDirty() && !autoSaveEnabled) {
        e.preventDefault();
        e.returnValue = '';
      }
    });

    // Global Keyboard Shortcuts (Broadcast Régie)
    window.addEventListener('keydown', (e) => {
      const delModalOpen = !document.getElementById('deleteAssetModal').classList.contains('hidden');
      if (delModalOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeDeleteAssetModal();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          confirmDeleteAsset();
        }
        return;
      }

      const updPromptOpen = !document.getElementById('updatePromptModal').classList.contains('hidden');
      if (updPromptOpen && e.key === 'Escape') {
        e.preventDefault();
        closeUpdatePromptModal();
        return;
      }

      const settingsOpen = !document.getElementById('settingsModal').classList.contains('hidden');
      if (settingsOpen && e.key === 'Escape') {
        e.preventDefault();
        closeSettingsModal();
        return;
      }

      const unsavedOpen = !document.getElementById('unsavedModal').classList.contains('hidden');
      if (unsavedOpen && e.key === 'Escape') {
        e.preventDefault();
        closeUnsavedModal();
        return;
      }

      const profilesOpen = !document.getElementById('profilesModal').classList.contains('hidden');
      if (profilesOpen && e.key === 'Escape') {
        e.preventDefault();
        closeProfilesModal();
        return;
      }

      const modalOpen = !document.getElementById('galleryModal').classList.contains('hidden');
      if (modalOpen && e.key === 'Escape') {
        e.preventDefault();
        closeGalleryModal();
        return;
      }

      // Undo (Cmd/Ctrl+Z) & Redo (Cmd+Shift+Z or Ctrl+Y)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          performRedo();
        } else {
          performUndo();
        }
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        performRedo();
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        openSettingsModal();
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === '1') {
        e.preventDefault();
        toggleLeftPanel();
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === '2') {
        e.preventDefault();
        toggleRightPanel();
        return;
      }

      const tag = document.activeElement?.tagName;
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveCurrentDraft();
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateCurrentDraft();
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        if (e.shiftKey) {
          socket.emit('air:cut');
        } else {
          socket.emit('air:out');
        }
        return;
      }

      if (inInput || modalOpen || profilesOpen || unsavedOpen || settingsOpen || updPromptOpen) return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (draft) socket.emit('air:take', { asset: draft });
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (assets.length === 0) return;
        const idx = assets.findIndex((a) => a.id === selectedId);
        const delta = e.key === 'ArrowDown' ? 1 : -1;
        const nextIdx = idx < 0 ? 0 : (idx + delta + assets.length) % assets.length;
        selectAssetById(assets[nextIdx].id);
      }
    });
  }

  function saveCurrentDraft(cb, silentToast) {
    if (!draft) {
      if (typeof cb === 'function') cb();
      return;
    }
    if (String(draft.id).startsWith('live_')) {
      draft.id = 'ast_' + Math.random().toString(36).slice(2, 10);
    }
    socket.emit('asset:save', draft, (res) => {
      if (res?.asset) {
        selectedId = res.asset.id;
        draft = clone(res.asset);
        updateDirtyUI(true);
        renderAssetList();
        if (!silentToast) showToast('Enregistré');
      }
      if (typeof cb === 'function') cb(res);
    });
  }

  function duplicateCurrentDraft() {
    if (!draft) return;
    socket.emit('asset:duplicate', draft, (res) => {
      if (res?.asset) {
        selectAssetByIdImmediate(res.asset.id);
        showToast('Dupliqué');
      }
    });
  }

  // =========================================================
  // Socket.IO Synchronization & Live Air Countdown Loop
  // =========================================================
  socket.on('profiles:state', (state) => {
    if (!state) return;
    profiles = Array.isArray(state.profiles) ? state.profiles : [];
    activeProfileId = state.activeProfileId || (profiles[0] && profiles[0].id) || null;
    renderProfilesUI();
  });

  socket.on('assets:list', (serverAssets) => {
    const wasDirty = checkDirty();
    assets = Array.isArray(serverAssets) ? serverAssets : [];

    if ((!draft || !assets.some((a) => a.id === selectedId)) && assets.length > 0 && !wasDirty) {
      selectAssetByIdImmediate(assets[0].id);
      return;
    }

    if (!wasDirty && selectedId) {
      const updated = assets.find((a) => a.id === selectedId);
      if (updated) {
        draft = clone(updated);
        syncInspectorFromDraft();
        renderPreviewStatic();
      }
    }

    updateDirtyUI(true);
    renderAssetList();
  });

  socket.on('air:state', (state) => {
    if (!state) return;
    if (state.serverNow) {
      clockOffsetMs = state.serverNow - Date.now();
    }
    airState = state;
    updateOverlayCount(state.overlayClients || 0);
    updateVersionAndStreamDeckUI(state);
    updateAirStatusUI();
    renderAssetList();

    if (!pgmInitialized) {
      pgmInitialized = true;
      if (state.phase === 'ON_AIR' && state.currentAsset) {
        pgmRenderer.renderStatic(state.currentAsset);
      } else if (state.phase === 'ENTERING' && state.currentAsset) {
        pgmRenderer.playIn(state.currentAsset);
      } else {
        pgmRenderer.cut();
      }
    }
  });

  socket.on('overlay:cmd', (cmd) => {
    if (!cmd) return;
    pgmInitialized = true;
    if (cmd.type === 'ANIMATE_IN') {
      pgmRenderer.playIn(cmd.asset);
    } else if (cmd.type === 'ANIMATE_OUT') {
      pgmRenderer.playOut();
    } else if (cmd.type === 'CUT') {
      pgmRenderer.cut();
    }
  });

  function updateAirStatusUI() {
    const badge = document.getElementById('airBadge');
    const txt = document.getElementById('airStatusText');
    const pgmTag = document.getElementById('pgmTag');
    const pgmLabel = document.getElementById('pgmAssetLabel');
    const queuedBadge = document.getElementById('queuedBadge');
    const queuedLabel = document.getElementById('queuedLabel');
    const timerWrap = document.getElementById('airTimerWrap');

    badge.classList.remove('is-idle', 'is-live', 'is-transition');

    if (airState.phase === 'ON_AIR' && airState.currentAsset) {
      badge.classList.add('is-live');
      txt.textContent = "À L'ANTENNE";
      pgmTag.classList.add('live');
      pgmLabel.textContent = airState.currentAsset.primaryText || 'Asset actif';
    } else if (airState.phase === 'ENTERING' || airState.phase === 'EXITING') {
      badge.classList.add('is-transition');
      txt.textContent = airState.queuedAsset ? 'TRANSITION...' : (airState.phase === 'ENTERING' ? 'ENTRÉE...' : 'SORTIE...');
      pgmTag.classList.toggle('live', airState.phase === 'ENTERING');
      pgmLabel.textContent = airState.currentAsset?.primaryText || '—';
    } else {
      badge.classList.add('is-idle');
      txt.textContent = 'HORS ANTENNE';
      pgmTag.classList.remove('live');
      pgmLabel.textContent = '—';
    }

    if (airState.queuedAsset) {
      queuedBadge.classList.remove('hidden');
      queuedLabel.textContent = airState.queuedAsset.primaryText || 'Suivant';
    } else {
      queuedBadge.classList.add('hidden');
    }

    const showAutoTimer =
      airState.phase === 'ON_AIR' &&
      airState.autoHideAt &&
      airState.autoDurationMs > 0;
    timerWrap.classList.toggle('hidden', !showAutoTimer);
  }

  function tickCountdown() {
    if (
      airState.phase === 'ON_AIR' &&
      airState.autoHideAt &&
      airState.autoDurationMs > 0
    ) {
      const nowServer = Date.now() + clockOffsetMs;
      const remMs = Math.max(0, airState.autoHideAt - nowServer);
      const ratio = Math.min(1, Math.max(0, remMs / airState.autoDurationMs));
      document.getElementById('airTimerFill').style.transform = `scaleX(${ratio.toFixed(4)})`;
      document.getElementById('airTimerValue').textContent = `${(remMs / 1000).toFixed(1)}s`;
    }
    requestAnimationFrame(tickCountdown);
  }

  // =========================================================
  // Boot
  // =========================================================
  buildFontSelectors();
  renderThemePresets();
  buildColorsMatrix();
  buildIconGrid();
  setupViewportObservers();
  applyPanelsCollapseState();
  bindEvents();
  loadNetworkInfo();
  requestAnimationFrame(tickCountdown);
})();
