// @flow
/* eslint-disable no-console, global-require, no-nested-ternary, react/jsx-indent */
import * as React from 'react';
import { Dimensions, View, Platform, Image, StatusBar, Text, YellowBox, LogBox } from 'react-native';
import { StyleProvider } from 'native-base';
import {
  createAppContainer,
  createSwitchNavigator,
  createBottomTabNavigator,
  NavigationActions,
} from 'react-navigation';
import { createStackNavigator, TransitionPresets } from 'react-navigation-stack';
import AsyncStorage from '@react-native-community/async-storage';
import { createDrawerNavigator, DrawerActions } from 'react-navigation-drawer';
import createAnimatedSwitchNavigator from 'react-navigation-animated-switch';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';
import { Transition } from 'react-native-reanimated';
import * as ScreenOrientation from 'expo-screen-orientation';
import { AppLoading } from 'expo';
import * as Font from 'expo-font';
import Icon from 'react-native-vector-icons/Ionicons';
import { FontAwesome5 } from 'react-native-vector-icons';
import { Images } from './src/components';
import { Login, Forgot } from './src/login';

import { SignUp } from './src/sign-up';
import { Walkthrough } from './src/walkthrough';
import { Drawer } from './src/drawer';
import { Home } from './src/home';
import { Impressum } from './src/impressum';
import { Notification, Settings } from './src/settings';
import { Purchase } from './src/purchase';
import { Downloads, Meditate, Sleep, Music, Breath, Work } from './src/meditate';
import { Challenges } from './src/challenges';

import { Resources } from './src/resources';
import { Phrase } from './src/phrases';
import { PhrasesDetail } from './src/phrases';
import { Create, Create2 } from './src/create';

import { Pdf } from './src/pdf';
import { Faq1 } from './src/faq1';
import { Player } from './src/player';

import * as challengesAPI from './modules/challengesAPI.js';
import * as firebaseAPI from './modules/firebaseAPI';

import { Splash } from './src/splash';
import { Audios, AudiosPlayer, Finished } from './src/audios';

import { Mountain } from './src/mountain';
import { Teachers } from './src/teachers';

import * as Notifications from 'expo-notifications';
import getTheme from './native-base-theme/components';
import variables from './native-base-theme/variables/commonColor';
import firebase from 'firebase';
import COLORS from './src/assets/Colors';
import i18n from 'i18n-js';
import translate from './utils/language';

// import _ from 'lodash';
import * as Matomo from 'react-native-matomo';
import * as localVariables from './utils/localVariables.js';

import { Linking } from 'react-native';
import dynamicLinks from '@react-native-firebase/dynamic-links';

import { NetworkProvider } from 'react-native-offline';
//import NavigationService from './src/components/NavigationService';

LogBox.ignoreLogs([
  'Tried to set property `muted` on view manager of view `ExpoVideoView` when the view manager does not export such prop.',
  'Animated: `useNativeDriver` was not specified. This is a required option and must be explicitly set to `true` or `false`',
  'Setting a timer for a long period of time, i.e. multiple minutes, is a performance and correctness issue on Android as it keeps the timer module awake, and timers can only be called when the app is in the foreground. See https://github.com/facebook/react-native/issues/12981 for more info. (Saw setTimeout with duration 1666978ms)',
]);

const config = {
  apiKey: 'AIzaSyAp5sSdF2WZjOPMN714lDBJIvmirOscli0',
  authDomain: 'tlex-app-933fb.firebaseapp.com',
  databaseURL: 'https://tlex-app-933fb.firebaseio.com',
  projectId: 'tlex-app-933fb',
  storageBucket: 'tlex-app-933fb.appspot.com',
  messagingSenderId: '908534966941',
  appId: '1:908534966941:web:5347b5c820ef039a840274',
  measurementId: 'G-D6XRF5GB2Q',
};
Matomo.initTracker('https://gesundes-und-achtsames-fuehren.de/matomo/matomo.php', 1);
firebase.initializeApp(config);

type AppState = {
  ready: boolean,
};

buttomMargin = Platform.OS == 'ios' ? -30 : -19;

function getActiveRouteName(navigationState) {
  if (!navigationState) {
    return null;
  }
  const route = navigationState.routes[navigationState.index];
  // dive into nested navigators
  if (route.routes) {
    return getActiveRouteName(route);
  }
  return route.routeName;
}

function parseURL(linkURL) {
  let url = linkURL;
  let regex = /[?&]([^=#]+)=([^&#]*)/g,
    params = {},
    match;
  while ((match = regex.exec(url))) {
    params[match[1]] = match[2];
  }
  const meditation = params.meditation ? params.meditation : false;
  return meditation;
}

export default class App extends React.Component<{}, AppState> {
  state = {
    ready: false,
    tabLabels: {
      home: 'Home',
      break: 'Break',
      challente: 'Challenge',
      work: 'Work',
      breath: 'Breath',
      more: 'More',
    },
  };

  UNSAFE_componentWillMount() {
    const promises = [];
    promises.push(
      Font.loadAsync({
        'Avenir-Book': require('./assets/fonts/Avenir-Book.ttf'),
        'Avenir-Light': require('./assets/fonts/Avenir-Light.ttf'),
        'Avenir-Black': require('./assets/fonts/Avenir-Black.ttf'),
      })
    );
    Images.downloadAsync();
    Promise.all(promises)
      .then(() => this.setState({ ready: true }))
      // eslint-disable-next-line
      .catch((error) => console.error(error));
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    // if(Platform.OS === 'android'){
    //     this.reactivateNotifications();
    // }
    //this.DynamicLink();
  }

  static navigationOptions = {
    // A
    title: 'Home',
  };

  redirectDynamicLink = (link) => {
    const meditation = parseURL(link.url);
    if (meditation) {
      //Navegar en funcion de la meditacion linkeada
      console.log(meditation);
      //   NavigationService.navigate('Audio', { key: meditation });
      NavigationActions.navigate('Audios', { key: meditation });
      //handleOpenURL('Audio', { key: meditation, title: 'test', link: true });
    }
  };

  async DynamicLink() {
    const handleDynamicLink = (link) => {
      console.log('link');
      console.log(link);
      this.redirectDynamicLink(link);
    };
    dynamicLinks().onLink(handleDynamicLink);

    const initialLink = await dynamicLinks().getInitialLink();
    if (initialLink) {
      this.redirectDynamicLink(initialLink);
    }
  }

  componentDidMount() {
    this.setBarLabels();
  }

  navigate = (url) => {
    // E
    const { navigate } = this.props.navigation;
    const route = url.replace(/.*?:\/\//g, '');
    const id = route.match(/\/([^\/]+)\/?$/)[1];
    const routeName = route.split('/')[0];

    if (routeName === 'tlex') {
      NavigationService.navigate('Audio', { key: 'Lucy' });
      //navigate('Audio', { key: id, title: 'test', link: true });
    }
  };

  componentWillUnmount() {
    // C
    Linking.removeEventListener('url', this.handleOpenURL);
  }

  handleOpenURL = (event) => {
    // D
    this.navigate(event.url);
  };

  setBarLabels = async () => {
    try {
      const value = await AsyncStorage.getItem('language');
      if (value !== null) {
        i18n.locale = value;
      } else {
        i18n.locale = 'en';
      }
      const newTabLabels = {
        home: translate('Menutab.home'),
        break: translate('Menutab.mindfullness'),
        challenge: translate('Menutab.challenges'),
        work: translate('Menutab.work'),
        breath: translate('Menutab.breath'),
        more: translate('Menutab.more'),
      };
      this.setState({ tabLabels: newTabLabels });
    } catch (error) {}
  };

  async reactivateNotifications() {
    const userData = await FirebaseAPI.getUser();
    if (userData.notifications === 1) {
      Notifications.cancelAllScheduledNotificationsAsync();
      challengesAPI.registerForLocalNotifications();
    }
  }

  render(): React.Node {
    const { ready, tabLabels } = this.state;
    return (
      <NetworkProvider pingOnlyIfOffline pingInterval={30000}>
        <StyleProvider style={getTheme(variables)}>
          <AppNavigator
            screenProps={tabLabels}
            onNavigationStateChange={(prevState, currentState, action) => {
              const currentRouteName = getActiveRouteName(currentState);
              const previousRouteName = getActiveRouteName(prevState);
              if (previousRouteName !== currentRouteName) {
              }
            }}
          />
        </StyleProvider>
      </NetworkProvider>
    );
  }
}

const ResourceNavigator = createStackNavigator(
  {
    Resource: { screen: Resources },
    Pdf: { screen: Pdf },
  },
  {
    headerMode: 'none',
    navigationOptions: {
      headerVisible: false,
    },
  }
);

const PhrasesNavigator = createStackNavigator(
  {
    Phrase: { screen: Phrase },
  },
  {
    headerMode: 'none',
    navigationOptions: {
      headerVisible: false,
    },
  }
);

const MeditateListNavigator = createStackNavigator(
  {
    MainStack: { screen: Meditate },
    BuyModal: { screen: Purchase },
  },
  {
    headerMode: 'none',
    defaultNavigationOptions: {
      ...TransitionPresets.ModalPresentationIOS,
      gestureEnabled: true,
      cardOverlayEnabled: true,
      headerVisible: false,
    },
    mode: 'modal',
  }
);

const BreathListNavigator = createStackNavigator(
  {
    MainStack: { screen: Breath },
    BuyModal: { screen: Purchase },
  },
  {
    headerMode: 'none',
    defaultNavigationOptions: {
      ...TransitionPresets.ModalPresentationIOS,
      gestureEnabled: true,
      cardOverlayEnabled: true,
      headerVisible: false,
    },
    mode: 'modal',
  }
);

const WorkListNavigator = createStackNavigator(
  {
    MainStack: { screen: Work },
    BuyModal: { screen: Purchase },
  },
  {
    headerMode: 'none',
    defaultNavigationOptions: {
      ...TransitionPresets.ModalPresentationIOS,
      gestureEnabled: true,
      cardOverlayEnabled: true,
      headerVisible: false,
    },
    mode: 'modal',
  }
);

const CreateNavigator = createStackNavigator(
  {
    Create: { screen: Create },
    Create2: { screen: Create2 },
  },
  {
    headerMode: 'none',
    navigationOptions: {
      headerVisible: false,
    },
  }
);

const ChallengeNavigator = createStackNavigator(
  {
    Challenges: { screen: Challenges },
    Create: { screen: Create },
    Create2: { screen: Create2 },
    Mountain: { screen: Mountain },
  },
  {
    headerMode: 'none',
    navigationOptions: {
      headerVisible: false,
    },
  }
);

const MeditateNavigator = createStackNavigator(
  {
    Meditate: { screen: MeditateListNavigator },
    Audios: { screen: Audios },
    AudiosPlayer: { screen: AudiosPlayer },
    Player: { screen: Player },
    Finished: { screen: Finished },
  },
  {
    headerMode: 'none',
    navigationOptions: {
      headerVisible: false,
    },
  }
);

const SleepNavigator = createStackNavigator(
  {
    Sleep: { screen: Sleep },
    Audios: { screen: Audios },
    AudiosPlayer: { screen: AudiosPlayer },
    Player: { screen: Player },
    Finished: { screen: Finished },
  },
  {
    headerMode: 'none',
    navigationOptions: {
      headerVisible: false,
    },
  }
);

const DownloadsNavigator = createStackNavigator(
  {
    Downloads: { screen: Downloads },
    Audios: { screen: Audios },
    AudiosPlayer: { screen: AudiosPlayer },
    Player: { screen: Player },
    Finished: { screen: Finished },
  },
  {
    headerMode: 'none',
    navigationOptions: {
      headerVisible: false,
    },
  }
);

const MusicNavigator = createStackNavigator(
  {
    Music: { screen: Music },
    Audios: { screen: Audios },
    AudiosPlayer: { screen: AudiosPlayer },
    Player: { screen: Player },
    Finished: { screen: Finished },
  },
  {
    headerMode: 'none',
    navigationOptions: {
      headerVisible: false,
    },
  }
);

const BreathNavigator = createStackNavigator(
  {
    Breath: { screen: BreathListNavigator },
    Audios: { screen: Audios },
    AudiosPlayer: { screen: AudiosPlayer },
    Player: { screen: Player },
    Finished: { screen: Finished },
  },
  {
    headerMode: 'none',
    navigationOptions: {
      headerVisible: false,
    },
  }
);

const WorkNavigator = createStackNavigator(
  {
    Work: { screen: WorkListNavigator },
    Player: { screen: Player },
    AudiosPlayer: { screen: AudiosPlayer },
    Audios: { screen: Audios },
    Finished: { screen: Finished },
  },
  {
    headerMode: 'none',
    navigationOptions: {
      headerVisible: false,
    },
  }
);

const MountainNavigator = createStackNavigator(
  {
    Home: { screen: Home },
    Audios: { screen: Audios },
    AudiosPlayer: { screen: AudiosPlayer },
    Finished: { screen: Finished },
    Player: { screen: Player },
    Mountain: { screen: Mountain },
    Create: { screen: Create },
    Create2: { screen: Create2 },
    Meditate: { screen: Meditate },
  },
  {
    headerMode: 'none',
    navigationOptions: {
      headerVisible: false,
    },
  }
);

const SettingsNavigator = createStackNavigator(
  {
    MainStack: { screen: Settings },
    Impressum: { screen: Impressum },
    Purchase: { screen: Purchase },
    Notification: { screen: Notification },
  },
  {
    headerMode: 'none',
    navigationOptions: {
      headerVisible: false,
    },
    mode: 'modal',
  }
);

const MoreNavigator = createStackNavigator(
  {
    Teachers: { screen: Teachers },
    Settings: { screen: SettingsNavigator },
    Faq1: { screen: Faq1 },
    Resources: { screen: ResourceNavigator },
    Phrases: { screen: PhrasesNavigator },
    Sleep: { screen: SleepNavigator },
    Music: { screen: MusicNavigator },
    Downloads: { screen: DownloadsNavigator },
    Home: { screen: Home },
  },
  {
    headerMode: 'none',
    navigationOptions: {
      headerVisible: false,
    },
  }
);

/* const MainNavigator = createDrawerNavigator({

    Home: { screen: Home },


}, {
    drawerWidth: Dimensions.get("window").width,
    // eslint-disable-next-line flowtype/no-weak-types
    contentComponent: (Drawer: any),
    drawerBackgroundColor: variables.brandInfo
}); */

const WalkthroughNavigator = createStackNavigator(
  {
    MainScreen: { screen: Walkthrough },
    BuyScreen: { screen: Purchase },
  },
  {
    headerMode: 'none',
    defaultNavigationOptions: {
      ...TransitionPresets.ModalPresentationIOS,
      gestureEnabled: true,
      cardOverlayEnabled: true,
      headerVisible: false,
    },
    mode: 'modal',
  }
);

const TabNavigator = createMaterialBottomTabNavigator(
  {
    Home: {
      screen: MountainNavigator, // RootNavigator
      navigationOptions: ({ navigation, navigationOptions, screenProps }) => ({
        tabBarLabel: screenProps.home,
        tabBarIcon: ({ focused, tintColor }) => (
          <View style={{ paddingBottom: 5 }}>
            <Image
              source={focused ? Images.iconHome : Images.iconHomeEmpty}
              style={{
                width: 22,
                height: 22,
                tintColor,
              }}
            />
            {/* <Text>{i18n.t('Menutab.home')}</Text>  */}
            {/* <Icon style={[{ color: tintColor }]} size={27} name={'ios-home'} /> */}
          </View>
        ),
      }),
    },
    MinfullBreak: {
      screen: MeditateNavigator,
      navigationOptions: ({ navigation, navigationOptions, screenProps }) => ({
        tabBarLabel: screenProps.break,
        tabBarIcon: ({ focused, tintColor }) => (
          <View style={{ paddingBottom: 5 }}>
            <Image
              source={focused ? Images.iconBreak : Images.iconBreakEmpty}
              style={{
                width: 22,
                height: 22,
                tintColor,
              }}
            />
            {/* <Icon style={[{ color: tintColor }]} size={27} name={'ios-apps'} /> */}
          </View>
        ),
      }),
    },
    Challenges: {
      screen: ChallengeNavigator,
      navigationOptions: ({ navigation, navigationOptions, screenProps }) => ({
        tabBarLabel: screenProps.challenges,
        tabBarIcon: ({ focused, tintColor }) => (
          <View style={{ paddingBottom: 5 }}>
            <Image
              source={focused ? Images.iconChallenge : Images.iconChallengeEmpty}
              style={{
                width: 22,
                height: 22,
                tintColor,
              }}
            />
            {/* <Icon style={[{ color: tintColor }]} size={27} name={'ios-rocket'} /> */}
          </View>
        ),
      }),
    },
    Work: {
      screen: WorkNavigator,
      navigationOptions: ({ navigation, navigationOptions, screenProps }) => ({
        tabBarLabel: screenProps.work,
        tabBarIcon: ({ focused, tintColor }) => (
          <View style={{ paddingBottom: 5 }}>
            <Image
              source={focused ? Images.iconWork : Images.iconWorkEmpty}
              style={{
                width: 22,
                height: 22,
                tintColor,
              }}
            />
            {/* <Icon style={[{ color: tintColor }]} size={27} name={'ios-stopwatch'} /> */}
          </View>
        ),
      }),
    },
    Breath: {
      screen: BreathNavigator,
      navigationOptions: ({ navigation, navigationOptions, screenProps }) => ({
        tabBarLabel: screenProps.breath,
        tabBarIcon: ({ focused, tintColor }) => (
          <View style={{ paddingBottom: 5 }}>
            <Image
              source={focused ? Images.iconBreath : Images.iconBreathEmpty}
              style={{
                width: 22,
                height: 22,
                tintColor,
              }}
            />
            {/* <Icon style={[{ color: tintColor }]} size={27} name={'ios-moon'} /> */}
          </View>
        ),
      }),
    },
    More: {
      screen: MoreNavigator,
      navigationOptions: ({ navigation, navigationOptions, screenProps }) => ({
        tabBarLabel: screenProps.more,
        tabBarOnPress: () => {
          navigation.dispatch(DrawerActions.toggleDrawer());
        },
        tabBarIcon: ({ focused, tintColor }) => (
          <View>
            <Image
              source={focused ? Images.iconDots : Images.iconDotsEmpty}
              style={{
                width: 25,
                height: 27,
                tintColor,
              }}
            />
          </View>
        ),
      }),
    },
  },
  {
    initialRouteName: 'Home',
    labeled: true,
    activeColor: COLORS.white,
    inactiveColor: COLORS.white,
    backBehavior: 'order',
    shifting: false,
    barStyle: {
      paddingTop: 10,
      backgroundColor: COLORS.blue,
      borderColor: 'transparent',
    },
  }
);

const DrawerNavigator = createDrawerNavigator(
  {
    Home: { screen: TabNavigator },
  },
  {
    drawerPosition: 'right',
    // eslint-disable-next-line flowtype/no-weak-types
    drawerWidth: Dimensions.get('window').width,
    contentComponent: (Drawer: any),
  }
);

const AppNavigator = createAppContainer(
  createSwitchNavigator(
    {
      // Splash: { screen: Splash },
      Main: { screen: DrawerNavigator },
      Walkthrough: { screen: WalkthroughNavigator },
      SignUp: { screen: SignUp },
      Login: { screen: Login },
      Forgot: { screen: Forgot },
      // Settings: { screen: Settings },
      // Player: { screen: Player },
      // Home: { screen: Home },
    },
    {
      headerMode: 'none',
      cardStyle: {
        backgroundColor: variables.brandInfo,
      },
      // The previous screen will slide to the bottom while the next screen will fade in
      transition: (
        <Transition.Together>
          <Transition.Out type="slide-left" durationMs={400} interpolation="easeIn" />
          <Transition.In type="fade" durationMs={500} />
        </Transition.Together>
      ),
    }
  )
);

export { AppNavigator };
