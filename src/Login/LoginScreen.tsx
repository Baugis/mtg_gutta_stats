import { useState } from 'react';
import { useLogin, useNotify, Notification, useStore } from 'react-admin';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';

// Icons
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

// Interface
interface ApplicationStatus {
    id: number;
    name: string;
    color: string;
}

const LoginScreen = ({ }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const login = useLogin();
    const notify = useNotify();
    const [config, setConfig] = useStore('config', {});
    const [applications, setApplications] = useStore('applications', []);
    const [applicationCategories, setApplicationCategories] = useStore('applicationCategories', []);
    const [applicationStatuses, setApplicationStatuses] = useStore('applicationStatuses');

    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        // will call authProvider.login({ email, password })
        login({ username, password }).catch(() =>
            notify('Invalid email or password')
        );
    };

    // Changing the password show/hide
    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword(!showPassword);
    const handleMouseDownPassword = (e: { preventDefault: () => any; }) => e.preventDefault();

    return (
        <form onSubmit={handleSubmit} style={{ width: "100%" }} className="loginForm">
            <Grid container justifyContent={'center'}>
                <Grid item xs={12} md={6} lg={3}>
                    <Box p={5} mt={20}>
                        <Typography fontSize={30} fontWeight={600} py={2} textAlign={'center'} color={'white'}>
                            MagiGutta
                        </Typography>
                        <Grid container rowSpacing={2} mt={3}>
                            <Grid xs={12} mb={2}>
                                <TextField
                                    id="outlined-basic"
                                    label="Username"
                                    variant="outlined"
                                    onChange={e => setUsername(e.target.value)}
                                    fullWidth
                                    className="pageInput"
                                    placeholder='Username'
                                />
                            </Grid>

                            <Grid xs={12}>
                                <TextField
                                    label='Password'
                                    variant="outlined"
                                    type={showPassword ? "text" : "password"}
                                    onChange={e => setPassword(e.target.value)}
                                    fullWidth
                                    autoComplete="current-password"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleClickShowPassword}
                                                    onMouseDown={handleMouseDownPassword}
                                                >
                                                    {showPassword ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>

                            <Grid xs={12} mt={3} display={'flex'} justifyContent={'center'}>
                                <Button type="submit" variant="contained">
                                    Login
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
            </Grid>
        </form>
    );
}

export default LoginScreen;
