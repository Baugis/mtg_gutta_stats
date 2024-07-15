// in src/MyAppBar.js
import * as React from 'react';
import { AppBar, TitlePortal } from 'react-admin';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';


export const MyAppBar = () => (
    <AppBar color="primary">
        <Box flex="1" />
        <Typography variant='h5' fontWeight={600} py={2}>
            MagiGutta
        </Typography>
        <Box flex="1" />
    </AppBar>
);