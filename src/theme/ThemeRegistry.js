// ThemeRegistry.js — Central Studio Asset Dictionary
export const THEMES = {
  candy: {
    id: 'candy',
    name: 'Magic Candies',
    colors: {
      primary: '#f472b6', // Pink
      secondary: '#db2777',
      background: 'transparent'
    },
    assets: { item: '/assets/themes/candy/lollipop.svg', background: '/assets/themes/candy/bg.svg' },
    fallback: { itemColor: '#f472b6', itemLabel: '🍭' }
  },
  classroom: {
    id: 'classroom',
    name: 'School Quest',
    colors: {
      primary: '#60a5fa', // Blue
      secondary: '#2563eb',
      background: 'transparent'
    },
    assets: { item: '/assets/themes/school/pencil.svg', background: '/assets/themes/school/bg.svg' },
    fallback: { itemColor: '#3b82f6', itemLabel: '✏️' }
  },
  bakery: {
    id: 'bakery',
    name: 'Bakery Party',
    colors: {
      primary: '#fbbf24', // Yellow/Orange
      secondary: '#d97706',
      background: 'transparent'
    },
    assets: { item: '/assets/themes/bakery/cupcake.svg', background: '/assets/themes/bakery/bg.svg' },
    fallback: { itemColor: '#f59e0b', itemLabel: '🧁' }
  },
  beach: {
    id: 'beach',
    name: 'Sea Search',
    colors: {
      primary: '#34d399', // Teal
      secondary: '#059669',
      background: 'transparent'
    },
    assets: { item: '/assets/themes/beach/shell.svg', background: '/assets/themes/beach/bg.svg' },
    fallback: { itemColor: '#10b981', itemLabel: '🐚' }
  },
  garden: {
    id: 'garden',
    name: 'Fruit Garden',
    colors: {
      primary: '#a78bfa', // Purple
      secondary: '#7c3aed',
      background: 'transparent'
    },
    assets: { item: '/assets/themes/garden/mango.svg', background: '/assets/themes/garden/bg.svg' },
    fallback: { itemColor: '#8b5cf6', itemLabel: '🥭' }
  }
}

export const getTheme = (id) => THEMES[id] || THEMES.candy
