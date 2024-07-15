import {
  Admin,
  Resource,
  ListGuesser,
  EditGuesser,
  ShowGuesser,
  radiantLightTheme,
  radiantDarkTheme,
  CustomRoutes,
} from "react-admin";
import { Layout } from "./Layout";
import dataProvider from "./Providers/dataProvider";
import { DeckList } from "./Decks/DeckList";
import { PlayerList } from "./Players/PlayerList";
import { Dashboard } from "./Dashboard/Dashboard";
import DeckCreate from "./Decks/DeckCreate";
import { PlayerShow } from "./Players/PlayerShow";
import { DeckShow } from "./Decks/DeckShow";
import { MatchList } from "./Matches/MatchList";
import { MatchShow } from "./Matches/MatchShow";
import MatchCreate from "./Matches/MatchCreate";
import PersonIcon from '@mui/icons-material/Person';
import StyleIcon from '@mui/icons-material/Style';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import { MyLayout } from "./Layout/Layout";
import { authProvider } from "./Providers/authProvider";
import LoginScreen from "./Login/LoginScreen";
import { Route } from "react-router";
import ProfileEdit from "./Profile/ProfileEdit";
import { DeckEdit } from "./Decks/DeckEdit";

const theme = {
  palette: {
    primary: {
      main: '#13182e',
      // light: will be calculated from palette.primary.main,
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
  }
}

export const App = () => {

  return (
    <Admin
      dashboard={Dashboard}
      layout={MyLayout}
      theme={theme}
      dataProvider={dataProvider}
      authProvider={authProvider}
      loginPage={LoginScreen}
    >
      <Resource name="player" list={PlayerList} show={PlayerShow} icon={PersonIcon} />
      <Resource name="deck" list={DeckList} show={DeckShow} edit={DeckEdit} create={DeckCreate} icon={StyleIcon} />
      <Resource name="match" list={MatchList} show={MatchShow} create={MatchCreate} icon={Diversity3Icon} />
      <CustomRoutes>
        <Route path="/profile" element={<ProfileEdit />} />
      </CustomRoutes>
    </Admin>
  )
};
