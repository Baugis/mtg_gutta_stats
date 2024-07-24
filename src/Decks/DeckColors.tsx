import { Key } from 'react';
import { useRecordContext, TextField } from 'react-admin';
import { colorCombinations } from '../Helpers/utils';

const colorMap = colorCombinations.reduce((acc, combo) => {
    const [key, value] = Object.entries(combo)[0];
    acc[key] = value;
    return acc;
}, {});

const DeckColors = ({ label, name }: { label: string, name: Boolean }) => {
    const record = useRecordContext();
    if (!record) return null;

    const colors = record.card_data.color_identity;
    const colorName = colorMap[colors] || 'Unknown Combination';

    return (
        <div style={{ textWrap: 'nowrap' }}>
            {name ? (
                <span>{colorName} </span>
            ) : null}
            {colors.map((color: string, index: React.Key) => (
                <span key={index} className={`mana-${color.toLowerCase()}`}></span>
            ))}
        </div>
    );
};

export default DeckColors;