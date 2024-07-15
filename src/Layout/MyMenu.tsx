import { CustomRoutes, Logout, Menu, MenuItemLink, useGetIdentity } from 'react-admin';
import LabelIcon from '@mui/icons-material/Label';
import { Typography } from '@mui/material';
import { Route } from "react-router";
import PersonIcon from '@mui/icons-material/Person';

export const MyMenu = () => {
    const { data: identity, isLoading, error } = useGetIdentity();

    return (
        <Menu className="sideMenu">
            <Typography variant='h5' fontWeight={600} pt={4} color={'white'} textAlign={'center'}>
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
                to="/profile"
                primaryText="Profile"
                leftIcon={<PersonIcon />}
            />
            <Logout className="logoutButton" />
        </Menu>
    )
};