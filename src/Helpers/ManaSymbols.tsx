

const ManaSymbols = ({ colorIdentity }: { colorIdentity: any }) => {
    let colors = [];

    // Convert colorIdentity to array if it's a JSON string
    if (typeof colorIdentity === 'string') {
        try {
            colors = JSON.parse(colorIdentity);
        } catch (e) {
            console.error('Failed to parse colorIdentity JSON:', e);
        }
    } else if (Array.isArray(colorIdentity)) {
        colors = colorIdentity;
    }

    // Map of colors to their respective class names
    const colorClassMap = {
        W: 'mana-w',
        U: 'mana-u',
        B: 'mana-b',
        R: 'mana-r',
        G: 'mana-g'
    };

    return (
        colors.map((color: any, index: any) => (
            <div key={index} className={colorClassMap[color]}></div>
        ))
    );
};


export default ManaSymbols;