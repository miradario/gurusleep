// @flow
import * as React from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  Image,
  TouchableHighlight,
  InteractionManager,
  StatusBar,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { Video } from 'expo-av';
import { Button, Icon, Header, Text, Left, Title, Body, Right } from 'native-base';
import { Foundation as Iconfound } from 'react-native-vector-icons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { DrawerActions } from 'react-navigation-drawer';
import { StackActions, NavigationActions } from 'react-navigation';
import { Images, Styles, WindowDimensions, Container } from '../components';
import type { NavigationProps } from '../components/Types';
import variables from '../../native-base-theme/variables/commonColor';
import * as FirebaseAPI from '../../modules/firebaseAPI.js';
import COLORS from '../assets/Colors';
import translate from '../../utils/language';
import { checkInternetConnection } from 'react-native-offline';

export default class Drawer extends React.Component<NavigationProps<>> {
  state = {
    isConnected: true,
  };

  go(key: string) {
    this.props.navigation.navigate(key);
  }

  logout(navigation) {
    FirebaseAPI.logoutUser();
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate('Login');
    });
  }

  checkConnection = async () => {
    const isConnected = await checkInternetConnection();
    this.setState({ isConnected: isConnected });
  };

  componentDidUpdate(prevProps) {
    if (!prevProps.navigation.state.isDrawerOpen && this.props.navigation.state.isDrawerOpen) {
      this.checkConnection();
    }
  }

  login = () => {
    this.props.navigation.navigate('Login');
  };
  render(): React.Node {
    const { navigation } = this.props;
    return (
      <SafeAreaView style={{ backgroundColor: COLORS.white, flex: 1 }}>
        <StatusBar backgroundColor="white" barStyle="dark-content" />
        <ImageBackground style={style.background} source={Images.home_bg_more}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba( 255, 255, 255, 0.7 )',
            }}
          >
            <View style={style.closeBar}>
              <Button transparent onPress={() => this.props.navigation.dispatch(DrawerActions.toggleDrawer())}>
                <Icon name="ios-close" style={style.closeIcon} />
              </Button>
              <Image source={Images.tlex_orig} style={style.tlexLogo}></Image>
            </View>
            <View style={style.itemContainer}>
              <DrawerItem
                {...{ navigation }}
                navegar="Sleep"
                name={translate('More.sleep')}
                icon="ios-moon"
                subsection={1}
                left
                enabled={this.state.isConnected}
              />
              <DrawerItem
                {...{ navigation }}
                navegar="Music"
                name={translate('More.music')}
                icon="ios-musical-notes"
                subsection={2}
                enabled={this.state.isConnected}
              />
              <DrawerItem
                {...{ navigation }}
                navegar="Teachers"
                name={translate('More.teachers')}
                icon="ios-people"
                left
                enabled={this.state.isConnected}
              />
              <DrawerItem
                {...{ navigation }}
                navegar="Settings"
                name={translate('More.settings')}
                icon="ios-settings"
                left
                enabled={this.state.isConnected}
              />
              <DrawerItem
                {...{ navigation }}
                navegar="Faq1"
                name={translate('More.faq')}
                icon="ios-information-circle"
                enabled={this.state.isConnected}
              />
              <DrawerItem
                {...{ navigation }}
                navegar="Downloads"
                name={translate('More.downloads')}
                icon="ios-cloud-download"
                enabled={true}
              />
              <DrawerItem
                {...{ navigation }}
                navegar="Phrase"
                name={translate('More.weeklyphrases')}
                icon="ios-calendar"
                enabled={true}
              />
            </View>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }
}

type DrawerItemProps = NavigationProps<> & {
  name: string,
  icon: string,
  left?: boolean,
};

class DrawerItem extends React.PureComponent<DrawerItemProps> {
  render(): React.Node {
    const { name, navegar, navigation, icon, left, subsection, enabled } = this.props;
    const navState = this.props.navigation.state;
    const active = navState.routes[navState.index].key === navegar;
    let props = {
      onPress: () => navigation.navigate(navegar),
      style: [style.item],
    };

    return (
      <TouchableOpacity {...props} activeOpacity={0.5} disabled={!enabled}>
        <View style={[Styles.center, Styles.flexGrow, style.drawerItemWrapper]}>
          <View style={[Styles.flexGrow, style.drawerItem]}>
            <Icon
              name={icon}
              style={[
                {
                  color: enabled ? COLORS.orange : COLORS.lightorange,
                },
                { fontSize: 35, marginRight: 25, width: 30 },
              ]}
            />
            <Text
              style={[{ color: enabled ? COLORS.black : COLORS.gray }, { fontFamily: 'Avenir-Book', fontSize: 17 }]}
            >
              {name}
            </Text>
            {active && <View style={style.dot} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

const style = StyleSheet.create({
  img: {
    ...StyleSheet.absoluteFillObject,
    width: WindowDimensions.width,
    height: WindowDimensions.height - Constants.statusBarHeight,

    //   top: Constants.statusBarHeight
  },
  gradientBg: {
    flex: 1,
    alignItems: 'center',
    width: WindowDimensions.width,
    //   top: Constants.statusBarHeight
  },
  closeIcon: {
    fontSize: 50,
    color: COLORS.orange,
  },
  closeBar: {
    alignSelf: 'flex-start',
    height: 40,
    marginLeft: 10,
    flexDirection: 'row',
    marginTop: 15,
  },
  itemContainer: {
    flex: 0.9,
    marginTop: 25,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    borderColor: variables.listBorderColor,
    // borderBottomWidth: variables.borderWidth
  },
  item: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    // borderColor: variables.listBorderColor
  },
  dot: {
    backgroundColor: 'white',
    height: 10,
    width: 10,
    borderRadius: 5,
    position: 'absolute',
    right: variables.contentPadding,
    top: variables.contentPadding,
    alignSelf: 'flex-end',
  },
  tlexLogoWrapper: {
    position: 'absolute',
    top: 37,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  tlexLogo: {
    width: 70,
    height: 50,
    marginLeft: WindowDimensions.width / 2 - 70,
    resizeMode: 'contain',
  },
  bgVideoWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 400,
  },
  bgVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  drawerItemWrapper: {
    borderRadius: 25,
    margin: 10,
  },
  drawerItem: {
    flex: 1,
    flexDirection: 'row',
    //padding: 0,
    paddingLeft: 25,
    backgroundColor: 'rgba( 255, 255, 255, 0 )',
    borderRadius: 25,
    justifyContent: 'flex-start',
    alignSelf: 'stretch',
    alignItems: 'center',
    // borderColor: COLORS.lightgray,
    // borderWidth: 1,
    //  shadowOffset: {
    //     width: 1, height: 1
    // },
    // shadowColor: COLORS.lightgray,
    // shadowOpacity: 0.7,
    //elevation: 0.2
  },
  background: {
    flex: 1,
  },
});
