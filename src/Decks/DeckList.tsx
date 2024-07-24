import { Datagrid, List, TextInput, ReferenceField, ReferenceInput, TextField, SelectInput, UrlField, useRecordContext, useGetList, RaRecord, useSortState, RecordContextProvider, ImageField, Link, CreateButton, useGetIdentity } from 'react-admin';
import DeckColors from './DeckColors';
import { FC, useEffect, useMemo, useState } from 'react';
import { calculateTotalGames, calculateTotalLosses, calculateTotalWinPercentage, calculateTotalWins, colorCombinations } from '../Helpers/utils';
import { useMediaQuery, Theme, Card, Typography, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Box } from '@mui/system';
import TextField2 from '@mui/material/TextField';
import useDebounce from '../Helpers/useDebounce';
import { checkRetired } from '../Helpers/checkRetired';

interface DeckStat {
    id: number;
    deck_id: number;
    owner_id: number;
    '1v1_wins': number;
    '1v1_losses': number;
    '3_man_ffa_wins': number;
    '3_man_ffa_losses': number;
    '4_man_ffa_wins': number;
    '4_man_ffa_losses': number;
    'two_head_giant_wins': number;
    'two_head_giant_losses': number;
    'star_wins': number;
    'star_losses': number;
}

interface TotalGamesFieldProps {
    type: 'games' | 'wins' | 'losses' | 'percentage';
    deckId: any;
    label?: string;
    aggregate?: boolean;
    sortField?: string;
    sortOrder?: 'ASC' | 'DESC';
}

const TotalGamesField: FC<TotalGamesFieldProps> = ({ type, deckId, label, aggregate = false, sortField = 'id', sortOrder = 'ASC' }) => {
    const record = useRecordContext<RaRecord>();
    const { sort, setSort } = useSortState();

    const { data, isLoading, error } = useGetList<DeckStat>(
        'deck_stat',
        {
            pagination: { page: 1, perPage: 1000 },
            sort: { field: sortField, order: sortOrder },
            filter: aggregate ? { owner_id: record?.id } : { deck_id: deckId || record?.id },
        },
    );

    if (isLoading) return <span>Loading...</span>;
    if (error) return <span>Error loading deck stats</span>;

    const deckStats = data || [];
    let total = 0;
    if (type === 'games') {
        total = calculateTotalGames(deckStats);
    } else if (type === 'wins') {
        total = calculateTotalWins(deckStats);
    } else if (type === 'losses') {
        total = calculateTotalLosses(deckStats);
    } else if (type === 'percentage') {
        total = calculateTotalWinPercentage(deckStats)
    }

    return <span>{total}{type === 'percentage' ? '%' : null}</span>;
};

const colorChoices = colorCombinations.map(combo => {
    const [key, value] = Object.entries(combo)[0];
    const keyString = `["${key.split(',').join('","')}"]`;
    return { id: keyString, name: value };
}).sort((a, b) => a.name.localeCompare(b.name));

const deckFilters = [
    <TextInput source="q" label="Search" alwaysOn />,
    <ReferenceInput source="owner" label="Player" reference="player" alwaysOn sort={{ field: 'name', order: 'ASC' }} />,
    <SelectInput source="colorIdentity" choices={colorChoices} alwaysOn />,
];

export const DeckList = () => {
    const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));
    const [searchQuery, setSearchQuery] = useState('');
    const [tmpSearchQuery, setTmpSearchQuery] = useState('');
    const [filterColor, setFilterColor] = useState('');
    const [owner, setOwner] = useState('all');
    const { data: identity } = useGetIdentity();

    const debouncedSearchQuery = useDebounce(tmpSearchQuery, 300);

    const { data, isLoading, error } = useGetList(
        'deck',
        {
            pagination: { page: 1, perPage: 100 },
            sort: { field: 'name', order: 'ASC' },
            filter: { q: searchQuery ? searchQuery : null, colors: filterColor ? filterColor : null, owner: owner == 'player' ? identity?.id : null }
        }
    );

    const sortedDecks = data?.sort((a, b) => {
        const aRetired = checkRetired(a) ? 1 : 0;
        const bRetired = checkRetired(b) ? 1 : 0;
        if (aRetired !== bRetired) {
            return aRetired - bRetired;
        } else {
            return a.name.localeCompare(b.name);
        }
    });

    const handleSearchChange = (event: any) => {
        setTmpSearchQuery(event.target.value);
    };

    const handleFilterColorChange = (event: any) => {
        setFilterColor(event.target.value);
    };

    useEffect(() => {
        setSearchQuery(debouncedSearchQuery);
    }, [debouncedSearchQuery]);

    return (
        isSmall ? (
            <>
                <Grid container mt={4} px={1.5}>
                    <Grid item xs={12} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                        <Box sx={{ backgroundColor: '#1F2430', width: 'auto', height: '56px', borderRadius: '50%', aspectRatio: 1 }} display={'flex'} alignItems={'center'} justifyContent={'center'} position={'relative'}>
                            <Link to="/" display={'flex'} alignItems={'center'}>
                                <img src="images\icons\arrow-left-light (1).svg" style={{ width: '22px', height: '22px', color: 'white', fill: 'white' }} />
                            </Link>
                        </Box>
                        <Box width={'100%'} ml={2}>
                            <TextField2
                                id="outlined-basic"
                                label="Search deck"
                                variant="outlined"
                                fullWidth
                                onChange={handleSearchChange}
                                className="pageInput customInput"
                                placeholder=''
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12} mt={3} display={'flex'} columnGap={2}>
                        <Box bgcolor={owner == 'all' ? '#F4D144' : '#1F2430'} borderRadius={'5px'} p={1} width={'max-content'} onClick={() => setOwner('all')}>
                            <Typography fontSize={14} color={owner == 'all' ? '#050B18' : '#696C75'} fontWeight={owner == 'all' ? 500 : 400}>
                                All decks
                            </Typography>
                        </Box>
                        <Box bgcolor={owner == 'player' ? '#F4D144' : '#1F2430'} borderRadius={'5px'} p={1} width={'max-content'} onClick={() => setOwner('player')}>
                            <Typography fontSize={14} color={owner == 'player' ? '#050B18' : '#696C75'} fontWeight={owner == 'player' ? 500 : 400}>
                                My decks
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12} mt={4}>
                        <Box>
                            {sortedDecks?.map(record => (
                                <Link to={`/deck/${record.id}/show`} style={{ textDecoration: 'none', color: 'inherit' }} key={record.id} sx={{ width: "100%" }}>
                                    <Grid mb={2}>
                                        <RecordContextProvider key={record.id} value={record}>
                                            <Box display="flex">
                                                <Box>
                                                    <ImageField source="card_data.image_uris.art_crop" className={`mobileGridImage ${checkRetired(record) ? 'retiredOverlay' : null}`} />
                                                </Box>
                                                <Box ml={1.5} pr={1}>
                                                    <Typography>
                                                        <TextField source="name" fontSize={16} fontWeight={500} color={'white'} />
                                                    </Typography>
                                                    <Box display={'flex'}>
                                                        <Typography color={'white'}>
                                                            <DeckColors label="Deck colors" name={false} />
                                                        </Typography>
                                                        <Box width={'1px'} bgcolor={'rgba(255, 255, 255, 0.5)'} mx={1.5} my={0.5}></Box>
                                                        <Typography color={'#607095'} my={'auto'}>
                                                            <TextField source="arctype" fontSize={14} />
                                                        </Typography>
                                                    </Box>
                                                    <Typography color={'#607095'}>
                                                        <span style={{ marginRight: "6px", fontSize: '12px' }}>Owner:</span>
                                                        <ReferenceField source="owner" reference="player">
                                                            <TextField source="name" fontSize={12} />
                                                        </ReferenceField>
                                                    </Typography>
                                                </Box>
                                                <Box ml={'auto'} width={'35px'} height={'35px'} sx={{ border: '1.5px solid #F4D144' }} borderRadius={'50%'} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                                                    <img src="images\icons\arrow-right-light.svg" alt="" style={{ padding: '8px', width: '32px', height: '35px' }} />
                                                </Box>
                                            </Box>
                                        </RecordContextProvider>
                                    </Grid>
                                </Link>
                            ))}
                        </Box>
                    </Grid>
                </Grid>
            </>
        ) : (
            <>
                <Grid item xs={12} mt={7} pb={6} mx={4}>
                    <Card className="playersCard">
                        <Grid container>
                            <Grid item xs={12} lg={6}>
                                <h1>Decks</h1>
                                <p>Se and filter the list of all registered decks</p>
                            </Grid >
                        </Grid >
                    </Card >

                    <Box mt={3}>

                    </Box>
                </Grid>
            </>
        )
    );
}
