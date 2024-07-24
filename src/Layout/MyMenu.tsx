import { Logout, Menu, MenuItemLink, useGetIdentity } from 'react-admin';
import { Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';

export const MyMenu = () => {
    const { data: identity, isLoading, error } = useGetIdentity();

    return (
        <Menu className="sideMenu">
            <Typography variant='h5' fontWeight={600} pt={4} color={'white'} textAlign={'center'}>
                {/* <img src="public\images\magic gutta logo hvit-gul.png" /> */}
                MagiGutta
            </Typography>
            <Typography color={'#868ba3'} fontWeight={400} fontSize={16} pt={3} sx={{ opacity: "60%" }}>
                Menu
            </Typography>
            <Menu.DashboardItem />
            <Menu.ResourceItem name="player" />
            <Menu.ResourceItem name="deck" />
            <Menu.ResourceItem name="match" />
            <Typography color={'#868ba3'} fontWeight={400} fontSize={16} pt={3} sx={{ opacity: "60%" }}>
                Account
            </Typography>
            <MenuItemLink
                to="my-decks"
                primaryText="My decks"
                leftIcon={<HomeRepairServiceIcon />}
            />
            <MenuItemLink
                to="/profile"
                primaryText="Edit profile"
                leftIcon={<PersonIcon />}
            />
            <Logout className="logoutButton" />
        </Menu>
    )
};