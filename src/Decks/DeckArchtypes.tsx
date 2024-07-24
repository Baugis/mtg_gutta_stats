import { Key } from 'react';
import { useRecordContext, TextField } from 'react-admin';
import { colorCombinations } from '../Helpers/utils';
import { Box, Typography } from '@mui/material';

function splitString(inputString: string) {
    if (typeof inputString !== 'string') {
        return [];
    }

    return inputString.split(',');
}

const DeckArchtypes = () => {
    const record = useRecordContext();
    if (!record) return null;

    const types = splitString(record.arctype);

    return (
        types.map((type, index) => (
            <Box bgcolor={'rgba(68, 169, 244, 0.24)'} borderRadius={'100px'} sx={{ padding: '5px 10px 2px' }} key={index}>
                <Typography fontSize={'11px'} color={'#44A9F4'} textTransform={'uppercase'} fontWeight={500}>
                    {type}
                </Typography>
            </Box>
        ))
    );
};

export default DeckArchtypes;