export type Color = { red: number; green: number; blue: number };

export const rgbToHex = (color: Color) =>
    `#${[color.red, color.green, color.blue].map((color) => color.toString(16).padStart(2, '0')).join('')}`;
export const hexToRgb = (color: string): Color => {
    const parts = color.replace('#', '').split('');

    if (parts.length !== 3 && parts.length !== 6) {
        return { red: 0, green: 0, blue: 0 };
    }
    const unparsed =
        parts.length === 3 ? parts : [`${parts[0]}${parts[1]}`, `${parts[2]}${parts[3]}`, `${parts[4]}${parts[5]}`];
    const [red, green, blue] = unparsed.map((str) => parseInt(str, 16));

    return { red, green, blue };
};

export const unknownColor: Color = { red: 0, green: 0, blue: 0 };

const presetLabelColors = ['#FF3333', '#0077FF', '#33B27B', '#F858AF', '#FFDB47'].map(hexToRgb);

const primitiveSeededRandom = (seed: number) =>
    Math.abs(Math.cos(Math.PI * Math.sqrt(Math.sqrt(seed + Math.PI) * Math.E)));

const getRandomColor = (seed: number) => ({
    red: Math.floor(primitiveSeededRandom(seed ** 2) * 256),
    blue: Math.floor(primitiveSeededRandom(seed ** 3) * 256),
    green: Math.floor(primitiveSeededRandom(seed ** 4) * 256)
});

export const getTextColorByBackground = (backgroundColor: Color) =>
    0.299 * backgroundColor.red + 0.587 * backgroundColor.green + 0.114 * backgroundColor.blue > 150
        ? 'black'
        : 'white';

export const makeLabelColor = (index: number): Color => presetLabelColors[index] || getRandomColor(index);
