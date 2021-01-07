import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  StatusBar,
  Animated,
  FlatList,
  TouchableOpacity,
  Easing,
  Platform,
  Vibration,
  Alert,
} from 'react-native';
import { Video } from 'expo-av';
import Images from '../components/images';
import { Ionicons } from '@expo/vector-icons';
import { HomeContainer, FavButton, LockButton, CachedImage } from '../components';
import WindowDimensions from '../components/WindowDimensions';
import { LinearGradient } from 'expo-linear-gradient';
import COLORS from '../assets/Colors';
import BottomUpPanel from '../components/BottomPanel/index';
import moment from 'moment';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import {
  getUser,
  getRecommendedContent,
  getFavsContent,
  getDownloadsContent,
  removeFav,
} from '../../modules/firebaseAPI';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import firebase from 'firebase';
import translate from '../../utils/language';
import * as Animatable from 'react-native-animatable';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Audio } from 'expo-av';
import { State, PanGestureHandler } from 'react-native-gesture-handler';
import * as FirebaseAPI from '../../modules/firebaseAPI.js';
import * as Matomo from 'react-native-matomo';
import * as RNIap from 'react-native-iap';
import {
  savePremiumValue,
  saveReceiptData,
  getOptOutStatus,
  getMeditation,
  setUserLastEnter,
  getUserLastEnter,
} from '../../modules/firebaseAPI';
import * as commonFunctions from '../../utils/common.js';
import * as localVariables from '../../utils/localVariables.js';
import i18n from 'i18n-js';
import Purchases from 'react-native-purchases';
import WeeklyNotice from '../weeklyNotice/WeeklyNotice';
import { checkInternetConnection, NetworkConsumer } from 'react-native-offline';
import AsyncStorage from '@react-native-community/async-storage';
import { registerWeeklyInspirationNotif } from '../../modules/notificationsAPI';

const urlimg = 'https://tlexeurope.s3.eu-central-1.amazonaws.com/images/portaits/';

export default class Home extends Component {
  constructor() {
    super();
    this.state = {
      animation: new Animated.Value(1),
      showCover: true,
      panelHeight: 185,
      dashMargin: 0,
      headerWidth: 0,
      headerHeight: 0,
      arrowVisible: true,
      expoPushToken: '',
      notification: {},
      userAuthorized: false,
      contentFavs: [],
      challengeList: [],
      premium: false,
      lifetime: false,
      takeDeepText: '',
      showNotice: false,
      connected: true,
    };
  }

  set_localLanguage = async () => {
    try {
      const value = await AsyncStorage.getItem('language');
      if (value !== null) {
        i18n.locale = value;
      } else {
        i18n.locale = 'en';
      }
    } catch (error) {
      console.log(error);
      // Error retrieving data
    }
  };

  async _playRecording() {
    const soundObject = new Audio.Sound();
    try {
      await soundObject.loadAsync(require('../../assets/audio/breathe.mp3'));
      this.audioPlayer1 = soundObject;
      this.audioPlayer1.playAsync();
      this.audioPlayer1.setVolumeAsync(0.006);
      this.audioPlayer1.setPositionAsync(0);
      this.audioPlayer1.setRateAsync(1, false);
    } catch (error) {
      // An error occurred!
    }
  }

  getChallengeList = async () => {
    const challenges = await FirebaseAPI.getUserChallenges();
    this.setState({ challengeList: challenges });
  };

  setDeepBreathText = async () => {
    await this.set_localLanguage();
    let takeDeepBreathText = translate('Home.takeadeep');
    this.setState({ takeDeepText: takeDeepBreathText });
  };

  async componentDidMount() {
    this.setDeepBreathText();
    this.setState({ connected: await checkInternetConnection() });
    commonFunctions.matomoTrack('screen', 'Home');
    this.watchAuthState(this.removeCover, this.initializeAnalytics, this.CheckPremium);
    //this._playRecording();
    this._notificationSubscription = Notifications.addNotificationReceivedListener((notification) => {
      this._handleNotification;
    });
  }

  parseURL(linkURL) {
    let url = linkURL;
    console.log('url');
    console.log(url);
    let regex = /[?&]([^=#]+)=([^&#]*)/g,
      params = {},
      match;
    while ((match = regex.exec(url))) {
      params[match[1]] = match[2];
    }
    const meditation = params.meditation ? params.meditation : false;
    const category = params.category ? params.category : false;

    console.log('params en funcion');
    console.log(params);

    return params;
  }

  redirectDynamicLink = async (link) => {
    let params = {};
    params = this.parseURL(link.url);
    const meditation = params.meditation ? params.meditation : false;

    if (meditation) {
      const dataObj = await getMeditation(params.category, meditation);
      const title = dataObj.title;

      const duration = dataObj.Duration;
      const category = dataObj.category;
      const Description = dataObj.Description;
      const trainer = dataObj.Trainer;
      const music = dataObj.music;
      const photo = urlimg + meditation + '_cover.jpg';

      this.props.navigation.navigate('Audios', {
        key: meditation,
        title,
        photo,
        duration,
        category,
        Description,
        music,
        trainer,
      });
      //handleOpenURL('Audio', { key: meditation, title: 'test', link: true });
    }
  };
  async DynamicLink() {
    const handleDynamicLink = (link) => {
      console.log('HOMElink');
      console.log(link);
      this.redirectDynamicLink(link);
    };
    dynamicLinks().onLink(handleDynamicLink);

    const initialLink = await dynamicLinks().getInitialLink();
    if (initialLink) {
      this.redirectDynamicLink(initialLink);
    }
  }

  getStoragePremium = async () => {
    try {
      const premium = await AsyncStorage.getItem('premium');
      if (premium == 'true') {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
    }
  };

  CheckPremium = async () => {
    let receipt = await FirebaseAPI.getLastReceipt();
    let checkpremium = await this.getStoragePremium();
    let premiumContent;
    if (Platform.OS === 'android') {
      checkpremium = await this.CheckisPremiumAndroid();
    } else {
      try {
        checkpremium = await this.CheckisPremiumIOS(receipt);
        //checkpremium = await this.CheckisPremiumIOS();
      } catch {
        console.log('Error on checking premium for iOS');
      }
    }
    console.log('Changing premium value to: ' + checkpremium);
    premiumContent = await savePremiumValue(checkpremium);
  };

  async CheckisPremiumAndroid() {
    let premium = false;
    RNIap.initConnection();
    const purchases = await RNIap.getAvailablePurchases();
    purchases.forEach((purchase) => {
      if (purchase.productId == 'monthly' || purchase.productId == 'anual') {
        premium = true;
        this.setState({ premium: true });
      }
    });
    return premium;
  }

  async CheckisPremiumIOS(latestAvailableReceipt) {
    let premium = false;
    await RNIap.initConnection();
    await RNIap.clearTransactionIOS();
    console.log('Getting subscription status...');
    // const purchases = await RNIap.getAvailablePurchases();
    //if (purchases.length > 0) {
    // const sortedAvailablePurchases = purchases.sort(
    //     (a, b) => b.transactionDate - a.transactionDate
    // );
    // const latestAvailableReceipt =
    //     sortedAvailablePurchases[0].transactionReceipt;
    // // await saveReceiptData(transactionReceipt);
    let receipt = await RNIap.validateReceiptIos(
      {
        'receipt-data': latestAvailableReceipt,
        password: '06314f32251d496483f7247df8eefb12',
      },
      false //__DEV__
    );
    if (receipt.status == 21007) {
      receipt = await RNIap.validateReceiptIos(
        {
          'receipt-data': latestAvailableReceipt,
          password: '06314f32251d496483f7247df8eefb12',
        },
        true //__DEV__
      );
    }
    if (typeof receipt.latest_receipt_info === 'undefined') {
      premium = false;
      console.log('Receipt undefined');
    } else {
      const renewalHistory = receipt.latest_receipt_info;
      renewalHistory.sort((a, b) => (a.transaction_id > b.transaction_id ? 1 : -1));
      const expiration = renewalHistory[renewalHistory.length - 1].expires_date_ms;
      const purchaseDate = renewalHistory[renewalHistory.length - 1].purchase_date_ms;
      const originalPurchaseDate = renewalHistory[renewalHistory.length - 1].original_purchase_date_ms;
      console.log(
        'Expiration: ' +
          moment.unix(expiration / 1000).format('DD-MM-YYYY H:mm:s') +
          ' - Purchase: ' +
          moment.unix(purchaseDate / 1000).format('DD-MM-YYYY H:mm:s')
      );
      if (expiration > Date.now()) {
        premium = true;
      }
    }
    //}

    return premium;
  }

  async checkIsPremiumCatRevenue() {
    Purchases.setDebugLogsEnabled(true);
    Purchases.setup('rSCtqjPrwxknXfaTtmFpLbaNsgeoAjCH');
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
        console.log(offerings.current.availablePackages);
      }
    } catch (e) {
      console.log(e);
    }
    try {
      const purchaserInfo = await Purchases.getPurchaserInfo();
      if (purchaserInfo.entitlements['premium']?.isActive == true) {
        console.log('User has access');
      } else {
        console.log('No access');
      }
    } catch (e) {
      console.log(e);
    }
  }

  initiateHome = () => {
    this.setContentData();
    this.getChallengeList();
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      this.setContentData();
      this.getChallengeList();
    });
    this._notificationSubscription = Notifications.addNotificationReceivedListener((notification) => {
      this._handleNotification;
    });
    this.DynamicLink();
    this.setWeeklyNotification();
  };

  setWeeklyNotification = async () => {
    await registerWeeklyInspirationNotif(this.props.navigation);
  };

  getOfflineDownloads = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('downloadsContent');
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.log(e);
    }
  };

  async setContentData() {
    const dataSetDownloads = await this.getOfflineDownloads();
    this.setState({ contentDownloads: dataSetDownloads });
    const dataSetFavs = await getFavsContent();
    const dataSetBreak = await getRecommendedContent('Mindfulness');
    const dataSetBreathPublic = await getRecommendedContent('BreathPublic');
    const userData = await getUser();
    let sky = 'no';
    let premium = false;
    let lifetime = false;
    let workShopPremium = false;
    let validWorkshop = true;
    if (userData.workshopcode !== null) {
      let workshopSKY = await FirebaseAPI.getWorkshop(userData.workshopcode);

      if (workshopSKY !== null) {
        sky = workshopSKY['sky'];
        workShopPremium = workshopSKY['Premium'];
      }
    }
    if (userData.premium != null) {
      premium = userData.premium;
    }
    if (userData.lifetime != null) {
      lifetime = userData.lifetime;
    }
    validWorkshop = await FirebaseAPI.validateworkshop(userData.workshopcode);
    if (workShopPremium && validWorkshop == 1) {
      premium = true;
    }
    let dataSetBreathPrivate = [];
    if (sky != 'no') {
      dataSetBreathPrivate = await getRecommendedContent('BreathPrivate');
    }
    const dataSetBreath = [...dataSetBreathPublic, ...dataSetBreathPrivate];
    const dataSetWork = await getRecommendedContent('Work');
    this.setState({
      contentFavs: dataSetFavs,
      contentBreak: dataSetBreak,
      contentBreath: dataSetBreath,
      contentWork: dataSetWork,
      premium: premium,
      lifetime: lifetime,
      contentReady: true,
    });
  }

  panelOpened = () => {
    let extraMargin = Platform.OS == 'ios' ? 0 : 0;
    let panelHeight = Platform.OS == 'ios' ? WindowDimensions.height / 6 : WindowDimensions.height / 6;
    this.setState({
      panelHeight: panelHeight,
      dashMargin: extraMargin,
      arrowVisible: false,
    });
  };

  panelClosed = () => {
    this.setState({ panelHeight: 220, dashMargin: 0, arrowVisible: true });
  };

  watchAuthState(removeCover, initializeAnalytics, CheckPremium) {
    let authorized = false;
    firebase.auth().onAuthStateChanged(function (user) {
      if (!user) {
        authorized = false;
      } else {
        authorized = true;
        CheckPremium();
        initializeAnalytics();
      }
      removeCover(authorized);
    });
    //this.removeCover(authorized);
  }

  async initializeAnalytics() {
    let optOutValue = 'disablebd';
    const baseOptOut = await getOptOutStatus();
    if (baseOptOut) {
      optOutValue = 'enabled';
    }
    await localVariables.setOptOut(optOutValue);
    const optOut = localVariables.getOptOut();
    if (optOut !== 'enabled') {
      Matomo.setUserId(firebase.auth().currentUser.uid);
      const userData = await getUser();
      let userWorkshop = userData.workshopcode != '' ? userData.workshopcode : 'Public user';
      Matomo.setCustomDimension(1, userWorkshop);
    }
  }

  removeCover = async (authorized) => {
    if (authorized) {
      this.setState({ userAuthorized: true });
      this.initiateHome();
      const shouldShowNotice = await FirebaseAPI.checkShowWeeklyNotice();
      setTimeout(() => {
        Animated.timing(this.state.animation, {
          toValue: 0,
          useNativeDriver: true,
          timing: 800,
        }).start(() => {
          this.setState({ showCover: false });
        });
        if (shouldShowNotice) {
          this.showNotice();
        }
      }, 4700);
    } else {
      setTimeout(() => {
        this.props.navigation.navigate('SignUp');
      }, 3000);
    }
  };

  showNotice = () => {
    setTimeout(() => {
      this.setState({ showNotice: true });
      setUserLastEnter();
    }, 5000);
  };

  hideNotice = () => {
    this.setState({ showNotice: false });
  };

  onMountain = (key, title, why, mountain) => {
    this.props.navigation.navigate('Mountain', {
      pkey: key,
      title: title,
      why: why,
      mountain: mountain,
    });
  };

  onNewChallenge = () => {
    this.props.navigation.navigate('Create');
  };

  goToDownloads = () => {
    this.props.navigation.navigate('Downloads');
  };

  onArrowPress = () => {
    this.myPanel.open();
  };

  handleHeartClick = async (key) => {
    await removeFav(key);
  };

  handleTopClick = () => {
    this.myPanel.close();
  };

  handleTopSwipe = (evt) => {
    let { nativeEvent } = evt;
    if (nativeEvent.state === State.ACTIVE) {
      this.myPanel.close();
    }
  };

  _handleNotification = (notification) => {
    if (notification.actionId == 'goToChallenges' && notification.origin == 'selected') {
      this.props.navigation.navigate('Challenges');
    }
  };

  getHeaderWidth(event) {
    let headerHeight = (event.nativeEvent.layout.width / 750) * 150;
    this.setState({
      headerWidth: event.nativeEvent.layout.width,
      headerHeight: headerHeight,
    });
  }

  renderBottomUpPanelContent = () => (
    <View
      style={{
        minHeight: this.state.isConnected ? WindowDimensions.height : 0,
      }}
    >
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          paddingLeft: 15,
          paddingRight: 15,
        }}
      >
        <NetworkConsumer>
          {({ isConnected }) =>
            isConnected ? (
              <View style={styles.meditationsArea}>
                {this.state.contentFavs.length > 0 ? (
                  <MeditationRow
                    meditations={this.state.contentFavs}
                    navigation={this.props.navigation}
                    title={translate('Home.favourites')}
                    icon={Images.iconHome}
                    handleHeartClick={this.handleHeartClick}
                    userPremium={this.state.premium}
                    lifetime={this.state.lifetime}
                  />
                ) : (
                  <View style={styles.meditationRowWrapper}>
                    <View style={styles.meditationRow}>
                      <Image
                        source={Images.iconHome}
                        style={{
                          tintColor: COLORS.orange,
                          width: 30,
                          height: 30,
                        }}
                      />
                      <Text style={styles.meditationRowTitle}>{translate('Home.favourites')}</Text>
                    </View>
                    <Text
                      style={{
                        fontFamily: 'Avenir-Book',
                        color: COLORS.gray,
                        marginTop: 15,
                        textAlign: 'center',
                        paddingLeft: 40,
                        paddingRight: 40,
                      }}
                    >
                      {translate('Home.press_any')}
                    </Text>
                  </View>
                )}
                <Text style={styles.meditationTitle}>{translate('Home.recommendations')}</Text>
                <MeditationRow
                  meditations={this.state.contentBreak}
                  navigation={this.props.navigation}
                  title={translate('Home.mindful_break')}
                  icon={Images.iconBreak}
                  handleHeartClick="0"
                  userPremium={this.state.premium}
                  lifetime={this.state.lifetime}
                />
                <MeditationRow
                  meditations={this.state.contentBreath}
                  navigation={this.props.navigation}
                  title={translate('Home.mindful_breath')}
                  icon={Images.iconBreath}
                  handleHeartClick="0"
                  userPremium={this.state.premium}
                  lifetime={this.state.lifetime}
                />
                <MeditationRow
                  meditations={this.state.contentWork}
                  navigation={this.props.navigation}
                  title={translate('Home.mindful_work')}
                  icon={Images.iconWork}
                  handleHeartClick="0"
                  userPremium={this.state.premium}
                  lifetime={this.state.lifetime}
                />
              </View>
            ) : null
          }
        </NetworkConsumer>
        <View style={[styles.meditationsArea, { alignSelf: 'stretch', marginTop: 10 }]}>
          <MeditationRow
            meditations={this.state.contentDownloads}
            navigation={this.props.navigation}
            title={translate('Home.downloads')}
            icon={'ios-cloud-download'}
            isIcon
            handleHeartClick="0"
            userPremium={this.state.premium}
            lifetime={this.state.lifetime}
          />
        </View>
      </View>
    </View>
  );

  renderBottomUpPanelIcon = () => <Ionicons name={'ios-arrow-up'} style={{ color: 'white' }} size={30} />;

  render() {
    const coverOpacity = {
      opacity: this.state.animation,
    };
    const { navigation } = this.props;
    const { headerHeight, showNotice } = this.state;

    return (
      <HomeContainer {...{ navigation }}>
        <WeeklyNotice show={showNotice} onClose={this.hideNotice} navigation={this.props.navigation} />
        <PanGestureHandler onHandlerStateChange={this.handleTopSwipe} activeOffsetY={[-80, 80]}>
          <View style={styles.tlexLogoWrapper}>
            <TouchableWithoutFeedback
              style={{ alignItems: 'center' }}
              onPress={() => {
                this.handleTopClick();
              }}
            >
              <Image source={Images.tlex_orig} style={styles.tlexLogo}></Image>
            </TouchableWithoutFeedback>
          </View>
        </PanGestureHandler>
        {this.state.showCover && <LoadingCover coverOpacity={coverOpacity} takeDeepBreath={this.state.takeDeepText} />}

        <View style={styles.bgImageWrapper}>
          <Image style={styles.bgImage} source={Images.home_bg}></Image>
          <Video
            source={require('../../assets/videos/puente.mp4')}
            style={styles.backgroundVideo}
            rate={1}
            shouldPlay={true}
            isLooping={true}
            volume={1}
            muted={true}
            resizeMode="cover"
          />
        </View>
        <BouncingArrow
          triggerAnimation={!this.state.showCover}
          showArrow={this.state.arrowVisible}
          onPress={this.onArrowPress}
        />
        {this.state.userAuthorized && (
          <BottomUpPanel
            content={this.renderBottomUpPanelContent}
            icon={this.renderBottomUpPanelIcon}
            topEnd={70}
            startHeight={this.state.panelHeight}
            dashMargin={this.state.dashMargin}
            panelOpened={this.panelOpened}
            panelClosed={this.panelClosed}
            challengeList={this.state.challengeList}
            triggerAnimation={!this.state.showCover}
            onMountain={this.onMountain}
            onNewChallenge={this.onNewChallenge}
            goToDownloads={this.goToDownloads}
            ref={(ref) => (this.myPanel = ref)}
            headerText={translate('Home.mindful_breath')}
            headerTextStyle={{
              color: 'white',
              fontSize: 15,
            }}
            bottomUpSlideBtn={{
              //borderTopLeftRadius: 30,
              //borderTopRightRadius: 30,
              display: 'flex',
              alignSelf: 'flex-start',
              //backgroundColor: COLORS.blue,
              //padding: 15
            }}
          ></BottomUpPanel>
        )}
      </HomeContainer>
    );
  }
}

class LoadingCover extends Component {
  constructor() {
    super();
    this.cloudPosition = new Animated.Value(-50);
    this.state = {
      cloudTop: 60,
    };
  }

  componentDidMount() {
    //this.animateCloud();
  }

  async animateCloud(time) {
    this.cloudPosition.setValue(-50);
    Animated.timing(this.cloudPosition, {
      toValue: WindowDimensions.width + 200,
      duration: 18000,
    }).start(() => {});
  }

  render() {
    const breath = {
      easing: 'ease-out-sine',
      0: {
        scale: 1,
      },
      0.4: {
        scale: 1.4,
      },
      0.6: {
        scale: 1.4,
      },
      1: {
        scale: 1,
      },
    };

    const { coverOpacity } = this.props;
    return (
      <Animated.View style={[styles.loadingCover, coverOpacity]}>
        <LinearGradient
          colors={[COLORS.white, COLORS.white]}
          style={styles.loadingGradient}
          start={[0.6, 0.8]}
          end={[0.3, 1]}
        >
          <Animatable.Text
            animation={breath}
            duration={7000}
            iterationCount="infinite"
            style={{
              textAlign: 'center',
              marginTop: 40,
              marginBottom: 30,
            }}
          >
            <Text style={styles.loadingText}>{this.props.takeDeepBreath}</Text>
          </Animatable.Text>
          {/* <Animated.Image
            source={require("../../assets/images/cloud.png")}
            resizeMode="contain"
            style={{ position: 'absolute', left: this.cloudPosition, top: this.state.cloudTop, zIndex: 4000, width: 200, height: 83, opacity: 0.7 }}
          /> */}
        </LinearGradient>
      </Animated.View>
    );
  }
}

class BouncingArrow extends React.PureComponent {
  constructor() {
    super();
    this.arrowValue = new Animated.Value(0);
    //this.fadeValue = new Animated.Value(1)
  }

  componentDidUpdate(prevProps, prevSate, snapshot) {
    if (prevProps.triggerAnimation !== this.props.triggerAnimation) {
      if (this.props.triggerAnimation) {
        setTimeout(() => {
          this.animateArrow();
        }, 2500);
      }
    }
  }

  fadeArrow() {
    this.fadeValue.setValue(1);
    Animated.timing(this.fadeValue, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
      easing: Easing.linear,
    }).start();
  }

  animateArrow() {
    this.arrowValue.setValue(0);
    Animated.loop(
      Animated.timing(this.arrowValue, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      { iterations: 3 }
    )
      .start
      // () => this.fadeArrow()
      ();
  }

  render() {
    const arrowBottom = this.arrowValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, -5, 0],
    });
    if (this.props.showArrow) {
      return (
        <Animated.View
          style={[
            styles.bounceArrow,
            {
              bottom: 190,
              opacity: this.fadeValue,
              alignContent: 'center',
            },
            { transform: [{ translateY: arrowBottom }] },
          ]}
        >
          <TouchableOpacity onPress={() => this.props.onPress()} style={{ alignItems: 'center' }}>
            <Ionicons name={'ios-arrow-up'} style={{ color: 'white' }} size={35} />
            <Text
              style={{
                color: COLORS.white,
                textAlign: 'center',
                fontFamily: 'Avenir-Black',
                fontSize: 14,
              }}
            >
              {translate('Home.swipe')}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      );
    } else {
      return null;
    }
  }
}

class MeditationThumb extends React.PureComponent {
  state = {
    itemVisible: true,
  };

  buyProduct = () => {
    this.props.navigation.navigate('BuyModal', { origin: 'home' });
  };

  promptBuy = () => {
    const title = 'Buy Premium Suscription';
    const message = 'Do you want to access premium content?';
    const buttons = [
      { text: 'Cancel', type: 'cancel' },
      { text: 'Suscribe', onPress: () => this.buyProduct() },
    ];
    Alert.alert(title, message, buttons);
  };

  onThumbClick(locked) {
    if (locked) {
      this.buyProduct();
    } else {
      if (this.props.type == 'audio') {
        this.props.navigation.navigate('Audios', {
          category: this.props.category,
          Description: this.props.Description,
          duration: this.props.duration,
          trainer: this.props.trainer,
          key: this.props.id,
          url: this.props.url,
          title: this.props.title,
          photo: urlimg + this.props.id + '_cover.jpg',
        });
      } else {
        this.props.navigation.navigate('Player', {
          category: this.props.category,
          Description: this.props.Description,
          duration: this.props.duration,
          trainer: this.props.trainer,
          key: this.props.id,
          title: this.props.title,
          photo: urlimg + this.props.id + '_cover.jpg',
        });
      }
    }
  }

  onFavClick = () => {
    this.props.handleHeartClick(this.props.id);
    this.setState({ itemVisible: false });
  };

  render() {
    let heartColor = COLORS.orange;
    const { premium, userPremium, lifetime } = this.props;
    let locked = true;
    if (userPremium || !premium || lifetime) {
      locked = false;
    }
    return (
      this.state.itemVisible && (
        <View style={styles.meditationThumb}>
          <TouchableOpacity activeOpacity={0.5} onPress={() => this.onThumbClick(locked)}>
            <CachedImage
              style={[styles.meditationThumbImage]}
              resizeMode="cover"
              source={{
                uri: urlimg + this.props.id + '_thumb.png',
              }}
              title={this.props.id + '_thumb'}
            ></CachedImage>
            <LockButton locked={locked} />
            {this.props.handleHeartClick != '0' ? (
              <FavButton handleFavPress={() => this.onFavClick()} heartColor={heartColor} />
            ) : null}
            <View style={styles.thumbTitle}></View>
            <Text style={styles.thumbTitleText}>{this.props.title}</Text>
          </TouchableOpacity>
        </View>
      )
    );
  }
}

class MeditationRow extends React.PureComponent {
  renderItem = (data) => (
    <MeditationThumb
      Description={data.Description}
      duration={data.Duration}
      trainer={data.Trainer}
      navigation={this.props.navigation}
      key={data.id}
      id={data.id}
      title={data.title}
      image={data.thumbnail}
      active={data.toggle}
      userPremium={this.props.userPremium}
      premium={data.Premium}
      lifetime={this.props.lifetime}
      handleHeartClick={this.props.handleHeartClick}
      type={data.Type}
      category={this.props.title}
    />
  );

  render() {
    const { meditations, title, icon, isIcon } = this.props;
    return (
      <View style={styles.meditationRowWrapper}>
        <View style={styles.meditationRow}>
          {isIcon ? (
            <Ionicons name={icon} color={COLORS.orange} size={25} />
          ) : (
            <Image
              source={icon}
              style={{
                width: 30,
                height: 30,
                tintColor: COLORS.orange,
              }}
            />
          )}
          {/* <Ionicons name={icon} style={{ color: COLORS.orange }} size={30} /> */}
          <Text style={styles.meditationRowTitle}>{title}</Text>
        </View>
        <FlatList
          // refresh={this.state.updateSelected}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          data={meditations}
          renderItem={({ item }) => this.renderItem(item)}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  bgImageWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  bgImage: {
    resizeMode: 'contain',
    flex: 1,
  },
  loginContainer: {
    alignItems: 'center',
    flexGrow: 0.95,
    justifyContent: 'center',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  header: {
    width: WindowDimensions.width,
    resizeMode: 'contain',
    flex: 1,
    position: 'absolute',
    top: 0,
    zIndex: 1000,
  },
  dashboard: {
    flex: 0.25,
    backgroundColor: 'red',
    borderRadius: 30,
    marginTop: -25,
  },
  loadingCover: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10000000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingGradient: {
    paddingTop: WindowDimensions.height / 5,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignSelf: 'stretch',
  },
  loadingText: {
    color: COLORS.blue,
    fontSize: 22,
    fontFamily: 'Avenir-Book',
  },
  meditationsArea: {
    marginTop: 0,
    flex: 1,
  },
  meditationThumb: {
    marginRight: 15,
  },
  meditationThumbImage: {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: 130,
    height: 140,
    opacity: 0.9,
    borderRadius: 15,
  },
  thumbTitle: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: '#000000',
    flexWrap: 'wrap',
    opacity: 0.5,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  thumbTitleText: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    flexShrink: 1,
    textAlign: 'center',
    color: COLORS.white,
    padding: 5,
  },
  meditationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 300,
    marginBottom: 15,
  },
  meditationRowWrapper: {
    height: 205,
    marginBottom: 20,
  },
  meditationRowTitle: {
    color: COLORS.gray,
    fontSize: 16,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  meditationTitle: {
    color: COLORS.gray,
    fontSize: 16,
    marginLeft: 10,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  btnFavWrapper: {
    position: 'absolute',
    top: 7,
    right: 7,
  },
  tlexLogoWrapper: {
    position: 'absolute',
    top: 5,
    left: 0,
    right: 0,
    alignItems: 'stretch',
    zIndex: 1000,
  },
  tlexLogo: {
    width: 98,
    height: 70,
    resizeMode: 'contain',
  },
  bounceArrow: {
    position: 'absolute',
    zIndex: 3000,
    left: 0,
    right: 0,
  },
});
